const geminiService = require('./geminiService');
const groqService = require('./groqService');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const parseJsonText = (rawText) => {
    // Strip markdown code fences if the model wraps the response
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (_) {
      // Fallback: pull the first JSON object out of a noisy response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned a malformed response.");
      parsed = JSON.parse(jsonMatch[0]);
    }
    return parsed;
};

class AiOrchestrator {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  isRetryableError(err) {
    const msg = err.message || '';
    return msg.includes('503') || 
           msg.toLowerCase().includes('timeout') || 
           msg.toLowerCase().includes('fetch') || 
           msg.toLowerCase().includes('network') || 
           msg.toLowerCase().includes('unavailable') || 
           msg.toLowerCase().includes('busy');
  }

  async invokeWithRetry(providerName, providerFn, updateStatus) {
    let attempt = 1;
    while (attempt <= this.maxRetries) {
      try {
        const result = await providerFn();
        return { success: true, data: parseJsonText(result), provider: providerName };
      } catch (err) {
        console.error(`[${providerName}] Attempt ${attempt} failed:`, err.message);
        
        if (this.isRetryableError(err) && attempt < this.maxRetries) {
          updateStatus(`AI is busy, retrying...`);
          await delay(this.retryDelay);
          attempt++;
        } else {
          // If it's a parsing error or non-retryable, or we exceeded retries
          return { success: false, error: err };
        }
      }
    }
    return { success: false, error: new Error(`Exceeded max retries for ${providerName}`) };
  }

  async generateContent(prompt, updateStatus, requestedProvider = 'auto') {
    updateStatus("Generating content...");

    let result;

    if (requestedProvider === 'gemini' || requestedProvider === 'auto') {
      console.log(`[Orchestrator] Starting Gemini provider (Mode: ${requestedProvider})...`);
      result = await this.invokeWithRetry("Gemini", () => geminiService.generate(prompt), updateStatus);
      if (result.success) return result;
    }

    if (requestedProvider === 'groq' || requestedProvider === 'auto') {
      console.log(`[Orchestrator] Switching to Groq provider (Mode: ${requestedProvider})...`, result?.error ? result.error : "");
      if (requestedProvider === 'auto') updateStatus("Switching AI provider...");
      else updateStatus("Initiating Groq Synthesis...");
      
      const groqResult = await this.invokeWithRetry("Groq", () => groqService.generate(prompt), updateStatus);
      if (groqResult.success) return groqResult;
      result = groqResult; // track latest error
    }

    // 3. Complete Failure
    console.error("[Orchestrator] ALL target providers failed.", result?.error);
    updateStatus("AI is currently experiencing high demand. Please try again shortly.");
    return {
       success: false,
       data: {
          title: "Unable to generate content right now",
          content: "AI is currently under high demand. Please try again in a few moments.",
          image_prompt: ""
       }
    };
  }
}

module.exports = new AiOrchestrator();
