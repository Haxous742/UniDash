import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Edit3, 
  Trash2, 
  Calendar,
  Clock,
  Target,
  BookOpen
} from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const FlashCardSet = ({ 
  flashCardSet, 
  onUpdate, 
  onDelete, 
  onStartStudy,
  showActions = true
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(flashCardSet.name)

  const handleBookmark = () => {
    onUpdate?.(flashCardSet._id, { 
      ...flashCardSet, 
      isBookmarked: !flashCardSet.isBookmarked 
    })
  }

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== flashCardSet.name) {
      onUpdate?.(flashCardSet._id, { 
        ...flashCardSet, 
        name: editedName.trim() 
      })
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setEditedName(flashCardSet.name)
      setIsEditing(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyPress}
                  className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white text-lg font-semibold w-full"
                  autoFocus
                />
              ) : (
                <CardTitle 
                  className="text-white text-lg cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {flashCardSet.name}
                </CardTitle>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {flashCardSet.description || 'No description'}
              </p>
            </div>
            
            {showActions && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleBookmark}
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20"
                >
                  {flashCardSet.isBookmarked ? 
                    <BookmarkCheck className="w-4 h-4" /> : 
                    <Bookmark className="w-4 h-4" />
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete?.(flashCardSet._id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-blue-400 text-xs font-medium">Cards</p>
                <p className="text-white text-sm font-bold">{flashCardSet.stats.totalCards}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
              <Target className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-green-400 text-xs font-medium">Sessions</p>
                <p className="text-white text-sm font-bold">{flashCardSet.stats.studySessions || 0}</p>
              </div>
            </div>
          </div>

          {/* Last Studied & Accuracy */}
          <div className="space-y-2 mb-4">
            {flashCardSet.stats.lastStudied && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>Last studied: {formatDate(flashCardSet.stats.lastStudied)}</span>
              </div>
            )}
            
            {flashCardSet.stats.averageAccuracy > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">Accuracy: </span>
                <span className={getAccuracyColor(flashCardSet.stats.averageAccuracy)}>
                  {Math.round(flashCardSet.stats.averageAccuracy)}%
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Created: {formatDate(flashCardSet.createdAt)}</span>
            </div>
          </div>

          {/* Tags */}
          {flashCardSet.tags && flashCardSet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {flashCardSet.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
                >
                  {tag}
                </span>
              ))}
              {flashCardSet.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
                  +{flashCardSet.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onStartStudy?.(flashCardSet)}
            disabled={flashCardSet.stats.totalCards === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Study Set ({flashCardSet.stats.totalCards} cards)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FlashCardSet
