const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Document = require('../models/Document')
const ragService = require('../utils/langchain')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  }
})

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    console.log(`📤 File upload started: ${req.file.originalname}`)

    // Create document record
    const document = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId: userId,
      status: 'processing'
    })

    await document.save()
    console.log(`💾 Document record created: ${document._id}`)

    // Process document asynchronously
    processDocumentAsync(document, req.file.path, userId)

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully and is being processed',
      documentId: document._id,
      filename: req.file.originalname,
      size: req.file.size
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      error: error.message || 'File upload failed'
    })
  }
})

// Async function to process document
async function processDocumentAsync(document, filePath, userId) {
  try {
    console.log(`⚙️  Processing document: ${document.originalName}`)
    
    const result = await ragService.processDocument(filePath, userId)
    
    // Update document status
    document.status = 'completed'
    document.chunks = result.chunks
    document.processedAt = new Date()
    await document.save()
    
    console.log(`✅ Document processing completed: ${document.originalName}`)
    
  } catch (error) {
    console.error(`❌ Document processing failed: ${document.originalName}`, error)
    
    // Update document with error status
    document.status = 'error'
    document.error = error.message
    document.processedAt = new Date()
    await document.save()
  }
}

// Get user documents
router.get('/documents/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const documents = await Document.find({ userId })
      .select('-filePath') // Don't expose file paths
      .sort({ uploadedAt: -1 })
    
    res.json({
      success: true,
      documents,
      count: documents.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching documents:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    })
  }
})

// Delete document
router.delete('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params
    const { userId } = req.body
    
    const document = await Document.findOne({
      _id: documentId,
      userId: userId
    })
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      })
    }
    
    // Delete file if it exists
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath)
    }
    
    // Delete document record
    await Document.deleteOne({ _id: documentId })
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Error deleting document:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      })
    }
  }
  
  res.status(400).json({
    success: false,
    error: error.message
  })
})

module.exports = router
