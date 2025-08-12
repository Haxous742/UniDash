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
      modelName: 'gemini-1.5-flash', 
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



    this.flashcardPrompt = PromptTemplate.fromTemplate(`
You are an educational content creator specializing in generating effective flashcards for student learning.
Based on the provided document content, create clear, educational flashcards that test key concepts, definitions, and important information.

Document Content:
{content}

Instructions:
- Generate 5-10 high-quality flashcards
- Create clear, specific questions that test understanding
- Provide comprehensive but concise answers
- Focus on key concepts, definitions, facts, and relationships
- Vary difficulty levels (easy, medium, hard)
- Include relevant tags/topics for each card
- Ensure questions are answerable from the provided content

Generate flashcards in this exact JSON format:
[
  {{
    "question": "Clear, specific question",
    "answer": "Comprehensive but concise answer",
    "difficulty": "easy|medium|hard",
    "tags": ["tag1", "tag2"],
    "sourceChunk": "Original text excerpt this card is based on"
  }}
]

Flashcards:`)
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


  async generateFlashCards(documentId, userId, options = {}) {
    try {
      console.log(`🎯 Generating flashcards for document ${documentId}`)
      
      const { 
        maxCards = 8,
        difficulty = 'mixed',
        focusTopics = null
      } = options

      // Get Pinecone index
      const pineconeIndex = getIndex()
      
      // Create vector store instance
      const vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex,
        namespace: userId
      })

      // Get document chunks from vector store
      // We'll search for general concepts to get a good sample of content
      const searchQueries = focusTopics || [
        'definition concept explanation',
        'important key main',
        'process method approach',
        'example case study',
        'theory principle rule'
      ]

      let allRelevantChunks = []
      
      for (const query of searchQueries) {
        try {
          const chunks = await vectorStore.similaritySearch(query, 3)
          allRelevantChunks.push(...chunks)
        } catch (error) {
          console.log(`⚠️  Error searching for "${query}":`, error.message)
        }
      }

      // Remove duplicates and limit chunks
      const uniqueChunks = allRelevantChunks.filter((chunk, index, arr) => 
        arr.findIndex(c => c.pageContent === chunk.pageContent) === index
      ).slice(0, Math.max(5, Math.ceil(maxCards / 2)))

      console.log(`📚 Found ${uniqueChunks.length} unique chunks for flashcard generation`)

      if (uniqueChunks.length === 0) {
        throw new Error('No document content found for flashcard generation')
      }

      // Combine content from chunks
      const combinedContent = uniqueChunks.map((chunk, index) => 
        `[Chunk ${index + 1}]\n${chunk.pageContent}`
      ).join('\n\n')

      console.log(`📝 Combined content length: ${combinedContent.length} characters`)

      // Generate flashcard prompt
      const prompt = await this.flashcardPrompt.format({
        content: combinedContent
      })

      // Generate flashcards using LLM
      console.log('🤖 Generating flashcards...')
      const response = await this.llm.invoke(prompt)
      
      console.log('📄 Raw LLM response:', response.content.substring(0, 200) + '...')

      // Parse flashcards using regex instead of JSON parsing
      console.log('🔍 Extracting flashcards using regex patterns...')
      const flashcards = this.extractFlashcardsFromText(response.content, uniqueChunks)

      // Validate and enhance flashcards
      const validFlashcards = flashcards
        .filter(card => card.question && card.answer)
        .slice(0, maxCards)
        .map((card, index) => ({
          question: card.question.trim(),
          answer: card.answer.trim(),
          difficulty: card.difficulty || 'medium',
          tags: card.tags || ['general'],
          sourceChunk: card.sourceChunk || uniqueChunks[index % uniqueChunks.length]?.pageContent?.substring(0, 500) || '',
          metadata: {
            chunkIndex: index % uniqueChunks.length,
            confidenceScore: 0.8,
            pageNumber: uniqueChunks[index % uniqueChunks.length]?.metadata?.page || 1
          }
        }))

      console.log(`✅ Generated ${validFlashcards.length} valid flashcards`)

      return validFlashcards
    } catch (error) {
      console.error('❌ Error generating flashcards:', error)
      throw error
    }
  }


  extractFlashcardsFromText(text, chunks) {
    const flashcards = []
    console.log('🔍 Extracting flashcards from text response...')
    
    // Remove code block markers
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
    
    // Pattern 1: Extract "question": "...", "answer": "..." pairs using regex
    const questionAnswerRegex = /"question"\s*:\s*"([^"]*)",?\s*"answer"\s*:\s*"([^"]*)"/gi
    let matches = [...cleanText.matchAll(questionAnswerRegex)]
    
    console.log(`📅 Found ${matches.length} question-answer pairs using regex`)
    
    matches.forEach((match, index) => {
      const question = match[1]?.trim()
      const answer = match[2]?.trim()
      
      if (question && answer) {
        flashcards.push({
          question: question,
          answer: answer,
          difficulty: 'medium',
          tags: ['general'],
          sourceChunk: chunks[index % chunks.length]?.pageContent?.substring(0, 500) || ''
        })
      }
    })
    
    // Pattern 2: If no matches, try line-by-line approach
    if (flashcards.length === 0) {
      console.log('🗒 Trying line-by-line extraction...')
      const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      for (let i = 0; i < lines.length - 1; i++) {
        const currentLine = lines[i]
        const nextLine = lines[i + 1]
        
        // Look for patterns like "What is...?" followed by an answer
        if (currentLine.includes('?') && !nextLine.includes('?') && nextLine.length > 10) {
          // Extract question by removing common prefixes
          let question = currentLine
            .replace(/^\s*[\d.-]+\s*/, '') // Remove numbering
            .replace(/^\s*"question"\s*:\s*"/i, '') // Remove "question":
            .replace(/^\s*\{?\s*"question"\s*:\s*"/i, '') // Remove {"question":
            .replace(/"\s*,?\s*$/, '') // Remove trailing quotes and commas
            .trim()
            
          // Extract answer
          let answer = nextLine
            .replace(/^\s*"answer"\s*:\s*"/i, '') // Remove "answer":
            .replace(/"\s*,?\s*\}?\s*$/, '') // Remove trailing quotes, commas, braces
            .trim()
            
          if (question.length > 5 && answer.length > 5) {
            flashcards.push({
              question: question,
              answer: answer,
              difficulty: 'medium',
              tags: ['general'],
              sourceChunk: chunks[flashcards.length % chunks.length]?.pageContent?.substring(0, 500) || ''
            })
          }
        }
      }
    }
    
    // Pattern 3: Create basic flashcards from document content if still nothing found
    if (flashcards.length === 0) {
      console.log('🔨 Creating basic flashcards from document chunks as last resort...')
      chunks.slice(0, 3).forEach((chunk, index) => {
        const content = chunk.pageContent.trim()
        if (content.length > 100) {
          // Find the first sentence that's substantial
          const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 30)
          if (sentences.length >= 1) {
            const firstSentence = sentences[0].trim()
            const restContent = sentences.slice(1, 2).join('. ').trim()
            
            flashcards.push({
              question: `Based on the document, what can you tell me about: "${firstSentence.substring(0, 80)}..."?`,
              answer: restContent || firstSentence,
              difficulty: 'medium',
              tags: ['general'],
              sourceChunk: content.substring(0, 500)
            })
          }
        }
      })
    }
    
    console.log(`✅ Successfully extracted ${flashcards.length} flashcards`)
    flashcards.forEach((card, i) => {
      console.log(`Card ${i + 1}: Q: ${card.question.substring(0, 50)}... A: ${card.answer.substring(0, 50)}...`)
    })
    
    return flashcards.slice(0, 6)
  }


  parseFlashcardsFromText(text, chunks) {
    console.log('🔄 Using fallback method to parse flashcards from text')
    const flashcards = []
    
    // Try to extract JSON objects even if malformed
    const jsonObjectRegex = /\{[^{}]*"question"[^{}]*"answer"[^{}]*\}/g
    let matches = text.match(jsonObjectRegex)
    
    if (matches) {
      console.log(`📋 Found ${matches.length} potential JSON objects`)
      matches.forEach((match, index) => {
        try {
          // Try to fix common JSON issues
          let fixedMatch = match
            .replace(/"/g, '"')  // Fix smart quotes
            .replace(/'/g, "'")   // Fix smart quotes
            .replace(/([^,\}])\s*\n\s*(["'])/g, '$1,$2') // Add missing commas
          
          const parsed = JSON.parse(fixedMatch)
          if (parsed.question && parsed.answer) {
            flashcards.push({
              question: parsed.question.trim(),
              answer: parsed.answer.trim(),
              difficulty: parsed.difficulty || 'medium',
              tags: parsed.tags || ['general'],
              sourceChunk: parsed.sourceChunk || chunks[index % chunks.length]?.pageContent?.substring(0, 500) || ''
            })
          }
        } catch (error) {
          console.log(`⚠️ Failed to parse JSON object ${index + 1}:`, error.message)
        }
      })
    }
    
    // If JSON extraction failed, try simpler pattern matching
    if (flashcards.length === 0) {
      console.log('📝 Falling back to simple pattern matching')
      const lines = text.split('\n').filter(line => line.trim())
      
      // Look for question/answer patterns
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim()
        const nextLine = lines[i + 1]?.trim()
        
        // Check if line contains "question" and next line contains "answer"
        if ((line.toLowerCase().includes('question') || line.includes('?')) && 
            nextLine && (nextLine.toLowerCase().includes('answer') || !nextLine.includes('?'))) {
          
          const question = line.replace(/^[\d.-]*\s*"?question"?\s*:?\s*/i, '').replace(/["',]*$/, '').trim()
          const answer = nextLine.replace(/^[\d.-]*\s*"?answer"?\s*:?\s*/i, '').replace(/["',]*$/, '').trim()
          
          if (question && answer) {
            flashcards.push({
              question: question,
              answer: answer,
              difficulty: 'medium',
              tags: ['general'],
              sourceChunk: chunks[flashcards.length % chunks.length]?.pageContent?.substring(0, 500) || ''
            })
          }
        }
      }
    }
    
    // If still no flashcards, create some basic ones from the document chunks
    if (flashcards.length === 0) {
      console.log('🔧 Creating basic flashcards from document chunks')
      chunks.slice(0, 3).forEach((chunk, index) => {
        const content = chunk.pageContent.trim()
        if (content.length > 50) {
          const sentences = content.split('.').filter(s => s.trim().length > 20)
          if (sentences.length >= 2) {
            flashcards.push({
              question: `What is described in the following context: "${sentences[0].trim()}"?`,
              answer: sentences.slice(1, 3).join('. ').trim() + '.',
              difficulty: 'medium',
              tags: ['general'],
              sourceChunk: content.substring(0, 500)
            })
          }
        }
      })
    }
    
    console.log(`✅ Fallback method generated ${flashcards.length} flashcards`)
    return flashcards.slice(0, 6) // Limit fallback cards
  }

  // Method to select diverse chunks from a document for better flashcard variety
  selectDiverseChunks(chunks, maxChunks) {
    if (chunks.length <= maxChunks) {
      console.log(`📄 Using all ${chunks.length} available chunks`)
      return chunks
    }

    // Sort chunks by their chunk index to get them in document order
    const sortedChunks = chunks.sort((a, b) => {
      const indexA = a.metadata.chunkIndex || 0
      const indexB = b.metadata.chunkIndex || 0
      return indexA - indexB
    })

    console.log(`📄 Selecting ${maxChunks} diverse chunks from ${chunks.length} available chunks`)

    // Select chunks evenly distributed throughout the document
    const selectedChunks = []
    const step = Math.floor(sortedChunks.length / maxChunks)
    
    for (let i = 0; i < maxChunks; i++) {
      const index = Math.min(i * step, sortedChunks.length - 1)
      selectedChunks.push(sortedChunks[index])
      console.log(`📑 Selected chunk ${index + 1} (chunkIndex: ${sortedChunks[index].metadata.chunkIndex})`)
    }

    return selectedChunks
  }
}

module.exports = new RAGService()
