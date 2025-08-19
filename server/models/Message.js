const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'query', 'response'],
    default: 'text'
  },
  metadata: {
    sources: [{
      type: String
    }],
    documentReferences: [{
      documentId: String,
      documentName: String,
      relevanceScore: Number
    }],
    processingTime: {
      type: Number, 
      default: 0
    },
    model: {
      type: String,
      default: 'gemini-1.5-flash'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

MessageSchema.index({ chatId: 1, createdAt: 1 })
MessageSchema.index({ userId: 1, createdAt: -1 })
MessageSchema.index({ role: 1 })
MessageSchema.index({ messageType: 1 })

MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Message', MessageSchema)
