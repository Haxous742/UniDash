const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
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


ChatSchema.index({ userId: 1, createdAt: -1 })
ChatSchema.index({ userId: 1, lastMessageAt: -1 })

ChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Chat', ChatSchema)
