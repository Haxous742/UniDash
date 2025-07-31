import { useState, useRef } from 'react'
import axios from 'axios'
import { Upload, File, Check, X, Loader2 } from 'lucide-react'

const FileUpload = ({ onFileUploaded }) => {
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
      status: 'pending', // pending, uploading, success, error
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
    e.target.value = '' // Reset input
  }

  const uploadFile = async (fileItem) => {
    const formData = new FormData()
    formData.append('file', fileItem.file)
    formData.append('userId', 'student1')

    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      const response = await axios.post('http://localhost:4000/api/upload', formData, {
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
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setFiles([])
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
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
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-white">
              Drop PDF files here or click to browse
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Upload your study materials, research papers, or any PDF documents
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Files to Upload</h3>
            <div className="space-x-2">
              <button
                onClick={uploadAllFiles}
                disabled={uploading || !files.some(f => f.status === 'pending')}
                className="btn-primary flex items-center space-x-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Upload All</span>
              </button>
              <button
                onClick={clearAll}
                disabled={uploading}
                className="btn-secondary"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="font-medium text-white">{fileItem.file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {fileItem.status === 'pending' && (
                      <button
                        onClick={() => uploadFile(fileItem)}
                        disabled={uploading}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Upload
                      </button>
                    )}
                    
                    {fileItem.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-500">
                          {fileItem.progress}%
                        </span>
                      </div>
                    )}
                    
                    {fileItem.status === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    
                    {fileItem.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500" />
                        <button
                          onClick={() => uploadFile(fileItem)}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(fileItem.id)}
                      disabled={uploading && fileItem.status === 'uploading'}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {fileItem.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
