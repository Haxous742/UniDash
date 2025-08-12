import axios from 'axios'

const API_BASE_URL = '/api'

// Generate flashcards from document
export const generateFlashCards = async (documentId, userId, options = {}) => {
  try {
    console.log('Making API call to generate flashcards:', {
      url: `${API_BASE_URL}/flashcards/generate`,
      payload: { documentId, userId, options }
    })
    
    const response = await axios.post(`${API_BASE_URL}/flashcards/generate`, {
      documentId,
      userId,
      options
    })
    
    console.log('API response received:', response.data)
    return response.data
  } catch (error) {
    console.error('Error in generateFlashCards API call:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
}



// Get user's flashcards with filtering and pagination
export const getUserFlashCards = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flashcards/user/${userId}`, {
      params
    })
    return response.data
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    throw error
  }
}



// Get single flashcard by ID
export const getFlashCard = async (cardId, userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flashcards/${cardId}`, {
      params: { userId }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching flashcard:', error)
    throw error
  }
}



// Update flashcard
export const updateFlashCard = async (cardId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/flashcards/${cardId}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating flashcard:', error)
    throw error
  }
}



// Delete flashcard
export const deleteFlashCard = async (cardId, userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/flashcards/${cardId}`, {
      data: { userId }
    })
    return response.data
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    throw error
  }
}



// Record flashcard review
export const recordFlashCardReview = async (cardId, userId, isCorrect, responseTime) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flashcards/${cardId}/review`, {
      userId,
      isCorrect,
      responseTime
    })
    return response.data
  } catch (error) {
    console.error('Error recording review:', error)
    throw error
  }
}



// Get flashcard statistics
export const getFlashCardStats = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flashcards/stats/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching flashcard stats:', error)
    throw error
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create new flashcard set
export const createFlashCardSet = async (userId, name, description, documentIds, flashCardIds, tags) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flashcard-sets`, {
      userId,
      name,
      description,
      documentIds,
      flashCardIds,
      tags
    })
    return response.data
  } catch (error) {
    console.error('Error creating flashcard set:', error)
    throw error
  }
}



// Get user's flashcard sets
export const getUserFlashCardSets = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flashcard-sets/user/${userId}`, {
      params
    })
    return response.data
  } catch (error) {
    console.error('Error fetching flashcard sets:', error)
    throw error
  }
}



// Get single flashcard set
export const getFlashCardSet = async (setId, userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/flashcard-sets/${setId}`, {
      params: { userId }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching flashcard set:', error)
    throw error
  }
}



// Update flashcard set
export const updateFlashCardSet = async (setId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/flashcard-sets/${setId}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating flashcard set:', error)
    throw error
  }
}



// Add flashcards to set
export const addFlashCardsToSet = async (setId, userId, flashCardIds) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flashcard-sets/${setId}/cards`, {
      userId,
      flashCardIds
    })
    return response.data
  } catch (error) {
    console.error('Error adding flashcards to set:', error)
    throw error
  }
}



// Remove flashcards from set
export const removeFlashCardsFromSet = async (setId, userId, flashCardIds) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/flashcard-sets/${setId}/cards`, {
      data: { userId, flashCardIds }
    })
    return response.data
  } catch (error) {
    console.error('Error removing flashcards from set:', error)
    throw error
  }
}



// Delete flashcard set
export const deleteFlashCardSet = async (setId, userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/flashcard-sets/${setId}`, {
      data: { userId }
    })
    return response.data
  } catch (error) {
    console.error('Error deleting flashcard set:', error)
    throw error
  }
}



// Record study session
export const recordStudySession = async (setId, userId, studyTime, cardsReviewed, accuracy) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/flashcard-sets/${setId}/study-session`, {
      userId,
      studyTime,
      cardsReviewed,
      accuracy
    })
    return response.data
  } catch (error) {
    console.error('Error recording study session:', error)
    throw error
  }
}
