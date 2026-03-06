const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Source of truth: elunari/public/free-models.json cascadeOrder
// Starts with less-popular models (less rate-limited), falls through to popular ones
const MODEL_CASCADE = [
  'openai/gpt-oss-120b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'qwen/qwen3-coder:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'arcee-ai/trinity-large-preview:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'upstage/solar-pro-3:free',
  'stepfun/step-3.5-flash:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'google/gemma-3-12b-it:free',
  'google/gemma-3-4b-it:free',
  'qwen/qwen3-4b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

// Paid fallback — only used when ALL free models are rate-limited
const PAID_FALLBACK = 'openai/gpt-4o-mini';

export const processUserQuery = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not defined');
  }

  let lastError: Error | null = null;

  // Try all models, then retry once after a delay if all 429'd
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 3000));
      console.warn('Retrying model cascade after rate limit cooldown...');
    }

    for (const model of MODEL_CASCADE) {
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
