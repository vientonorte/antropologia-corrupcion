// QA Nivel 1 — análisis automatizado de la BD y APIs del corpus
// Retorna un informe estructurado en JSON para el dashboard /sistema

import { openRouterChat } from './client';

export interface QAInput {
  dbStats: {
    usuarios: number;
    uploads: {
      total: number;
      byCaso: Record<string, number>;
      byEstado: Record<string, number>;
      byFuente: Record<string, number>;
    };
    commitQueue: {
      pending: number;
      committed: number;
      synced: number;
      error: number;
    };
  };
  apiHealth: Array<{
    endpoint: string;
    status: number | null;
    ok: boolean;
    latencyMs: number | null;
    error?: string;
  }>;
}

export interface QAResult {
  score: number; // 0-100
  nivel: 'OK' | 'ADVERTENCIA' | 'CRÍTICO';
  resumen: string;
  hallazgos: Array<{
    tipo: 'info' | 'advertencia' | 'error';
    area: 'base_datos' | 'api' | 'corpus' | 'seguridad';
    mensaje: string;
    recomendacion?: string;
  }>;
  timestamp: string;
}

const QA_SYSTEM = `Eres el auditor QA del sistema Contra-archivo Terraza, una herramienta admin privada para investigación doctoral sobre antropología de la corrupción en Chile.

Tu tarea es analizar el estado de la base de datos SQLite y las APIs del sistema, y producir un informe QA Nivel 1.

El informe debe ser un JSON válido con este schema:
{
  "score": <número 0-100, 100=perfecto>,
  "nivel": <"OK" | "ADVERTENCIA" | "CRÍTICO">,
  "resumen": <string corto en español describiendo el estado general>,
  "hallazgos": [
    {
      "tipo": <"info" | "advertencia" | "error">,
      "area": <"base_datos" | "api" | "corpus" | "seguridad">,
      "mensaje": <string en español>,
      "recomendacion": <string opcional>
    }
  ],
  "timestamp": <ISO 8601 string>
}

Reglas de evaluación:
- Score < 60 → nivel CRÍTICO
- Score 60-79 → ADVERTENCIA
- Score 80-100 → OK
- APIs caídas (status != 200) son errores críticos
- Uploads con estado "pendiente" por más de 24h son advertencias
- Queue con entradas "error" son errores
- Sin uploads = advertencia (corpus vacío)
- Un solo usuario = info (configuración correcta para sistema admin personal)
- Más de un usuario = error de seguridad (solo debe existir el admin)

Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones adicionales.`;

export async function runQALevel1(input: QAInput): Promise<QAResult> {
  const userMessage = `Estado actual del sistema Contra-archivo Terraza:

## Base de datos
- Usuarios registrados: ${input.dbStats.usuarios}
- Capturas totales: ${input.dbStats.uploads.total}
- Por caso: ${JSON.stringify(input.dbStats.uploads.byCaso)}
- Por estado de codificación: ${JSON.stringify(input.dbStats.uploads.byEstado)}
- Por fuente: ${JSON.stringify(input.dbStats.uploads.byFuente)}
- Cola de commits pendientes: ${input.dbStats.commitQueue.pending}
- Cola comprometidos: ${input.dbStats.commitQueue.committed}
- Cola sincronizados: ${input.dbStats.commitQueue.synced}
- Cola con error: ${input.dbStats.commitQueue.error}

## Estado de APIs
${input.apiHealth.map((h) => `- ${h.endpoint}: ${h.ok ? `✓ OK (${h.latencyMs}ms)` : `✗ FALLO status=${h.status ?? 'timeout'} ${h.error ?? ''}`}`).join('\n')}

Genera el informe QA Nivel 1 en JSON.`;

  const raw = await openRouterChat({
    messages: [
      { role: 'system', content: QA_SYSTEM },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 2048,
    temperature: 0.1,
  });

  // Extract JSON — prefer fenced block, then a full-string JSON object
  const jsonMatch =
    raw.match(/```json\s*([\s\S]*?)```/) ??
    raw.match(/^\s*(\{[\s\S]*\})\s*$/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  try {
    return JSON.parse(jsonStr) as QAResult;
  } catch {
    throw new Error(
      `No se pudo interpretar la respuesta QA de Claude. Respuesta recibida: ${jsonStr.slice(0, 200)}`,
    );
  }
}
