const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const analyzeRoute = require('./src/routes/analyze');
const { runIngestionPipeline } = require('./src/services/ingestion');
const { initChroma } = require('./src/services/chroma');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoute);

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// For Vercel, serverless function export
module.exports = app;

// Only start the server if we're not running in serverless environment
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    
    // Initialize DB and Ingestion on startup
    await initChroma();
    await runIngestionPipeline();
  });
}
