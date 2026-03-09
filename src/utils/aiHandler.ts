const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback model cascade — used if HQ API is unreachable. Synced 2026-03-09.
const FALLBACK_MODELS = [
  'openai/gpt-oss-120b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'arcee-ai/trinity-large-preview:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'qwen/qwen3-coder:free',
  'stepfun/step-3.5-flash:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-12b-it:free',
  'qwen/qwen3-4b:free',
];

// Cache: fetch cascade from HQ, refresh every 5 minutes
let cachedCascade: string[] | null = null;
let cascadeExpiry = 0;

async function getModelCascade(): Promise<string[]> {
  if (cachedCascade && Date.now() < cascadeExpiry) return cachedCascade;
  try {
    const res = await fetch('https://hq.elunari.uk/api/models?cascade=true', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cascadeOrder?.length) {
        cachedCascade = data.cascadeOrder;
        cascadeExpiry = Date.now() + 5 * 60 * 1000;
        return cachedCascade!;
      }
    }
  } catch { /* HQ unreachable, use fallback */ }
  return FALLBACK_MODELS;
}

// Paid fallback — only used when ALL free models are rate-limited
const PAID_FALLBACK = 'openai/gpt-4o-mini';

export const processUserQuery = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not defined');
  }

  let lastError: Error | null = null;
  const modelCascade = await getModelCascade();

  // Try all models, then retry once after a delay if all 429'd
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 3000));
      console.warn('Retrying model cascade after rate limit cooldown...');
    }

    for (const model of modelCascade) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://mingming-kanban.elunari.uk',
            'X-Title': 'MingMing Kanban',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.warn(`Model ${model} failed (${response.status}): ${errBody}`);
          lastError = new Error(`${model}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const aiResponseText = data.choices?.[0]?.message?.content || '';

        if (!aiResponseText) {
          lastError = new Error(`${model}: empty response`);
          continue;
        }

        // Sanitize: remove backticks and code block delimiters
        return aiResponseText.replace(/```json|```/g, '').trim();
      } catch (error) {
        console.warn(`Model ${model} error:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
  }

  // All free models exhausted — use paid fallback
  console.warn('All free models failed, falling back to paid model:', PAID_FALLBACK);
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mingming-kanban.elunari.uk',
        'X-Title': 'MingMing Kanban',
      },
      body: JSON.stringify({
        model: PAID_FALLBACK,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponseText = data.choices?.[0]?.message?.content || '';
      if (aiResponseText) {
        return aiResponseText.replace(/```json|```/g, '').trim();
      }
    }
  } catch (error) {
    console.warn('Paid fallback also failed:', error);
  }

  throw lastError || new Error('All models in cascade failed');
};
