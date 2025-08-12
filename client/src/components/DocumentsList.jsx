import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Clock, CheckCircle, XCircle, Calendar, FileIcon, AlertCircle } from 'lucide-react';
import { getUserDocuments, deleteDocument } from '../Api/documents';
import { Button } from './ui/button';

const DocumentsList = ({ user, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await getUserDocuments(user._id);
      if (response.success) {
        setDocuments(response.documents || []);
      } else {
        console.error('Failed to fetch documents:', response.error);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?._id, refreshTrigger]);

  const handleDelete = async (documentId) => {
    if (!user?._id) return;
    
    setDeleting(documentId);
    try {
      const response = await deleteDocument(documentId, user._id);
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      } else {
        console.error('Failed to delete document:', response.error);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-300">Loading documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Your Documents</h3>
          <p className="text-sm text-gray-400">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <Button
          onClick={fetchDocuments}
          variant="outline"
          size="sm"
          className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
        >
          Refresh
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400 mb-1">No documents uploaded yet</p>
          <p className="text-sm text-gray-500">Upload your first PDF document to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {documents.map((document) => (
              <motion.div
                key={document._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center justify-between p-4 bg-gray-600/20 rounded-xl border border-gray-600/30 hover:bg-gray-600/30 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {document.originalName}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(document.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          document.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          document.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          document.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {getStatusText(document.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                      {document.chunks > 0 && (
                        <span>{document.chunks} chunks</span>
                      )}
                    </div>
                    
                    {document.error && (
                      <p className="text-xs text-red-400 mt-1 truncate">
                        Error: {document.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 ml-3">
                  <Button
                    onClick={() => handleDelete(document._id)}
                    disabled={deleting === document._id}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                  >
                    {deleting === document._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
