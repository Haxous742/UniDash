const mongoose = require('mongoose')

const FlashCardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  sourceChunk: {
    type: String,
    required: true
  },
  metadata: {
    pageNumber: Number,
    chunkIndex: Number,
    confidenceScore: Number,
    source: String
  },
  reviewStats: {
    reviewCount: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    },
    lastReviewed: Date,
    nextReview: Date,
    easeFactor: {
      type: Number,
      default: 2.5
    },
    interval: {
      type: Number,
      default: 1
    }
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


FlashCardSchema.index({ userId: 1, createdAt: -1 })
FlashCardSchema.index({ userId: 1, documentId: 1 })
FlashCardSchema.index({ userId: 1, difficulty: 1 })
FlashCardSchema.index({ userId: 1, isBookmarked: 1 })
FlashCardSchema.index({ 'reviewStats.nextReview': 1, userId: 1 })

FlashCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('FlashCard', FlashCardSchema)
