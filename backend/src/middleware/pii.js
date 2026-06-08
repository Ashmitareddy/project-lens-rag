const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
// Basic regex to catch typical token/API key patterns (alphanumeric strings of high entropy)
const tokenRegex = /(?:api_key|token|secret)["\s:=]+([a-zA-Z0-9_\-]{20,})/gi;

const injectionKeywords = [
  "ignore previous instructions",
  "system prompt",
  "bypass",
  "reveal instructions"
];

function maskPII(text) {
  if (!text) return text;
  let masked = text.replace(emailRegex, "[EMAIL]");
  masked = masked.replace(phoneRegex, "[PHONE]");
  masked = masked.replace(tokenRegex, (match, p1) => {
    return match.replace(p1, "[SECRET]");
  });
  // Rudimentary name masking could be added, but robust NER requires a dedicated library/model. 
  // We'll stick to regex-based robust masking for PII that has clear formats.
  return masked;
}

function detectPromptInjection(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  for (const keyword of injectionKeywords) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }
  return false;
}

const piiMaskingMiddleware = (req, res, next) => {
  if (req.body) {
    const fieldsToCheck = ["projectDescription", "domain", "role", "techStack"];
    
    for (const field of fieldsToCheck) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        if (detectPromptInjection(req.body[field])) {
          console.warn(`[SECURITY] Prompt injection detected in field: ${field}`);
          return res.status(403).json({ error: "Prompt injection detected. Request blocked." });
        }
        req.body[field] = maskPII(req.body[field]);
      }
    }
  }
  next();
};

module.exports = {
  piiMaskingMiddleware,
  maskPII
};
