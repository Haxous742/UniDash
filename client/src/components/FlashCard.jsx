import { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw, Bookmark, BookmarkCheck, Edit3, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

const FlashCard = ({ 
  flashcard, 
  onUpdate, 
  onDelete, 
  onReview,
  showActions = true,
  isStudyMode = false,
  autoFlip = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const formatText = (text) => {
    if (!text) return ''

    let cleaned = text.toString().trim()
    
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }
    
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'")
    
    return cleaned.trim()
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (isStudyMode) {
  
      setShowAnswer(!isFlipped)
    } else {
      setShowAnswer(!showAnswer)
    }
  }

  const handleBookmark = () => {
    onUpdate?.(flashcard._id, { 
      ...flashcard, 
      isBookmarked: !flashcard.isBookmarked 
    })
  }

  const handleAnswer = (isCorrect) => {
    const startTime = Date.now() - (window.cardStartTime || Date.now())
    onReview?.(flashcard._id, isCorrect, startTime)
    setIsFlipped(false)
    setShowAnswer(false)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        className="relative h-80 preserve-3d cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        onClick={handleFlip}
      >
        {/* Front of card - Question */}
        <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 shadow-xl">
          <CardContent className="h-full flex flex-col justify-between p-6">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flashcard.difficulty)}`}>
                {flashcard.difficulty}
              </span>
              {showActions && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark()
                  }}
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20"
                >
                  {flashcard.isBookmarked ? 
                    <BookmarkCheck className="w-4 h-4" /> : 
                    <Bookmark className="w-4 h-4" />
                  }
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Question</h3>
                <p className="text-gray-200 leading-relaxed">
                  {formatText(flashcard.question)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {flashcard.tags?.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Back of card - Answer */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 shadow-xl">
          <CardContent className="h-full flex flex-col justify-between p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">Answer</span>
                {flashcard.reviewStats?.reviewCount > 0 && (
                  <span className="text-xs text-gray-400">
                    Reviewed {flashcard.reviewStats.reviewCount} times
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-100 leading-relaxed">
                  {formatText(flashcard.answer) || 'No answer available'}
                </p>
              </div>
            </div>

            {isStudyMode && (
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAnswer(false)
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Incorrect
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAnswer(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Correct
                </Button>
              </div>
            )}

            {!isStudyMode && (
              <div className="flex justify-between items-center">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <div className="text-xs text-gray-400">
                  From: {flashcard.documentId?.originalName || 'Document'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action buttons for non-study mode */}
      {showActions && !isStudyMode && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate?.(flashcard._id)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete?.(flashcard._id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default FlashCard
