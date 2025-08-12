const mongoose = require('mongoose')

const DocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  },
  chunks: {
    type: Number,
    default: 0
  },
  vectorIds: [{
    type: String
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  error: {
    type: String
  }
})

DocumentSchema.index({ userId: 1, uploadedAt: -1 })
DocumentSchema.index({ status: 1 })

module.exports = mongoose.model('Document', DocumentSchema)
