const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Initialize SDKs
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Primary: Gemini 2.5 Flash
async function callGemini(prompt) {
  if (!ai) throw new Error("Gemini API key not configured");
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return response.text;
}

// Fallback: Groq Llama
async function callGroq(prompt) {
  if (!groq) throw new Error("Groq API key not configured");
  
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt + "\n\nPlease return ONLY valid JSON.",
      },
    ],
    model: "llama3-8b-8192", // Using an available Groq model
    response_format: { type: "json_object" }
  });

  return response.choices[0]?.message?.content || "{}";
}

async function generateEvaluation(prompt) {
  try {
    console.log("[LLM] Attempting Gemini 2.5 Flash...");
    const geminiResponse = await callGemini(prompt);
    console.log("[LLM] Gemini successful.");
    return JSON.parse(geminiResponse);
  } catch (error) {
    console.warn("[LLM] Gemini failed or timed out. Failing over to Groq.", error.message);
    try {
      const groqResponse = await callGroq(prompt);
      console.log("[LLM] Groq successful.");
      return JSON.parse(groqResponse);
    } catch (groqError) {
      console.error("[LLM] Both Gemini and Groq failed.", groqError.message);
      throw new Error("Evaluation generation failed from all available models.");
    }
  }
}

module.exports = {
  generateEvaluation
};
