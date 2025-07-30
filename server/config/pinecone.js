const { Pinecone } = require('@pinecone-database/pinecone')

let pineconeClient = null

const initPinecone = async () => {
  try {
    if (!pineconeClient) {
      console.log('🔌 Initializing Pinecone client...')
      
      pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      })

      // Test the connection
      const indexes = await pineconeClient.listIndexes()
      console.log('✅ Pinecone connected successfully')
      console.log(`📊 Available indexes: ${indexes.indexes?.map(i => i.name).join(', ') || 'None'}`)
      
      // Check if our index exists
      const indexName = process.env.PINECONE_INDEX_NAME
      const indexExists = indexes.indexes?.some(i => i.name === indexName)
      
      if (!indexExists) {
        console.log(`📝 Index "${indexName}" not found. Creating...`)
        
        await pineconeClient.createIndex({
          name: indexName,
          dimension: 768, // Google embedding-001 model dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        })
        
        console.log(`✅ Index "${indexName}" created successfully`)
        
        // Wait for index to be ready
        console.log('⏳ Waiting for index to be ready...')
        let ready = false
        while (!ready) {
          await new Promise(resolve => setTimeout(resolve, 5000))
          const indexStats = await pineconeClient.describeIndex(indexName)
          ready = indexStats.status?.ready
        }
        console.log('✅ Index is ready!')
      }
    }
    
    return pineconeClient
  } catch (error) {
    console.error('❌ Error initializing Pinecone:', error)
    throw error
  }
}

const getPineconeClient = () => {
  if (!pineconeClient) {
    throw new Error('Pinecone client not initialized. Call initPinecone() first.')
  }
  return pineconeClient
}

const getIndex = (indexName = process.env.PINECONE_INDEX_NAME) => {
  const client = getPineconeClient()
  return client.index(indexName)
}

module.exports = {
  initPinecone,
  getPineconeClient,
  getIndex
}
