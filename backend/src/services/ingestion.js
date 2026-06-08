const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { addDocuments } = require('./chroma');

const DATA_DIR = path.join(__dirname, '../../data');
const CHUNK_SIZE = 1000; // characters

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function chunkText(text, filename) {
  const chunks = [];
  let startIndex = 0;

  // Basic character-based chunking with some overlap
  while (startIndex < text.length) {
    const chunk = text.substring(startIndex, startIndex + CHUNK_SIZE);
    chunks.push({
      text: chunk,
      metadata: { source: filename, chunkIndex: chunks.length },
      id: uuidv4()
    });
    startIndex += (CHUNK_SIZE - 200); // 200 char overlap
  }
  return chunks;
}

async function runIngestionPipeline() {
  console.log("[Ingestion] Starting PDF ingestion pipeline...");
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`[Ingestion] Data directory not found at ${DATA_DIR}. Creating...`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    // Write a dummy standards file
    fs.writeFileSync(path.join(DATA_DIR, 'sample_standards.txt'), "Software engineering standards require modular design, secure authentication (JWT/OAuth), scalable databases, and comprehensive test coverage. FinTech requires high security and transaction integrity.");
  }

  const files = fs.readdirSync(DATA_DIR);

  if (files.length === 0) {
    console.log("[Ingestion] No files found to ingest.");
    return;
  }

  const allChunks = [];
  const allMetadatas = [];
  const allIds = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    let text = "";

    try {
      if (file.endsWith('.pdf')) {
        text = await extractTextFromPDF(filePath);
      } else if (file.endsWith('.txt')) {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        continue;
      }

      if (text.length > 0) {
        const fileChunks = chunkText(text, file);
        fileChunks.forEach(c => {
          allChunks.push(c.text);
          allMetadatas.push(c.metadata);
          allIds.push(c.id);
        });
      }
    } catch (err) {
      console.error(`[Ingestion] Failed to process file ${file}:`, err);
    }
  }

  if (allChunks.length > 0) {
    // In a real app we'd check if the document is already ingested (via metadata or DB state).
    // Assuming small initial dataset for demonstration.
    await addDocuments(allChunks, allMetadatas, allIds);
    console.log(`[Ingestion] Pipeline completed. Processed ${allChunks.length} chunks.`);
  }
}

module.exports = {
  runIngestionPipeline
};
