export interface OpenClawRequest {
  question: string;
  system?: string;
  lang?: string;
}

interface OpenClawResponse {
  answer?: string;
  result?: string;
  output?: string;
}

const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL ?? 'https://api.openclaw.ai/v1/ask';

export async function openClawAsk(req: OpenClawRequest): Promise<string> {
  const apiKey = process.env.OPENCLAW_API_KEY;
  if (!apiKey) {
    throw new Error('OPENCLAW_API_KEY no configurada');
  }

  const res = await fetch(OPENCLAW_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      question: req.question,
      system: req.system,
      lang: req.lang ?? 'es',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenCLAW error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as OpenClawResponse;
  // OpenCLAW responses have shown slight field drift across versions:
  // some deployments use `answer`, others `result` or `output`.
  // TODO(2026-Q3): simplificar cuando OpenCLAW consolide contrato estable.
  const content = data.answer ?? data.result ?? data.output ?? '';
  if (!content) {
    throw new Error('OpenCLAW devolvió respuesta vacía');
  }
  return content;
}
