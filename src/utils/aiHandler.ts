const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free model cascade - try high-quality first, fall back to faster models
const MODEL_CASCADE = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'google/gemma-3-12b-it:free',
];

export const processUserQuery = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not defined');
  }

  let lastError: Error | null = null;

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

  throw lastError || new Error('All models in cascade failed');
};
