import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, Target, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import FlashCard from "./FlashCard"
import { recordStudySession } from "../Api/flashcards"
import toast from "react-hot-toast"

const StudyMode = ({ 
  flashCardSet, 
  onExit, 
  onReview,
  user 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [studyStartTime] = useState(Date.now())
  const [cardStartTime, setCardStartTime] = useState(Date.now())
  const [reviewedCards, setReviewedCards] = useState([])
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)

  const currentCard = flashCardSet.flashCardIds[currentCardIndex]
  const totalCards = flashCardSet.flashCardIds.length
  const progress = ((currentCardIndex + 1) / totalCards) * 100

  useEffect(() => {
    setCardStartTime(Date.now())
    window.cardStartTime = Date.now()
  }, [currentCardIndex])

  const handleReview = async (cardId, isCorrect, responseTime) => {
    try {
      await onReview?.(cardId, isCorrect, responseTime)
      
      setReviewedCards(prev => [...prev, { cardId, isCorrect, responseTime }])
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1)
      }

      if (currentCardIndex < totalCards - 1) {
        setCurrentCardIndex(prev => prev + 1)
      } else {
        await completeSession()
      }
    } catch (error) {
      console.error('Error recording review:', error)
      toast.error('Failed to record review')
    }
  }

  const completeSession = async () => {
    const studyTime = Math.floor((Date.now() - studyStartTime) / 1000)
    const accuracy = reviewedCards.length > 0 ? (correctAnswers / reviewedCards.length) * 100 : 0

    try {
      await recordStudySession(
        flashCardSet._id, 
        user._id, 
        studyTime, 
        reviewedCards.length, 
        Math.round(accuracy)
      )
      setSessionComplete(true)
      toast.success(`Study session complete! Accuracy: ${Math.round(accuracy)}%`)
    } catch (error) {
      console.error('Error recording study session:', error)
      setSessionComplete(true)
    }
  }

  const handleExit = () => {
    if (reviewedCards.length > 0 && !sessionComplete) {
      completeSession().then(() => onExit?.())
    } else {
      onExit?.()
    }
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (sessionComplete) {
    const studyTimeSeconds = Math.floor((Date.now() - studyStartTime) / 1000)
    const studyTimeMinutes = Math.floor(studyTimeSeconds / 60)
    const accuracy = reviewedCards.length > 0 ? (correctAnswers / reviewedCards.length) * 100 : 0

    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
              <p className="text-gray-300 mb-6">Great job studying {flashCardSet.name}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-medium">Cards Reviewed</p>
                  <p className="text-white text-2xl font-bold">{reviewedCards.length}</p>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm font-medium">Accuracy</p>
                  <p className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
                    {Math.round(accuracy)}%
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-400 text-sm font-medium">Study Time</p>
                  <p className="text-white text-2xl font-bold">
                    {studyTimeMinutes}:{(studyTimeSeconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleExit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Study
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{flashCardSet.name}</h1>
            <p className="text-gray-400">
              Card {currentCardIndex + 1} of {totalCards}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{correctAnswers}/{reviewedCards.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.floor((Date.now() - studyStartTime) / 1000 / 60)}m</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Flashcard */}
      <div className="flex justify-center mb-6">
        <FlashCard
          flashcard={currentCard}
          onReview={handleReview}
          isStudyMode={true}
          showActions={false}
        />
      </div>

      {/* Study Stats */}
      {reviewedCards.length > 0 && (
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">
                  Correct: {correctAnswers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">
                  Incorrect: {reviewedCards.length - correctAnswers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  Accuracy: {reviewedCards.length > 0 ? Math.round((correctAnswers / reviewedCards.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StudyMode
