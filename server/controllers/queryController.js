const express = require('express')
const ragService = require('../utils/langchain')

const router = express.Router()

// Query endpoint
router.post('/query', async (req, res) => {
  try {
    const { query, userId } = req.body

    // Validation
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      })
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    console.log(`🔍 Query received from user ${userId}: "${query}"`)

    // Query documents using RAG service
    const startTime = Date.now()
    const result = await ragService.queryDocuments(query.trim(), userId)
    const processingTime = Date.now() - startTime

    console.log(`⏱️  Query processed in ${processingTime}ms`)

    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      processingTime,
      relevantDocs: result.relevantDocs || []
    })

  } catch (error) {
    console.error('❌ Query processing error:', error)

    let statusCode = 500
    let errorMessage = 'Failed to process query'

    // Handle specific error types
    if (error.message.includes('API key')) {
      statusCode = 401
      errorMessage = 'Invalid API configuration'
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      statusCode = 429
      errorMessage = 'Service temporarily unavailable due to rate limits'
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      statusCode = 503
      errorMessage = 'Service temporarily unavailable'
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})



// Get user's document statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const stats = await ragService.getUserDocuments(userId)

    res.json({
      success: true,
      userId,
      totalVectors: stats.totalVectors,
      retrievedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    })
  }
})



// Delete all user documents from vector store
router.delete('/documents/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { confirmDelete } = req.body

    if (!confirmDelete) {
      return res.status(400).json({
        success: false,
        error: 'Deletion must be confirmed'
      })
    }

    console.log(`🗑️  Delete all documents requested for user: ${userId}`)

    await ragService.deleteUserDocuments(userId)

    res.json({
      success: true,
      message: 'All documents deleted successfully from vector store'
    })

  } catch (error) {
    console.error('❌ Error deleting user documents:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete user documents'
    })
  }
})



// Test endpoint for development
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Query service is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})


module.exports = router
