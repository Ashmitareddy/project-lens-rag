const express = require('express');
const router = express.Router();
const { searchStandards } = require('../services/chroma');
const { generateEvaluation } = require('../services/llm');
const { piiMaskingMiddleware } = require('../middleware/pii');

router.post('/', piiMaskingMiddleware, async (req, res) => {
  try {
    const { domain, role, techStack, projectDescription } = req.body;

    if (!domain || !role || !techStack || !projectDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Hybrid Search against ChromaDB
    const searchQuery = `${domain} ${role} engineering standards capabilities features`;
    const retrievedContext = await searchStandards(searchQuery);

    // 2. Construct LLM Prompt
    const prompt = `
You are a Senior Full-Stack Engineer, AI Systems Architect, and Technical Interviewer.
Evaluate the following student project against real-world engineering standards.

TARGET DOMAIN: ${domain}
TARGET ROLE: ${role}
TECH STACK: ${techStack}
PROJECT DESCRIPTION:
${projectDescription}

RETRIEVED ENGINEERING BENCHMARKS (Use this context to inform your evaluation):
${retrievedContext}

Please return the output ONLY in the following JSON format:
{
  "suitabilityScore": <integer 0-100>,
  "verdict": "<Highly Suitable | Moderately Suitable | Needs Improvement | Not Suitable>",
  "summary": "<2-3 sentences summarizing the project's suitability>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "missingComponents": ["<missing component 1>", ...],
  "roadmap": [
    {
      "recommendation": "<Advanced feature 1>",
      "whyItMatters": "<Why it matters>",
      "expectedImpact": "<Impact>",
      "implementationStrategy": "<Strategy>",
      "difficulty": "<Beginner | Intermediate | Advanced>",
      "estimatedLearningEffort": "<Time/effort estimate>"
    },
    // 3 to 5 roadmap items
  ],
  "interviewSimulator": [
    {
      "question": "<Highly technical interview question>",
      "whyAsked": "<Why interviewer asks it>",
      "expectedApproach": "<Expected Answer Approach>",
      "commonMistakes": "<Common Mistakes>",
      "followUps": ["<follow up 1>", "<follow up 2>"]
    },
    // exactly 5 questions
  ]
}
`;

    // 3. Gemini Evaluation with Groq Failover
    const evaluation = await generateEvaluation(prompt);

    res.json(evaluation);
  } catch (error) {
    console.error("[Analyze Route] Error:", error);
    res.status(500).json({ error: "An error occurred during project analysis." });
  }
});

module.exports = router;
