const express = require('express')
const Chat = require('../models/Chat')
const Message = require('../models/Message')

const router = express.Router()

// Get all chats for a user
router.get('/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const chats = await Chat.find({ 
      userId
    })
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const totalChats = await Chat.countDocuments({ 
      userId
    })

    res.json({
      success: true,
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalChats / limit),
        totalChats,
        hasMore: page * limit < totalChats
      }
    })

  } catch (error) {
    console.error('❌ Error fetching chats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
    })
  }
})

// Get chat statistics for a user (MUST come before /:chatId route)
router.get('/chats/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params

    const totalChats = await Chat.countDocuments({ 
      userId
    })

    const totalMessages = await Message.countDocuments({ 
      userId 
    })

    const totalQueries = await Message.countDocuments({ 
      userId, 
      role: 'user' 
    })

    const recentActivity = await Chat.find({ 
      userId
    })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .select('name lastMessageAt messageCount')

    res.json({
      success: true,
      stats: {
        totalChats,
        totalMessages,
        totalQueries,
        recentActivity
      }
    })

  } catch (error) {
    console.error('❌ Error fetching chat stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat statistics'
    })
  }
})

// Get a specific chat by ID
router.get('/chats/:userId/:chatId', async (req, res) => {
  try {
    const { userId, chatId } = req.params

    const chat = await Chat.findOne({
      _id: chatId,
      userId
    })

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      })
    }

    res.json({
      success: true,
      chat
    })

  } catch (error) {
    console.error('❌ Error fetching chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat'
    })
  }
})

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    const { userId, name, description = '' } = req.body

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'User ID and chat name are required'
      })
    }

    const chat = new Chat({
      userId,
      name: name.trim(),
      description: description.trim()
    })

    await chat.save()

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    })

  } catch (error) {
    console.error('❌ Error creating chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create chat'
    })
  }
})

// Update a chat
router.put('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params
    const { userId, name, description } = req.body

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description.trim()

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      updateData,
      { new: true }
    )

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      })
    }

    res.json({
      success: true,
      message: 'Chat updated successfully',
      chat
    })

  } catch (error) {
    console.error('❌ Error updating chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update chat'
    })
  }
})

// Delete a chat (hard delete)
router.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params
    const { userId } = req.body

    // First verify the chat exists and belongs to the user
    const chat = await Chat.findOne({ _id: chatId, userId })
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      })
    }

    // Delete all messages associated with this chat
    const messageDeleteResult = await Message.deleteMany({ chatId })
    console.log(`🗑️ Deleted ${messageDeleteResult.deletedCount} messages from chat ${chatId}`)

    // Delete the chat itself
    await Chat.findByIdAndDelete(chatId)
    console.log(`🗑️ Deleted chat ${chatId} for user ${userId}`)

    res.json({
      success: true,
      message: 'Chat and all messages deleted successfully',
      deletedMessages: messageDeleteResult.deletedCount
    })

  } catch (error) {
    console.error('❌ Error deleting chat:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat'
    })
  }
})


module.exports = router
