const express = require('express')
const FlashCardSet = require('../models/FlashCardSet')
const FlashCard = require('../models/FlashCard')
const Document = require('../models/Document')

const router = express.Router()

// Create new flashcard set
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, documentIds, flashCardIds, tags } = req.body

    // Validation
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'User ID and name are required'
      })
    }

    console.log(`📝 Creating flashcard set "${name}" for user ${userId}`)

    // Verify flashcards belong to user
    if (flashCardIds && flashCardIds.length > 0) {
      const validCards = await FlashCard.find({
        _id: { $in: flashCardIds },
        userId,
        isActive: true
      })

      if (validCards.length !== flashCardIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Some flashcards are invalid or do not belong to user'
        })
      }
    }

    const flashCardSet = new FlashCardSet({
      userId,
      name: name.trim(),
      description: description?.trim() || '',
      documentIds: documentIds || [],
      flashCardIds: flashCardIds || [],
      tags: tags || []
    })

    const savedSet = await flashCardSet.save()
    
    // Populate the set with flashcards and documents
    const populatedSet = await FlashCardSet.findById(savedSet._id)
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    console.log(`✅ Created flashcard set with ${populatedSet.stats.totalCards} cards`)

    res.json({
      success: true,
      flashCardSet: populatedSet
    })

  } catch (error) {
    console.error('❌ Error creating flashcard set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create flashcard set'
    })
  }
})



// Get user's flashcard sets
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      tags,
      isBookmarked
    } = req.query

    // Build filter
    const filter = { userId, isActive: true }
    if (tags) filter.tags = { $in: tags.split(',') }
    if (isBookmarked !== undefined) filter.isBookmarked = isBookmarked === 'true'

    // Build sort
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [sets, totalCount] = await Promise.all([
      FlashCardSet.find(filter)
        .populate('documentIds', 'originalName filePath')
        .populate('flashCardIds')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      FlashCardSet.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalCount / parseInt(limit))

    res.json({
      success: true,
      flashCardSets: sets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    })

  } catch (error) {
    console.error('❌ Error fetching flashcard sets:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcard sets'
    })
  }
})



// Get single flashcard set
router.get('/:setId', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId } = req.query

    const flashCardSet = await FlashCardSet.findOne({
      _id: setId,
      userId,
      isActive: true
    })
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    res.json({
      success: true,
      flashCardSet
    })

  } catch (error) {
    console.error('❌ Error fetching flashcard set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flashcard set'
    })
  }
})



// Update flashcard set
router.put('/:setId', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId, name, description, flashCardIds, tags, settings, isBookmarked } = req.body

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (tags) updateData.tags = tags
    if (settings) updateData.settings = { ...updateData.settings, ...settings }
    if (isBookmarked !== undefined) updateData.isBookmarked = isBookmarked

    // Handle flashcard updates
    if (flashCardIds) {
      // Verify flashcards belong to user
      const validCards = await FlashCard.find({
        _id: { $in: flashCardIds },
        userId,
        isActive: true
      })

      if (validCards.length !== flashCardIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Some flashcards are invalid or do not belong to user'
        })
      }

      updateData.flashCardIds = flashCardIds
    }

    const flashCardSet = await FlashCardSet.findOneAndUpdate(
      { _id: setId, userId, isActive: true },
      updateData,
      { new: true }
    )
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    res.json({
      success: true,
      flashCardSet
    })

  } catch (error) {
    console.error('❌ Error updating flashcard set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update flashcard set'
    })
  }
})



// Add flashcards to set
router.post('/:setId/cards', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId, flashCardIds } = req.body

    if (!flashCardIds || flashCardIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Flashcard IDs are required'
      })
    }

    // Verify flashcards belong to user
    const validCards = await FlashCard.find({
      _id: { $in: flashCardIds },
      userId,
      isActive: true
    })

    if (validCards.length !== flashCardIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some flashcards are invalid or do not belong to user'
      })
    }

    const flashCardSet = await FlashCardSet.findOneAndUpdate(
      { _id: setId, userId, isActive: true },
      { $addToSet: { flashCardIds: { $each: flashCardIds } } },
      { new: true }
    )
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    res.json({
      success: true,
      flashCardSet
    })

  } catch (error) {
    console.error('❌ Error adding flashcards to set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add flashcards to set'
    })
  }
})



// Remove flashcards from set
router.delete('/:setId/cards', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId, flashCardIds } = req.body

    if (!flashCardIds || flashCardIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Flashcard IDs are required'
      })
    }

    const flashCardSet = await FlashCardSet.findOneAndUpdate(
      { _id: setId, userId, isActive: true },
      { $pull: { flashCardIds: { $in: flashCardIds } } },
      { new: true }
    )
      .populate('flashCardIds')
      .populate('documentIds', 'originalName filePath')

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    res.json({
      success: true,
      flashCardSet
    })

  } catch (error) {
    console.error('❌ Error removing flashcards from set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to remove flashcards from set'
    })
  }
})


// Delete flashcard set (soft delete)
router.delete('/:setId', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId } = req.body

    const flashCardSet = await FlashCardSet.findOneAndUpdate(
      { _id: setId, userId },
      { isActive: false },
      { new: true }
    )

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    res.json({
      success: true,
      message: 'Flashcard set deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting flashcard set:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete flashcard set'
    })
  }
})


// Record study session
router.post('/:setId/study-session', async (req, res) => {
  try {
    const { setId } = req.params
    const { userId, studyTime, cardsReviewed, accuracy } = req.body

    const flashCardSet = await FlashCardSet.findOne({
      _id: setId,
      userId,
      isActive: true
    })

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: 'Flashcard set not found'
      })
    }

    // Update study statistics
    flashCardSet.stats.studySessions += 1
    flashCardSet.stats.lastStudied = new Date()
    flashCardSet.stats.totalStudyTime += studyTime || 0

    // Update average accuracy
    if (accuracy !== undefined) {
      const currentAccuracy = flashCardSet.stats.averageAccuracy
      const sessions = flashCardSet.stats.studySessions
      flashCardSet.stats.averageAccuracy = ((currentAccuracy * (sessions - 1)) + accuracy) / sessions
    }

    await flashCardSet.save()

    res.json({
      success: true,
      flashCardSet,
      message: 'Study session recorded successfully'
    })

  } catch (error) {
    console.error('❌ Error recording study session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to record study session'
    })
  }
})

module.exports = router
