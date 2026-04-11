const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  }

  async generate(prompt) {
    if (!this.apiKey || this.apiKey.includes("YOUR")) {
      throw new Error("GEMINI_API_KEY missing");
    }

    const genAI = new GoogleGenerativeAI(this.apiKey);

    let lastError = null;
    for (const modelName of this.models) {
      try {
        console.log(`[Gemini] Attempting generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();
        return rawText;
      } catch (err) {
        console.warn(`[Gemini] Model ${modelName} failed:`, err.message);
        lastError = err;
        // Continue to the next fallback model in the list
      }
    }
    
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
  }
}

module.exports = new GeminiService();
