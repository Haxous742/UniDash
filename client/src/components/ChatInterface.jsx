import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, Sparkles, Plus, MessageSquare, Trash2, Edit3, X, Check, Search, MoreVertical } from "lucide-react"
import MarkdownRenderer from "./MarkdownRenderer";
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { getUserChats, createChat, deleteChat, updateChat } from '../Api/chat'
import { getChatMessages, createMessage } from '../Api/message'
import toast from 'react-hot-toast'

const ChatInterface = ({ user }) => {
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const [newChatName, setNewChatName] = useState("")
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editingChatName, setEditingChatName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user's chats when component mounts
  useEffect(() => {
    console.log('User object in ChatInterface:', user)
    console.log('User ID:', user?._id)
    if (user?._id) {
      loadUserChats()
    }
  }, [user?._id])

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      loadChatMessages(currentChat._id)
    } else {
      setMessages([{
        id: 'welcome',
        content: "Hello! I'm UniDash AI 🤖 Create a new chat or select an existing one to start asking questions about your documents!",
        role: "assistant",
        createdAt: new Date(),
      }])
    }
  }, [currentChat])

  const loadUserChats = async () => {
    try {
      setLoadingChats(true)
      console.log('Loading chats for userId:', user._id)
      const response = await getUserChats(user._id)
      console.log('Load chats response:', response)
      
      if (response.success) {
        setChats(response.chats || [])
        // Auto-select the first chat if available
        if (response.chats && response.chats.length > 0) {
          setCurrentChat(response.chats[0])
        }
      } else {
        console.error('Failed to load chats:', response.error)
        toast.error('Failed to load chats')
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      })
      toast.error('Network error loading chats')
    } finally {
      setLoadingChats(false)
    }
  }

  const loadChatMessages = async (chatId) => {
    try {
      const response = await getChatMessages(chatId)
      if (response.success) {
        setMessages(response.messages || [])
      } else {
        console.error('Failed to load messages:', response.error)
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  const handleCreateChat = async () => {
    if (!newChatName.trim() || !user?._id) return
    
    try {
      const response = await createChat(user._id, newChatName.trim())
      if (response.success) {
        const newChat = response.chat
        setChats(prev => [newChat, ...prev])
        setCurrentChat(newChat)
        setNewChatName("")
        setShowNewChatModal(false)
      } else {
        console.error('Failed to create chat:', response.error)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleDeleteChat = async (chatId) => {
    if (!user?._id || !confirm('Are you sure you want to delete this chat?')) return
    
    try {
      const response = await deleteChat(chatId, user._id)
      if (response.success) {
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        if (currentChat?._id === chatId) {
          const remainingChats = chats.filter(chat => chat._id !== chatId)
          setCurrentChat(remainingChats.length > 0 ? remainingChats[0] : null)
        }
      } else {
        console.error('Failed to delete chat:', response.error)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleUpdateChat = async (chatId) => {
    if (!editingChatName.trim() || !user?._id) return
    
    try {
      const response = await updateChat(chatId, user._id, editingChatName.trim())
      if (response.success) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, name: editingChatName.trim() }
            : chat
        ))
        if (currentChat?._id === chatId) {
          setCurrentChat(prev => ({ ...prev, name: editingChatName.trim() }))
        }
        setEditingChatId(null)
        setEditingChatName("")
        toast.success('Chat renamed successfully!')
      } else {
        toast.error('Failed to rename chat')
      }
    } catch (error) {
      console.error('Error updating chat:', error)
      toast.error('Failed to rename chat')
    }
  }

  const handleDeleteChatWithConfirm = async (chatId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await deleteChat(chatId, user._id)
      if (response.success) {
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        if (currentChat?._id === chatId) {
          const remainingChats = chats.filter(chat => chat._id !== chatId)
          setCurrentChat(remainingChats.length > 0 ? remainingChats[0] : null)
        }
        toast.success('Chat deleted successfully!')
      } else {
        toast.error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const startNewChat = async () => {
    const defaultName = `Chat ${chats.length + 1}`
    
    try {
      console.log('Creating new chat with userId:', user._id, 'and name:', defaultName)
      const response = await createChat(user._id, defaultName)
      console.log('Create chat response:', response)
      
      if (response.success) {
        const newChat = response.chat
        setChats(prev => [newChat, ...prev])
        setCurrentChat(newChat)
        toast.success('New chat created!')
      } else {
        console.error('Failed to create chat:', response.error || response.message)
        toast.error(response.message || 'Failed to create new chat')
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Failed to create new chat')
    }
  }

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user?._id) return

    const userMessageContent = input.trim()
    setInput("")

    // If no current chat, create one automatically and then send the message
    if (!currentChat) {
      try {
        const defaultName = `Chat ${chats.length + 1}`
        console.log('Creating new chat for message with userId:', user._id, 'and name:', defaultName)
        const response = await createChat(user._id, defaultName)
        console.log('Create chat response:', response)
        
        if (response.success) {
          const newChat = response.chat
          setChats(prev => [newChat, ...prev])
          setCurrentChat(newChat)
          toast.success('New chat created!')
          
          // Now send the message to the new chat
          setTimeout(() => {
            sendMessage(userMessageContent, newChat)
          }, 100)
        } else {
          console.error('Failed to create chat:', response.error || response.message)
          toast.error(response.message || 'Failed to create new chat')
          // Restore the input
          setInput(userMessageContent)
        }
      } catch (error) {
        console.error('Error creating chat:', error)
        toast.error('Failed to create new chat')
        setInput(userMessageContent)
      }
      return
    }

    // Send message to existing chat
    await sendMessage(userMessageContent, currentChat)
  }

  const sendMessage = async (messageContent, chat) => {
    setIsLoading(true)

    try {
      console.log('Creating message with chatId:', chat._id, 'userId:', user._id, 'content:', messageContent)
      
      // Create user message in database
      const userMessageResponse = await createMessage(
        chat._id,
        user._id,
        messageContent,
        'user',
        'query'
      )

      console.log('User message response:', userMessageResponse)

      if (userMessageResponse.success) {
        const userMessage = userMessageResponse.data
        setMessages(prev => [...prev, userMessage])

        // Query AI
        try {
          const aiResponse = await axios.post("/api/query", {
            query: messageContent,
            userId: user._id,
          })

          console.log('AI response:', aiResponse.data)

          // Create AI response message in database
          const aiMessageResponse = await createMessage(
            chat._id,
            user._id,
            aiResponse.data.answer || 'Sorry, I could not process your request.',
            'assistant',
            'response',
            {
              processingTime: aiResponse.data.processingTime || 0,
              sources: aiResponse.data.sources || [],
              model: 'gpt-3.5-turbo'
            }
          )

          console.log('AI message response:', aiMessageResponse)

          if (aiMessageResponse.success) {
            const aiMessage = aiMessageResponse.data
            setMessages(prev => [...prev, aiMessage])
          } else {
            throw new Error('Failed to save AI response to database')
          }
        } catch (aiError) {
          console.error('AI query error:', aiError)
          // Still create a message in the database for the error
          const errorMessage = {
            id: `error-${Date.now()}`,
            content: "Sorry, I encountered an error while processing your question. Please make sure you have uploaded some documents first.",
            role: "assistant",
            createdAt: new Date(),
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } else {
        console.error('Failed to create user message:', userMessageResponse.error || userMessageResponse.message)
        toast.error('Failed to save message')
        // Restore the input
        setInput(messageContent)
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error while processing your message.",
        role: "assistant",
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
      setInput(messageContent)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-none mx-auto gap-4 px-4">
      {/* Chat Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full bg-gray-800/50 backdrop-blur-xl border-gray-700/50 shadow-2xl flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Your Chats
              </h3>
              <Button
                onClick={startNewChat}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto chat-sidebar-scroll">
              <div className="p-2 space-y-1">
                {loadingChats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="ml-2 text-gray-400">Loading chats...</span>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {chats.length === 0 ? (
                      <div>
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No chats yet</p>
                        <p className="text-sm mt-1">Start a new conversation!</p>
                      </div>
                    ) : (
                      <p>No chats match your search</p>
                    )}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredChats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 rounded-lg cursor-pointer mb-2 group transition-all duration-200 ${
                          currentChat?._id === chat._id
                            ? "bg-blue-600/20 border-l-4 border-blue-500"
                            : "bg-gray-700/30 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setCurrentChat(chat)}
                      >
                        <div className="flex items-center justify-between">
                          {editingChatId === chat._id ? (
                            <div className="flex items-center flex-1 gap-2">
                              <Input
                                value={editingChatName}
                                onChange={(e) => setEditingChatName(e.target.value)}
                                className="text-sm bg-gray-600/50 border-gray-500/50 text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateChat(chat._id)
                                  } else if (e.key === 'Escape') {
                                    setEditingChatId(null)
                                    setEditingChatName("")
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUpdateChat(chat._id)
                                }}
                                className="bg-green-600 hover:bg-green-700 p-1"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingChatId(null)
                                  setEditingChatName("")
                                }}
                                className="bg-gray-600 hover:bg-gray-700 p-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate text-sm">
                                  {chat.name}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1">
                                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : 'New'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingChatId(chat._id)
                                    setEditingChatName(chat.name)
                                  }}
                                  className="bg-gray-600 hover:bg-gray-700 p-1 text-gray-300"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => handleDeleteChatWithConfirm(chat._id, e)}
                                  className="bg-red-600 hover:bg-red-700 p-1 text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <Card className="h-full bg-gray-800/50 backdrop-blur-xl border-gray-700/50 shadow-2xl flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50 p-4">
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-blue-400" />
              {currentChat ? currentChat.name : 'UniDash AI'}
              <Sparkles className="w-5 h-5 text-purple-400" />
            </CardTitle>
            {currentChat && (
              <p className="text-center text-gray-400 text-sm mt-1">
                Chat started on {new Date(currentChat.createdAt).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 p-0 bg-gray-900/30 overflow-hidden">
            <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
              <div className="space-y-12 p-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message._id || message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 15 
                      }}
                      className={`flex w-full items-start ${
                        (message.role === "user" || message.sender === "user") ? "justify-end" : "justify-start"
                      }`}
                      style={{ gap: '11px' }}
                    >
                      {(message.role === "assistant" || message.sender === "bot" || (!message.role && !message.sender)) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-lg ${
                          (message.role === "user" || message.sender === "user")
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                            : "bg-gray-700/50 backdrop-blur-sm text-gray-100 rounded-bl-md border border-gray-600/50"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          {(message.role === "user" || message.sender === "user") ? (
                            <p className="mb-2 whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          ) : (
                            <MarkdownRenderer content={message.content} />
                          )}
                        </div>
                        <div
                        className={`text-xs mt-1 opacity-70 ${
                            (message.role === "user" || message.sender === "user") ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : (message.timestamp ? message.timestamp.toLocaleTimeString() : new Date().toLocaleTimeString())}
                        </div>
                      </div>

                      {(message.role === "user" || message.sender === "user") && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <User className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start"
                    style={{ gap: '11px' }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-700/50 backdrop-blur-sm text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-600/50">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm">Thinking...</span>
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            className="w-1 h-1 bg-blue-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="w-1 h-1 bg-blue-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="w-1 h-1 bg-blue-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4">
            <form onSubmit={handleSubmit} className="w-full flex gap-3">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentChat ? "Ask me anything about your documents..." : "Type a message to start a new chat..."}
                className="flex-1 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ChatInterface
