import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Upload, File, Check, X, Loader2, Cloud, Sparkles } from 'lucide-react'

const FileUpload = ({ onFileUploaded, user, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length > 0) {
      handleFiles(pdfFiles)
    }
  }

  const handleFiles = (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
    e.target.value = '' 
  }

  const uploadFile = async (fileItem) => {
    if (!user?._id) {
      console.error('User ID is required for upload');
      return;
    }

    const formData = new FormData()
    formData.append('file', fileItem.file)
    formData.append('userId', user._id)

    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress }
              : f
          ))
        }
      })

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ))

      onFileUploaded(fileItem.file.name)
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await uploadFile(file)
    }
    
    setUploading(false)
    
    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setFiles([])
  }

  return (
    <div className="space-y-8 mb-5">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/10 scale-105' 
            : 'border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-800/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-6">
          <motion.div 
            className="flex justify-center"
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <Upload className="w-10 h-10 text-blue-400" />
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Upload your study materials, research papers, or any PDF documents for AI analysis
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Cloud className="w-5 h-5" />
            <span className="font-semibold">Select Files</span>
          </motion.button>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Files to Upload</h3>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={uploadAllFiles}
                  disabled={uploading || !files.some(f => f.status === 'pending')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="font-medium">Upload All</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAll}
                  disabled={uploading}
                  className="bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {files.map((fileItem) => (
                  <motion.div
                    key={fileItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
                          <File className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{fileItem.file.name}</p>
                          <p className="text-gray-400">
                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {fileItem.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => uploadFile(fileItem)}
                            disabled={uploading}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                          >
                            Upload
                          </motion.button>
                        )}
                        
                        {fileItem.status === 'uploading' && (
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-blue-400 font-medium">
                              {fileItem.progress}%
                            </span>
                          </div>
                        )}
                        
                        {fileItem.status === 'success' && (
                          <div className="flex items-center space-x-2 text-green-400">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Uploaded</span>
                          </div>
                        )}
                        
                        {fileItem.status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <X className="w-5 h-5 text-red-400" />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => uploadFile(fileItem)}
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                            >
                              Retry
                            </motion.button>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFile(fileItem.id)}
                          disabled={uploading && fileItem.status === 'uploading'}
                          className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {fileItem.status === 'uploading' && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${fileItem.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
