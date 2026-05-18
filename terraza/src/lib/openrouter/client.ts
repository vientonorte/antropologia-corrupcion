// OpenRouter client — OpenAI-compatible API via fetch
// Uses OPENROUTER_API_KEY. Falls back to Anthropic if key is absent.

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Default model routed through OpenRouter
export const OR_MODEL = 'anthropic/claude-sonnet-4-5';

export interface ORMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ORChatRequest {
  model?: string;
  messages: ORMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface ORChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function openRouterChat(req: ORChatRequest): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no configurada');
  }

  const body: ORChatRequest = {
    model: req.model ?? OR_MODEL,
    max_tokens: req.max_tokens ?? 4096,
    temperature: req.temperature ?? 0.2,
    messages: req.messages,
  };

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://vientonorte.github.io/antropologia-corrupcion',
      'X-Title': 'Contra-archivo Terraza',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as ORChatResponse;
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('OpenRouter devolvió respuesta vacía');
  return content;
}
