# Project-Lens

An AI-powered Developer Intelligence Platform that evaluates engineering student projects against real-world standards. It uses Hybrid Search (ChromaDB) and Multi-LLM failover (Gemini / Groq) to provide technical auditing, scaling advice, and interview simulation.

## Features
- **Domain & Role specific Evaluation:** Checks project architecture based on real engineering benchmarks.
- **Features to Scale:** Generates a custom roadmap for scaling basic projects.
- **Interview Simulator:** Generates deep-dive technical interview questions based on the exact tech stack and implementation.
- **Zero-Knowledge PII Firewall:** Middlewares ensure emails, phone numbers, and potential secrets are masked before hitting any external LLM APIs.
- **Multi-LLM Failover:** Primary Gemini 2.5 Flash, falling back to Groq Llama for high availability.

## Project Structure
- `frontend/`: React + Vite + Tailwind v4 UI
- `backend/`: Express.js + ChromaDB SDK + GenAI logic

## Prerequisites
- Node.js (v18+)
- A ChromaDB Cloud account (or local chroma)
- Gemini API Key
- Groq API Key

## Setup & Local Development

1. **Install dependencies for monorepo:**
   ```bash
   npm run install:all
   ```

2. **Environment Variables:**
   Create a `.env` file inside `backend/` using `.env.example` as a template:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   CHROMA_HOST=api.trychroma.com
   CHROMA_API_KEY=your_chroma_api_key
   CHROMA_TENANT=6d1db37f-d9f8-4ecc-acea-fee537d68276
   CHROMA_DATABASE=project
   ```

3. **Provide Knowledge Base Files (Optional):**
   Place any PDF or text files containing engineering standards into `backend/data/`. They will be automatically ingested into ChromaDB on backend startup.

4. **Run both frontend and backend concurrently:**
   ```bash
   npm run dev
   ```
   The backend will run on port 3000, and frontend will run on its default Vite port (proxying `/api` requests to 3000).

## Deployment

This monorepo is configured for standard Vercel deployment.
- **Framework Preset:** Vite
- **Root Directory:** (Leave empty/root)
- **Build Command:** `npm run build`
- **Output Directory:** `frontend/dist`

The `vercel.json` file automatically routes all `/api/*` traffic to Serverless Functions powered by `backend/index.js`, while serving the compiled React frontend for all other routes.
Make sure to add all environment variables in your Vercel project settings.
