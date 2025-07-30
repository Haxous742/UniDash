const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require('@langchain/google-genai')
const { PineconeStore } = require('@langchain/pinecone')
const { PDFLoader } = require('langchain/document_loaders/fs/pdf')
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const { PromptTemplate } = require('@langchain/core/prompts')
const { getIndex } = require('../config/pinecone')

class RAGService {
  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'embedding-001'
    })
    
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'gemini-1.5-flash', // Alternative: 'gemini-1.5-pro' or 'gemini-pro-latest'
      temperature: 0.7,
      maxOutputTokens: 1024
    })

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\\n\\n', '\\n', ' ', '']
    })

    this.promptTemplate = PromptTemplate.fromTemplate(`
You are StudyBot, an AI assistant specialized in helping students learn from their uploaded documents. 
Use the provided context to answer the question accurately and comprehensively.

Context:
{context}

Question: {question}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't contain relevant information, say so politely
- Provide clear, well-structured responses
- Use examples from the context when helpful
- If asked about topics not in the context, acknowledge the limitation

Answer:`)
  }

  async processDocument(filePath, userId) {
    try {
      console.log(`📄 Processing document: ${filePath}`)
      
      // Load PDF
      const loader = new PDFLoader(filePath)
      const docs = await loader.load()
      console.log(`📚 Loaded ${docs.length} pages from PDF`)

      // Split documents into chunks
      const chunks = await this.textSplitter.splitDocuments(docs)
      console.log(`✂️  Split into ${chunks.length} chunks`)

      // Add metadata
      const chunksWithMetadata = chunks.map((chunk, index) => ({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          userId,
          chunkIndex: index,
          source: filePath,
          timestamp: new Date().toISOString()
        }
      }))

      // Get Pinecone index
      const pineconeIndex = getIndex()
      
      // Create vector store
      console.log('🔄 Creating embeddings and storing in Pinecone...')
      const vectorStore = await PineconeStore.fromDocuments(
        chunksWithMetadata,
        this.embeddings,
        {
          pineconeIndex,
          namespace: userId // Use userId as namespace for isolation
        }
      )

      console.log('✅ Document processed and stored successfully')
      return {
        success: true,
        chunks: chunks.length,
        vectorStore
      }
    } catch (error) {
      console.error('❌ Error processing document:', error)
      throw error
    }
  }

  async queryDocuments(query, userId) {
    try {
      console.log(`🔍 Querying documents for user: ${userId}`)
      console.log(`❓ Query: "${query}"`)

      // Get Pinecone index
      const pineconeIndex = getIndex()
      
      // Create vector store instance
      const vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex,
        namespace: userId
      })

      // Search for relevant documents
      console.log('🔄 Searching for relevant documents...')
      const relevantDocs = await vectorStore.similaritySearch(query, 5)
      
      console.log(`📋 Found ${relevantDocs.length} relevant documents`)

      if (relevantDocs.length === 0) {
        return {
          success: true,
          answer: "I couldn't find any relevant information in your uploaded documents to answer this question. Please make sure you have uploaded documents that contain information related to your query.",
          sources: 0
        }
      }

      // Combine context from relevant documents
      const context = relevantDocs.map((doc, index) => 
        `[Document ${index + 1}]\\n${doc.pageContent}`
      ).join('\\n\\n')

      console.log(`📝 Context length: ${context.length} characters`)

      // Generate prompt
      const prompt = await this.promptTemplate.format({
        context,
        question: query
      })

      // Get response from LLM
      console.log('🤖 Generating response...')
      const response = await this.llm.invoke(prompt)
      
      console.log('✅ Response generated successfully')

      return {
        success: true,
        answer: response.content,
        sources: relevantDocs.length,
        relevantDocs: relevantDocs.map(doc => ({
          content: doc.pageContent.substring(0, 200) + '...',
          source: doc.metadata.source,
          chunkIndex: doc.metadata.chunkIndex
        }))
      }
    } catch (error) {
      console.error('❌ Error querying documents:', error)
      throw error
    }
  }

  async getUserDocuments(userId) {
    try {
      const pineconeIndex = getIndex()
      
      // Query to get all vectors for this user (limited approach)
      const stats = await pineconeIndex.describeIndexStats()
      
      return {
        success: true,
        totalVectors: stats.namespaces?.[userId]?.vectorCount || 0
      }
    } catch (error) {
      console.error('❌ Error getting user documents:', error)
      throw error
    }
  }

  async deleteUserDocuments(userId) {
    try {
      console.log(`🗑️  Deleting all documents for user: ${userId}`)
      
      const pineconeIndex = getIndex()
      
      // Delete all vectors in the user's namespace
      await pineconeIndex.deleteAll(userId)
      
      console.log('✅ User documents deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting user documents:', error)
      throw error
    }
  }
}

module.exports = new RAGService()
