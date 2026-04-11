const Groq = require("groq-sdk");

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  }

  async generate(prompt) {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY missing");
    }

    const groq = new Groq({ apiKey: this.apiKey });

    let lastError = null;
    for (const modelName of this.models) {
      try {
        console.log(`[Groq] Attempting generation with model: ${modelName}`);
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: modelName,
          temperature: 0.7,
        });
        
        const rawText = chatCompletion.choices[0]?.message?.content?.trim();
        if (!rawText) throw new Error("Empty response from Groq");
        return rawText;
      } catch (err) {
        console.warn(`[Groq] Model ${modelName} failed:`, err.message);
        lastError = err;
        // Continue to the next fallback model in the list
      }
    }
    
    throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
  }
}

module.exports = new GroqService();
