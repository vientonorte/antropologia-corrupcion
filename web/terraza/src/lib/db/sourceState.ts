import { getDatabase } from './init';
import type { SourceAdminState } from '@/lib/sources/types';

function mapRow(row: Record<string, unknown>): SourceAdminState {
  return {
    sourceId: row.source_id as string,
    activeOverride: (row.active_override as number | null) ?? null,
    failureCount: (row.failure_count as number) ?? 0,
    circuitOpenUntil: (row.circuit_open_until as number | null) ?? null,
    lastError: (row.last_error as string | null) ?? null,
    lastStatus: (row.last_status as number | null) ?? null,
    lastLatencyMs: (row.last_latency_ms as number | null) ?? null,
    lastSuccessAt: (row.last_success_at as number | null) ?? null,
    lastCheckedAt: (row.last_checked_at as number | null) ?? null,
    updatedAt: (row.updated_at as number) ?? Date.now(),
  };
}

export function listSourceAdminStates(): SourceAdminState[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM source_admin_state').all() as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getSourceAdminState(sourceId: string): SourceAdminState | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM source_admin_state WHERE source_id = ?').get(sourceId) as
    | Record<string, unknown>
    | undefined;
  if (!row) return null;
  return mapRow(row);
}

export function upsertSourceAdminState(
  sourceId: string,
  patch: Partial<SourceAdminState>,
): SourceAdminState {
  const db = getDatabase();
  const now = Date.now();
  const current = getSourceAdminState(sourceId);
  const next: SourceAdminState = {
    sourceId,
    activeOverride: patch.activeOverride ?? current?.activeOverride ?? null,
    failureCount: patch.failureCount ?? current?.failureCount ?? 0,
    circuitOpenUntil: patch.circuitOpenUntil ?? current?.circuitOpenUntil ?? null,
    lastError: patch.lastError ?? current?.lastError ?? null,
    lastStatus: patch.lastStatus ?? current?.lastStatus ?? null,
    lastLatencyMs: patch.lastLatencyMs ?? current?.lastLatencyMs ?? null,
    lastSuccessAt: patch.lastSuccessAt ?? current?.lastSuccessAt ?? null,
    lastCheckedAt: patch.lastCheckedAt ?? current?.lastCheckedAt ?? null,
    updatedAt: now,
  };

  db.prepare(
    `
    INSERT INTO source_admin_state (
      source_id, active_override, failure_count, circuit_open_until,
      last_error, last_status, last_latency_ms, last_success_at,
      last_checked_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_id) DO UPDATE SET
      active_override=excluded.active_override,
      failure_count=excluded.failure_count,
      circuit_open_until=excluded.circuit_open_until,
      last_error=excluded.last_error,
      last_status=excluded.last_status,
      last_latency_ms=excluded.last_latency_ms,
      last_success_at=excluded.last_success_at,
      last_checked_at=excluded.last_checked_at,
      updated_at=excluded.updated_at
    `,
  ).run(
    next.sourceId,
    next.activeOverride,
    next.failureCount,
    next.circuitOpenUntil,
    next.lastError,
    next.lastStatus,
    next.lastLatencyMs,
    next.lastSuccessAt,
    next.lastCheckedAt,
    next.updatedAt,
  );

  return next;
}

export function setSourceActiveOverride(sourceId: string, active: boolean): SourceAdminState {
  return upsertSourceAdminState(sourceId, { activeOverride: active ? 1 : 0 });
}

export function clearSourceCircuit(sourceId: string): SourceAdminState {
  return upsertSourceAdminState(sourceId, {
    failureCount: 0,
    circuitOpenUntil: null,
    lastError: null,
  });
}
