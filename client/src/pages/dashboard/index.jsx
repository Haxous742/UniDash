import { useState } from 'react'
import ChatInterface from '../../components/ChatInterface'
import FileUpload from '../../components/FileUpload'
import { BookOpen, MessageCircle, Upload } from 'lucide-react'

function Dashboard () {
  const [activeTab, setActiveTab] = useState('chat')
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFileUploaded = (fileName) => {
    setUploadedFiles(prev => [...prev, fileName])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold">StudyBot</h1>
          </div>
          <div className="text-sm text-gray-400">
            {uploadedFiles.length} documents uploaded
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors duration-200 ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors duration-200 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'upload' && <FileUpload onFileUploaded={handleFileUploaded} />}
      </main>
    </div>
  )
}

export default Dashboard;