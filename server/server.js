const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config();  

const db = require('./config/dbconfig');  

const { initPinecone } = require('./config/pinecone');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const app = require('./app');

const PORT = process.env.PORT;

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })

async function startServer() {
  try {
    // Initialize Pinecone
    await initPinecone()
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 StudyBot server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()