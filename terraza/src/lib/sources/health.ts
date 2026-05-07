import { getRegistrySourceById, listRegistrySources } from './registry';
import {
  clearSourceCircuit,
  getSourceAdminState,
  listSourceAdminStates,
  upsertSourceAdminState,
} from '@/lib/db/sourceState';
import type { SourceHealth, SourceRegistryItem } from './types';
import { normalizeSourceRecord, type CanonicalSourceRecord } from './normalizers';

const MAX_CONSECUTIVE_FAILURES = 3;
const CIRCUIT_OPEN_MS = 2 * 60 * 1000;

function withTimeout(signalMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), signalMs);
  return controller;
}

function isCircuitOpen(sourceId: string): boolean {
  const state = getSourceAdminState(sourceId);
  if (!state?.circuitOpenUntil) return false;
  return state.circuitOpenUntil > Date.now();
}

function getEffectiveActive(source: SourceRegistryItem): boolean {
  const state = getSourceAdminState(source.id);
  if (state?.activeOverride != null) return state.activeOverride === 1;
  return source.activa;
}

async function runHealthCheck(
  source: SourceRegistryItem,
): Promise<{ ok: boolean; status: number | null; latencyMs: number | null; error?: string }> {
  const start = Date.now();
  const controller = withTimeout(source.timeout_ms);

  try {
    const useGet = source.metodo_acceso === 'rss' || source.metodo_acceso === 'discovery';
    const res = await fetch(source.endpoint, {
      method: useGet ? 'GET' : 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    return {
      ok: res.status < 500,
      status: res.status,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'healthcheck_error',
    };
  }
}

function toSourceHealth(
  source: SourceRegistryItem,
  health: { ok: boolean; status: number | null; latencyMs: number | null; error?: string },
): SourceHealth {
  const now = Date.now();
  const state = getSourceAdminState(source.id);
  const effectiveActive = getEffectiveActive(source);
  const open = isCircuitOpen(source.id);
  const checkedAt = new Date(now).toISOString();
  return {
    sourceId: source.id,
    label: source.label,
    tipo: source.tipo,
    criticidad: source.criticidad,
    estado: source.estado,
    active: effectiveActive,
    endpoint: source.endpoint,
    method: source.metodo_acceso,
    ok: health.ok,
    status: health.status,
    latencyMs: health.latencyMs,
    error: health.error,
    checkedAt,
    lastSuccessAt: state?.lastSuccessAt ? new Date(state.lastSuccessAt).toISOString() : null,
    failureCount: state?.failureCount ?? 0,
    circuitOpen: open,
  };
}

function updateStateAfterHealth(
  sourceId: string,
  health: { ok: boolean; status: number | null; latencyMs: number | null; error?: string },
): void {
  const now = Date.now();
  const current = getSourceAdminState(sourceId);
  if (health.ok) {
    upsertSourceAdminState(sourceId, {
      failureCount: 0,
      circuitOpenUntil: null,
      lastError: null,
      lastStatus: health.status,
      lastLatencyMs: health.latencyMs ?? null,
      lastSuccessAt: now,
      lastCheckedAt: now,
    });
    return;
  }

  const failureCount = (current?.failureCount ?? 0) + 1;
  upsertSourceAdminState(sourceId, {
    failureCount,
    circuitOpenUntil:
      failureCount >= MAX_CONSECUTIVE_FAILURES ? now + CIRCUIT_OPEN_MS : current?.circuitOpenUntil ?? null,
    lastError: health.error ?? `status_${health.status ?? 'na'}`,
    lastStatus: health.status,
    lastLatencyMs: health.latencyMs ?? null,
    lastCheckedAt: now,
  });
}

export async function getAllSourcesHealth(): Promise<SourceHealth[]> {
  const sources = listRegistrySources();
  const checks = await Promise.all(
    sources.map(async (source) => {
      const active = getEffectiveActive(source);
      if (!active) {
        return toSourceHealth(source, {
          ok: true,
          status: null,
          latencyMs: null,
          error: 'desactivada',
        });
      }
      if (isCircuitOpen(source.id)) {
        return toSourceHealth(source, {
          ok: false,
          status: null,
          latencyMs: null,
          error: 'circuit_open',
        });
      }
      const health = await runHealthCheck(source);
      updateStateAfterHealth(source.id, health);
      return toSourceHealth(source, health);
    }),
  );
  return checks;
}

export async function testSourceHealth(sourceId: string): Promise<SourceHealth> {
  const source = getRegistrySourceById(sourceId);
  if (!source) {
    throw new Error(`Fuente no encontrada: ${sourceId}`);
  }
  if (isCircuitOpen(sourceId)) {
    return toSourceHealth(source, {
      ok: false,
      status: null,
      latencyMs: null,
      error: 'circuit_open',
    });
  }
  const health = await runHealthCheck(source);
  updateStateAfterHealth(sourceId, health);
  return toSourceHealth(source, health);
}

export function resetSourceCircuit(sourceId: string): void {
  clearSourceCircuit(sourceId);
}

function mockRawRecords(source: SourceRegistryItem): Record<string, unknown>[] {
  const now = new Date().toISOString().slice(0, 10);
  if (source.id === 'scielo') {
    return [
      {
        id: `${source.id}-sample-1`,
        title: 'Mistranslation institucional y fuentes públicas',
        published_at: now,
        keywords: ['corrupción', 'institucionalidad', 'datos públicos'],
      },
    ];
  }
  if (source.id === 'diariooficial') {
    return [
      {
        id: `${source.id}-sample-1`,
        titulo: 'Resolución de interés público',
        fecha: now,
        materia: 'Publicación normativa',
        tipo_friccion: 'politica',
      },
    ];
  }
  return [
    {
      id: `${source.id}-sample-1`,
      titulo: `Registro de ${source.label}`,
      fecha: now,
      keywords: [source.label, source.tipo],
      tipo_friccion: 'semantica',
    },
  ];
}

export async function runConsolidationPipeline(
  sourceIds: string[],
): Promise<Array<{ sourceId: string; records: CanonicalSourceRecord[] }>> {
  const targets = sourceIds.length > 0
    ? sourceIds
        .map((id) => getRegistrySourceById(id))
        .filter((item): item is SourceRegistryItem => item !== null)
    : listRegistrySources().filter((source) => source.activa).slice(0, 3);

  const output: Array<{ sourceId: string; records: CanonicalSourceRecord[] }> = [];
  for (const source of targets) {
    const rawRecords = mockRawRecords(source);
    const normalized = rawRecords.map((raw) => normalizeSourceRecord(source, raw));
    output.push({ sourceId: source.id, records: normalized });
  }
  return output;
}

export function getSourceStateSnapshot(): ReturnType<typeof listSourceAdminStates> {
  return listSourceAdminStates();
}
