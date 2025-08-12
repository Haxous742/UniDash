const mongoose = require('mongoose')

const FlashCardSetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  documentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  flashCardIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashCard'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  settings: {
    studyMode: {
      type: String,
      enum: ['standard', 'spaced-repetition', 'quiz'],
      default: 'standard'
    },
    showAnswer: {
      type: Boolean,
      default: false
    },
    shuffleCards: {
      type: Boolean,
      default: true
    },
    autoAdvance: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalCards: {
      type: Number,
      default: 0
    },
    studySessions: {
      type: Number,
      default: 0
    },
    lastStudied: Date,
    averageAccuracy: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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


FlashCardSetSchema.index({ userId: 1, createdAt: -1 })
FlashCardSetSchema.index({ userId: 1, isActive: 1 })
FlashCardSetSchema.index({ userId: 1, isBookmarked: 1 })
FlashCardSetSchema.index({ userId: 1, 'stats.lastStudied': -1 })

FlashCardSetSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  this.stats.totalCards = this.flashCardIds.length
  next()
})

module.exports = mongoose.model('FlashCardSet', FlashCardSetSchema)
