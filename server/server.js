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

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initPinecone()
    
    app.listen(PORT, () => {
      console.log(`StudyBot server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()