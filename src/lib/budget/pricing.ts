// Cost per 1M tokens in USD
// Source: https://ai.google.dev/pricing (as of 2025)
interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gemini-2.5-flash": {
    inputPer1M: 0.15,
    outputPer1M: 0.60,
  },
  "gemini-2.0-flash": {
    inputPer1M: 0.10,
    outputPer1M: 0.40,
  },
  "gemini-2.0-flash-lite": {
    inputPer1M: 0.075,
    outputPer1M: 0.30,
  },
  "gemini-1.5-pro": {
    inputPer1M: 1.25,
    outputPer1M: 5.00,
  },
  "gemini-1.5-flash": {
    inputPer1M: 0.075,
    outputPer1M: 0.30,
  },
  "gemini-2.5-flash-8b": {
    inputPer1M: 0.04,
    outputPer1M: 0.15,
  },
};

export function calculateCost(
  model: string,
  promptTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["gemini-2.5-flash"];
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;
  return inputCost + outputCost;
}
