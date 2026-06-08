const { ChromaClient } = require('chromadb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let chromaClient = null;
let collection = null;

async function initChroma() {
  try {
    if (!process.env.CHROMA_API_KEY) {
      console.warn("[ChromaDB] No CHROMA_API_KEY found, RAG will be disabled if not local.");
    }
    
    // Setting up the client for ChromaDB Cloud
    chromaClient = new ChromaClient({
      host: process.env.CHROMA_HOST || 'api.trychroma.com',
      tenant: process.env.CHROMA_TENANT || "default_tenant",
      database: process.env.CHROMA_DATABASE || "default_database",
      // Set to true unless targeting a localhost without ssl
      ssl: process.env.CHROMA_HOST !== 'localhost:8000',
      headers: {
        "x-chroma-token": process.env.CHROMA_API_KEY || ""
      }
    });

    collection = await chromaClient.getOrCreateCollection({
      name: "engineering_standards",
      metadata: { "hnsw:space": "cosine" }
    });

    console.log("[ChromaDB] Connected and collection ready.");
  } catch (error) {
    console.error("[ChromaDB] Initialization failed:", error);
  }
}

async function addDocuments(chunks, metadatas, ids) {
  if (!collection) await initChroma();
  try {
    // Basic dense embeddings via default Chroma or configured embedding model
    await collection.upsert({
      ids: ids,
      documents: chunks,
      metadatas: metadatas
    });
    console.log(`[ChromaDB] Successfully ingested ${chunks.length} documents.`);
  } catch (error) {
    console.error("[ChromaDB] Error adding documents:", error);
  }
}

async function searchStandards(query, nResults = 5) {
  if (!collection) await initChroma();
  try {
    // Perform search. In a full production Chroma setup, you might pass `query_texts` or `query_embeddings`
    const results = await collection.query({
      queryTexts: [query],
      nResults: nResults,
      // If we had sparse embeddings configured, we could pass them here or configure the collection to use them.
      // Currently defaulting to dense retrieval text search.
    });
    
    // Flatten and return the document contexts
    if (results && results.documents && results.documents.length > 0) {
      return results.documents[0].join("\n\n");
    }
    return "";
  } catch (error) {
    console.error("[ChromaDB] Search error:", error);
    return "";
  }
}

module.exports = {
  initChroma,
  addDocuments,
  searchStandards
};
