import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  BookOpen, 
  Target, 
  Trophy, 
  Clock, 
  Filter,
  Search,
  Play,
  Sparkles,
  Brain,
  TrendingUp,
  Star,
  Calendar,
  Bookmark
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import FlashCardSet from "../../components/FlashCardSet"
import StudyMode from "../../components/StudyMode"
import Sidebar from "../../components/Sidebar"
import FloatingParticles from "../../components/FloatingParticles"
import { 
  generateFlashCards,
  recordFlashCardReview,
  getUserFlashCardSets,
  updateFlashCardSet,
  deleteFlashCardSet
} from "../../Api/flashcards"
import { getUserDocuments } from "../../Api/documents"
import toast from "react-hot-toast"

const FlashCardsDashboard = ({ user }) => {
  const [flashCardSets, setFlashCardSets] = useState([])
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [generatingCards, setGeneratingCards] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [currentStudySet, setCurrentStudySet] = useState(null)

  useEffect(() => {
    if (user?._id) {
      loadDashboardData()
    }
  }, [user?._id, showBookmarkedOnly])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [flashCardSetsRes, documentsRes] = await Promise.all([
        getUserFlashCardSets(user._id, { 
          page: currentPage,
          limit: 20,
          isBookmarked: showBookmarkedOnly || undefined,
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        }),
        getUserDocuments(user._id)
      ])

      if (flashCardSetsRes.success) {
        setFlashCardSets(flashCardSetsRes.flashCardSets || [])
        // Calculate stats from flashcard sets
        const sets = flashCardSetsRes.flashCardSets || []
        const totalSets = sets.length
        const totalCards = sets.reduce((sum, set) => sum + (set.stats?.totalCards || 0), 0)
        const bookmarkedSets = sets.filter(set => set.isBookmarked).length
        const totalSessions = sets.reduce((sum, set) => sum + (set.stats?.studySessions || 0), 0)
        
        setStats({
          totalSets,
          totalCards,
          bookmarkedSets,
          totalSessions
        })
      }

      if (documentsRes.success) {
        setDocuments(documentsRes.documents || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load flashcard sets data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFlashCards = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document first')
      return
    }

    if (!user || !user._id) {
      toast.error('User not found. Please log in again.')
      return
    }

    console.log('Starting flashcard generation:', {
      selectedDocument,
      userId: user._id,
      user: user
    })

    try {
      setGeneratingCards(true)
      const response = await generateFlashCards(selectedDocument, user._id, {
        maxCards: 6,
        difficulty: 'mixed'
      })

      console.log('Flashcard generation response:', response)

      if (response.success && response.flashCardSet) {
        toast.success(`Generated flashcard set with ${response.count} flashcards!`)
        setFlashCardSets(prev => [response.flashCardSet, ...prev])
        loadDashboardData() // Refresh to get updated stats
      } else {
        console.error('Unexpected response format:', response)
        toast.error(response.error || 'Failed to generate flashcards')
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        toast.error(error.response.data.error || 'Failed to generate flashcards')
      } else {
        toast.error('Network error. Please check your connection.')
      }
    } finally {
      setGeneratingCards(false)
    }
  }

  const handleUpdateFlashCardSet = async (setId, updateData) => {
    try {
      const response = await updateFlashCardSet(setId, {
        ...updateData,
        userId: user._id
      })

      if (response.success) {
        setFlashCardSets(prev => prev.map(set => 
          set._id === setId ? response.flashCardSet : set
        ))
        if (updateData.isBookmarked !== undefined) {
          toast.success(updateData.isBookmarked ? 'Set bookmarked!' : 'Bookmark removed')
        }
        if (updateData.name) {
          toast.success('Set name updated!')
        }
      }
    } catch (error) {
      console.error('Error updating flashcard set:', error)
      toast.error('Failed to update flashcard set')
    }
  }

  const handleDeleteFlashCardSet = async (setId) => {
    if (!confirm('Are you sure you want to delete this flashcard set? This will delete all cards in the set.')) return

    try {
      const response = await deleteFlashCardSet(setId, user._id)
      if (response.success) {
        setFlashCardSets(prev => prev.filter(set => set._id !== setId))
        toast.success('Flashcard set deleted')
        loadDashboardData() // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting flashcard set:', error)
      toast.error('Failed to delete flashcard set')
    }
  }

  const handleStartStudy = (flashCardSet) => {
    if (!flashCardSet?.flashCardIds || flashCardSet.flashCardIds.length === 0) {
      toast.error('No flashcards available in this set')
      return
    }

    setCurrentStudySet(flashCardSet)
    setShowStudyMode(true)
  }

  const handleStudyReview = async (cardId, isCorrect, responseTime) => {
    return recordFlashCardReview(cardId, user._id, isCorrect, responseTime)
  }

  const handleExitStudy = () => {
    setShowStudyMode(false)
    setCurrentStudySet(null)
    loadDashboardData() // Refresh stats after study session
  }

  const filteredFlashCardSets = flashCardSets.filter(set => {
    if (searchTerm && !set.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (showBookmarkedOnly && !set.isBookmarked) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (showStudyMode && currentStudySet) {
    return (
      <StudyMode
        flashCardSet={currentStudySet}
        onExit={handleExitStudy}
        onReview={handleStudyReview}
        user={user}
      />
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <Sidebar activeTab="flashcards" />
      
      <main className="ml-20 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              FlashCards Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Master your learning with AI-generated flashcards
            </p>
          </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Cards</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCards || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Total Sets</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSets || 0}</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Study Sessions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSessions || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Bookmarked</p>
                  <p className="text-2xl font-bold text-white">{stats.bookmarkedSets || 0}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Bar */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search flashcard sets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-white"
                />
              </div>
              
              <Button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`flex items-center gap-2 ${
                  showBookmarkedOnly 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {showBookmarkedOnly ? 'Show All' : 'Bookmarked Only'}
              </Button>

              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Document</option>
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.originalName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateFlashCards}
                disabled={!selectedDocument || generatingCards}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {generatingCards ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Cards
                  </>
                )}
              </Button>
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FlashCard Sets Grid */}
      {filteredFlashCardSets.length === 0 ? (
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {showBookmarkedOnly ? 'No bookmarked sets' : 'No flashcard sets yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {showBookmarkedOnly 
                ? "You haven't bookmarked any flashcard sets yet. Bookmark sets you want to study later!"
                : selectedDocument 
                  ? "Generate a flashcard set from your selected document to get started!"
                  : "Upload a document and generate flashcard sets to begin learning!"
              }
            </p>
            {!showBookmarkedOnly && documents.length > 0 && (
              <Button
                onClick={handleGenerateFlashCards}
                disabled={!selectedDocument}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Your First Flashcard Set
              </Button>
            )}
            {showBookmarkedOnly && (
              <Button
                onClick={() => setShowBookmarkedOnly(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Show All Sets
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <AnimatePresence>
            {filteredFlashCardSets.map((flashCardSet, index) => (
              <motion.div
                key={flashCardSet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <FlashCardSet
                  flashCardSet={flashCardSet}
                  onUpdate={handleUpdateFlashCardSet}
                  onDelete={handleDeleteFlashCardSet}
                  onStartStudy={handleStartStudy}
                  showActions={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
        </div>
      </main>
    </div>
  )
}

export default FlashCardsDashboard
