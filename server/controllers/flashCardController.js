const express = require('express')
const FlashCard = require('../models/FlashCard')
const FlashCardSet = require('../models/FlashCardSet')
const Document = require('../models/Document')
const ragService = require('../utils/langchain')

const router = express.Router()

// Generate flashcards from document
router.post('/generate', async (req, res) => {
  console.log('📥 POST /api/flashcards/generate - Request received')
  console.log('Request body:', req.body)
  
  try {
    const { documentId, userId, options = {} } = req.body

    // Validation
    if (!documentId || !userId) {
      console.log('❌ Validation failed: Missing documentId or userId')
      return res.status(400).json({
        success: false,
        error: 'Document ID and User ID are required'
      })
    }

    console.log(`🎯 Generating flashcards for document ${documentId} and user ${userId}`)

    // Check if document exists and belongs to user
    const document = await Document.findOne({ _id: documentId, userId })
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      })
    }

    // Generate flashcards using RAG service - limit to 6 cards
    const startTime = Date.now()
    const flashcardOptions = { ...options, maxCards: 6 }
    const flashcards = await ragService.generateFlashCards(documentId, userId, flashcardOptions)
    const processingTime = Date.now() - startTime

    // Debug: Log generated flashcards
    console.log('🔍 Debug: Generated flashcards from RAG service:')
    flashcards.slice(0, 6).forEach((card, index) => {
      console.log(`Card ${index + 1}:`)
      console.log(`  Question: ${card.question?.substring(0, 50)}...`)
      console.log(`  Answer: ${card.answer?.substring(0, 50)}...`)
      console.log(`  Has Answer: ${!!card.answer}`)
      console.log(`  Answer Type: ${typeof card.answer}`)
    })

    // Save flashcards to database
    const savedFlashCards = []
    for (const card of flashcards.slice(0, 6)) { // Ensure max 6 cards
      console.log(`💾 Saving card with answer: ${card.answer?.substring(0, 30)}...`)
      
      const flashCard = new FlashCard({
        userId,
        documentId,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium',
        tags: card.tags || [],
        sourceChunk: card.sourceChunk,
        metadata: {
          pageNumber: card.metadata?.pageNumber,
          chunkIndex: card.metadata?.chunkIndex,
          confidenceScore: card.metadata?.confidenceScore,
          source: document.originalName
        }
      })

      const saved = await flashCard.save()
      console.log(`✅ Saved card with ID: ${saved._id}, Answer: ${saved.answer?.substring(0, 30)}...`)
      savedFlashCards.push(saved)
    }

    // Create a flashcard set automatically
    const currentTime = new Date()
    const setName = `Flashcard Set - ${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}`
    
    const flashCardSet = new FlashCardSet({
      userId,
      name: setName,
      description: `Generated from ${document.originalName}`,
      documentIds: [documentId],
      flashCardIds: savedFlashCards.map(card => card._id),
      tags: []
    })

    const savedSet = await flashCardSet.save()
    
    // Populate the set with flashcards and documents
    const populatedSet = await FlashCardSet.findById(savedSet._id)
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    console.log(`✅ Generated flashcard set "${setName}" with ${savedFlashCards.length} cards in ${processingTime}ms`)

    res.json({
      success: true,
      flashCardSet: populatedSet,
      flashcards: savedFlashCards,
      count: savedFlashCards.length,
      processingTime,
      document: {
        id: document._id,
        name: document.originalName
      }
    })

  } catch (error) {
    console.error('❌ Error generating flashcards:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate flashcards',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})


// Get user's flashcards with filtering and pagination
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { 
      page = 1, 
      limit = 20, 
      difficulty, 
      documentId, 
      isBookmarked, 
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const filter = { userId, isActive: true }
    
    if (difficulty) filter.difficulty = difficulty
    if (documentId) filter.documentId = documentId
    if (isBookmarked !== undefined) filter.isBookmarked = isBookmarked === 'true'
    if (tags) filter.tags = { $in: tags.split(',') }

    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const [flashcards, totalCount] = await Promise.all([
      FlashCard.find(filter)
        .populate('documentId', 'originalName filePath')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      FlashCard.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / parseInt(limit))

    res.json({
      success: true,
      flashcards,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    })

  } catch (error) {
    console.error('Error fetching flashcards:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcards'
    })
  }
})


// Get user's flashcard statistics - MUST come before /:cardId route
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const stats = await FlashCard.aggregate([
      { $match: { userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          totalReviews: { $sum: '$reviewStats.reviewCount' },
          correctAnswers: { $sum: '$reviewStats.correctCount' },
          bookmarkedCards: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
          averageDifficulty: { $avg: { 
            $switch: {
              branches: [
                { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                { case: { $eq: ['$difficulty', 'hard'] }, then: 3 }
              ],
              default: 2
            }
          }},
          cardsByDifficulty: {
            $push: '$difficulty'
          }
        }
      }
    ])

    const result = stats[0] || {
      totalCards: 0,
      totalReviews: 0,
      correctAnswers: 0,
      bookmarkedCards: 0,
      averageDifficulty: 0
    }

    const difficultyCount = { easy: 0, medium: 0, hard: 0 }
    if (result.cardsByDifficulty) {
      result.cardsByDifficulty.forEach(diff => {
        difficultyCount[diff] = (difficultyCount[diff] || 0) + 1
      })
    }

    const accuracy = result.totalReviews > 0 ? 
      Math.round((result.correctAnswers / result.totalReviews) * 100) : 0

    res.json({
      success: true,
      stats: {
        totalCards: result.totalCards,
        totalReviews: result.totalReviews,
        correctAnswers: result.correctAnswers,
        accuracy,
        bookmarkedCards: result.bookmarkedCards,
        difficultyDistribution: difficultyCount
      }
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    })
  }
})


// Get single flashcard by ID
router.get('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params
    const { userId } = req.query

    const flashcard = await FlashCard.findOne({ 
      _id: cardId, 
      userId, 
      isActive: true 
    }).populate('documentId', 'originalName filePath')

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found'
      })
    }

    res.json({
      success: true,
      flashcard
    })

  } catch (error) {
    console.error('Error fetching flashcard:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcard'
    })
  }
})


// Update flashcard
router.put('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params
    const { userId, question, answer, difficulty, tags, isBookmarked } = req.body

    const updateData = {}
    if (question) updateData.question = question
    if (answer) updateData.answer = answer
    if (difficulty) updateData.difficulty = difficulty
    if (tags) updateData.tags = tags
    if (isBookmarked !== undefined) updateData.isBookmarked = isBookmarked

    const flashcard = await FlashCard.findOneAndUpdate(
      { _id: cardId, userId, isActive: true },
      updateData,
      { new: true }
    ).populate('documentId', 'originalName filePath')

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found'
      })
    }

    res.json({
      success: true,
      flashcard
    })

  } catch (error) {
    console.error('Error updating flashcard:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update flashcard'
    })
  }
})


// Delete flashcard (soft delete)
router.delete('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params
    const { userId } = req.body

    const flashcard = await FlashCard.findOneAndUpdate(
      { _id: cardId, userId },
      { isActive: false },
      { new: true }
    )

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found'
      })
    }

    res.json({
      success: true,
      message: 'Flashcard deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting flashcard:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete flashcard'
    })
  }
})


// Record flashcard review
router.post('/:cardId/review', async (req, res) => {
  try {
    const { cardId } = req.params
    const { userId, isCorrect, responseTime } = req.body

    const flashcard = await FlashCard.findOne({ 
      _id: cardId, 
      userId, 
      isActive: true 
    })

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard not found'
      })
    }

    flashcard.reviewStats.reviewCount += 1
    if (isCorrect) {
      flashcard.reviewStats.correctCount += 1
    }
    flashcard.reviewStats.lastReviewed = new Date()

    if (isCorrect) {
      flashcard.reviewStats.interval = Math.ceil(
        flashcard.reviewStats.interval * flashcard.reviewStats.easeFactor
      )
      flashcard.reviewStats.easeFactor = Math.max(
        1.3, 
        flashcard.reviewStats.easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02))
      )
    } else {
      flashcard.reviewStats.interval = 1
      flashcard.reviewStats.easeFactor = Math.max(1.3, flashcard.reviewStats.easeFactor - 0.2)
    }

    flashcard.reviewStats.nextReview = new Date(Date.now() + flashcard.reviewStats.interval * 24 * 60 * 60 * 1000)

    await flashcard.save()

    res.json({
      success: true,
      flashcard,
      reviewStats: flashcard.reviewStats
    })

  } catch (error) {
    console.error('Error recording review:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record review'
    })
  }
})


module.exports = router
