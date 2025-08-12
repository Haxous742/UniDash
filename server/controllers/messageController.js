const express = require('express')
const Message = require('../models/Message')
const Chat = require('../models/Chat')

const router = express.Router()

// Get messages for a specific chat
router.get('/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query

    // Verify chat exists
    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      })
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const totalMessages = await Message.countDocuments({ chatId })

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: page * limit < totalMessages
      }
    })

  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    })
  }
})

// Create a new message
router.post('/messages', async (req, res) => {
  try {
    const { 
      chatId, 
      userId, 
      content, 
      role, 
      messageType = 'text',
      metadata = {} 
    } = req.body

    if (!chatId || !userId || !content || !role) {
      return res.status(400).json({
        success: false,
        error: 'Chat ID, User ID, content, and role are required'
      })
    }

    // Verify chat exists and belongs to user
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

    const message = new Message({
      chatId,
      userId,
      content: content.trim(),
      role,
      messageType,
      metadata
    })

    await message.save()

    // Update chat's message count and last message time
    await Chat.findByIdAndUpdate(chatId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date()
    })

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: message
    })

  } catch (error) {
    console.error('❌ Error creating message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create message'
    })
  }
})

// Delete a message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    const { userId } = req.body

    const message = await Message.findOneAndDelete({
      _id: messageId,
      userId
    })

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      })
    }

    // Update chat's message count
    await Chat.findByIdAndUpdate(message.chatId, {
      $inc: { messageCount: -1 }
    })

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting message:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    })
  }
})

// Search messages
router.get('/messages/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { q: query, chatId, page = 1, limit = 20 } = req.query

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      })
    }

    const searchFilter = {
      userId,
      content: { $regex: query, $options: 'i' }
    }

    if (chatId) {
      searchFilter.chatId = chatId
    }

    const messages = await Message.find(searchFilter)
      .populate('chatId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const totalResults = await Message.countDocuments(searchFilter)

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasMore: page * limit < totalResults
      }
    })

  } catch (error) {
    console.error('❌ Error searching messages:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search messages'
    })
  }
})

module.exports = router
