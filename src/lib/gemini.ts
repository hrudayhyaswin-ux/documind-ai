/**
 * Resilient Google Gemini Client with Multi-Model Fallback Cascade
 * Solves 429 Free Tier Quota Limits & 503 Spikes by automatically cascading
 * across available models.
 */

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'your_gemini_api_key_here') return null;
  return key;
}

export interface GeminiCascadeOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  preferredModel?: string;
}

export interface GeminiResponse {
  text: string;
  modelUsed: string;
}

/**
 * Calls Gemini using a multi-model cascade to guarantee reliable responses
 */
export async function callGeminiCascade(
  contents: Array<{ role?: string; parts: Array<{ text: string }> }> | string,
  options: GeminiCascadeOptions = {}
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const {
    systemInstruction,
    temperature = 0.2,
    maxOutputTokens = 1200,
    preferredModel,
  } = options;

  const normalizedContents =
    typeof contents === 'string'
      ? [{ role: 'user', parts: [{ text: contents }] }]
      : contents;

  // Build model try-order: preferred model first, then the rest
  const modelsToTry: string[] = [];
  if (preferredModel && !modelsToTry.includes(preferredModel)) {
    modelsToTry.push(preferredModel);
  }
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel && !modelsToTry.includes(envModel)) {
    modelsToTry.push(envModel);
  }
  for (const m of CANDIDATE_MODELS) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const bodyPayload: any = {
        contents: normalizedContents,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return { text: text.trim(), modelUsed: model };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini Cascade] Model ${model} returned ${res.status}: ${errMsg}. Cascading to next candidate...`);
        lastError = new Error(`Model ${model} failed (${res.status}): ${errMsg}`);
      }
    } catch (err: any) {
      console.warn(`[Gemini Cascade] Exception on model ${model}: ${err.message}. Cascading...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini cascade models failed.');
}
