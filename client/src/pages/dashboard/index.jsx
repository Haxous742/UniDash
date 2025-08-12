import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ChatInterface from '../../components/ChatInterface'
import FileUpload from '../../components/FileUpload'
import DocumentsList from '../../components/DocumentsList'
import FloatingParticles from '../../components/FloatingParticles'
import { User, Sparkles, Upload, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Handles the event when a file is uploaded by adding the file name 
 * to the list of uploaded files.
 *
 * @param {string} fileName - The name of the uploaded file to be added.
 */

/*******  2f7a59f5-eb1d-4e91-92bb-c2deaf45b449  *******/import { getUserDocuments } from '../../Api/documents';
import { getChatStats } from '../../Api/chat';
import { updateProfile } from '../../Api/user';
import toast from 'react-hot-toast';

function Dashboard ({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [documentCount, setDocumentCount] = useState(0)
  const [chatStats, setChatStats] = useState({ totalChats: 0, totalQueries: 0 })
  const [loadingStats, setLoadingStats] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    firstname: '',
    lastname: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const handleFileUploaded = (fileName) => {
    setUploadedFiles(prev => [...prev, fileName])
  }

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const fetchUserStats = async () => {
    if (!user?._id) {
      console.log('❌ No user ID found:', user)
      return
    }
    
    console.log('🔍 Fetching stats for user:', user._id)
    setLoadingStats(true)
    try {
      // Fetch document stats
      const docResponse = await getUserDocuments(user._id)
      console.log('📄 Document response:', docResponse)
      if (docResponse.success) {
        setDocumentCount(docResponse.documents?.length || 0)
      } else {
        console.error('Failed to fetch user documents:', docResponse.error)
        setDocumentCount(0)
      }
      
      // Fetch chat stats
      console.log('💬 Calling getChatStats for user:', user._id)
      const chatResponse = await getChatStats(user._id)
      console.log('💬 Chat stats response:', chatResponse)
      
      if (chatResponse.success) {
        console.log('✅ Chat stats data:', chatResponse.stats)
        setChatStats({
          totalChats: chatResponse.stats?.totalChats || 0,
          totalQueries: chatResponse.stats?.totalQueries || 0
        })
        console.log('📊 Setting chat stats:', {
          totalChats: chatResponse.stats?.totalChats || 0,
          totalQueries: chatResponse.stats?.totalQueries || 0
        })
      } else {
        console.error('❌ Failed to fetch chat stats:', chatResponse.error)
        setChatStats({ totalChats: 0, totalQueries: 0 })
      }
      
    } catch (error) {
      console.error('💥 Error fetching user stats:', error)
      setDocumentCount(0)
      setChatStats({ totalChats: 0, totalQueries: 0 })
    } finally {
      setLoadingStats(false)
      console.log('✅ Stats fetch complete')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(location.search);
    if (tab === 'chat') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate({ pathname: '/dashboard', search: params.toString() }, { replace: true });
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && (tab === 'chat' || tab === 'upload' || tab === 'profile')) {
      setActiveTab(tab);
    } else {
      setActiveTab('chat');
    }
  }, [location.search]);

  // Fetch user stats when profile tab is accessed or when documents are updated
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchUserStats()
    }
  }, [activeTab, user?._id])

  // Refresh stats when refreshTrigger updates (after uploads)
  useEffect(() => {
    if (refreshTrigger > 0 && activeTab === 'profile') {
      fetchUserStats()
    }
  }, [refreshTrigger])

  // Profile editing handlers
  const handleEditProfile = () => {
    setProfileFormData({
      firstname: user?.firstname || '',
      lastname: user?.lastname || ''
    })
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setProfileFormData({ firstname: '', lastname: '' })
  }

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!profileFormData.firstname.trim() || !profileFormData.lastname.trim()) {
      toast.error('Please fill in both first name and last name')
      return
    }

    setIsUpdatingProfile(true)
    try {
      const response = await updateProfile({
        firstname: profileFormData.firstname.trim(),
        lastname: profileFormData.lastname.trim()
      })

      if (response.success) {
        toast.success('Profile updated successfully!')
        setIsEditingProfile(false)
        
        window.location.reload()
      } else {
        toast.error(response.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('An error occurred while updating profile')
      console.error('Profile update error:', error)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="ml-20 min-h-screen">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 p-4 sticky top-0 z-40 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">Dashboard</span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full ml-2">AI</span>
            </div>
            <div className="flex items-center gap-4">
              <User className="w-7 h-7 text-gray-300" />
              <span className="text-gray-300 font-medium">
                {user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : user?.firstname || 'User'}
              </span>
            </div>
          </div>
        </motion.header>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl bg-gray-800/60 backdrop-blur-2xl shadow-2xl p-8"
              >
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">AI Chat Interface</h2>
                  </div>
                  <p className="text-gray-400">
                    Ask questions about your uploaded documents and get instant AI-powered answers.
                  </p>
                </div>
                <ChatInterface user={user} />
              </motion.div>
            )}
            
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl bg-gray-800/60 backdrop-blur-2xl shadow-2xl p-8"
              >
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Document Upload</h2>
                  </div>
                  <p className="text-gray-400">
                    Upload your PDF documents to enable AI-powered chat and analysis.
                  </p>
                </div>
                <div className="space-y-12">
                  <FileUpload 
                    onFileUploaded={handleFileUploaded} 
                    user={user}
                    onUploadComplete={handleUploadComplete}
                  />
                  <DocumentsList 
                    user={user}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl bg-gray-800/60 backdrop-blur-2xl shadow-2xl p-8"
              >
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Profile</h2>
                  </div>
                  <p className="text-gray-400">
                    View and manage your account information.
                  </p>
                </div>
                
                {/* User Avatar and Basic Info */}
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                      <User className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : 'User Name'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="capitalize">{user?.role || 'Student'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Personal Information</h4>
                          {!isEditingProfile && (
                            <button
                              onClick={handleEditProfile}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                        </div>
                        
                        {isEditingProfile ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                              <input
                                type="text"
                                name="firstname"
                                value={profileFormData.firstname}
                                onChange={handleProfileInputChange}
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter first name"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                              <input
                                type="text"
                                name="lastname"
                                value={profileFormData.lastname}
                                onChange={handleProfileInputChange}
                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter last name"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">Email</label>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Mail className="w-4 h-4 text-blue-400" />
                                {user?.email || 'N/A'} (Cannot be changed)
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={handleSaveProfile}
                                disabled={isUpdatingProfile}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isUpdatingProfile}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white text-sm rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                              <div className="text-white font-medium">{user?.firstname || 'N/A'}</div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                              <div className="text-white font-medium">{user?.lastname || 'N/A'}</div>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400 mb-1 block">Email</label>
                              <div className="flex items-center gap-2 text-white font-medium">
                                <Mail className="w-4 h-4 text-blue-400" />
                                {user?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Account Details */}
                      <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                        <h4 className="text-lg font-semibold text-white mb-4">Account Details</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">User ID</label>
                            <div className="text-white font-mono text-sm">{user?._id || user?.id || 'N/A'}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">Role</label>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-400" />
                              <span className="text-white font-medium capitalize">{user?.role || 'Student'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 mb-1 block">Member Since</label>
                            <div className="flex items-center gap-2 text-white font-medium">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activity Stats */}
                    <div className="mt-6 bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Activity Overview</h4>
                        <button 
                          onClick={fetchUserStats}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          disabled={loadingStats}
                        >
                          {loadingStats ? 'Loading...' : 'Refresh Stats'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {loadingStats ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                            ) : (
                              documentCount
                            )}
                          </div>
                          <div className="text-sm text-gray-400">Documents Uploaded</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {loadingStats ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto"></div>
                            ) : (
                              chatStats.totalChats
                            )}
                          </div>
                          <div className="text-sm text-gray-400">Chat Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {loadingStats ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                            ) : (
                              chatStats.totalQueries
                            )}
                          </div>
                          <div className="text-sm text-gray-400">AI Queries</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard;