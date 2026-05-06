import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Internal API endpoints to health-check. These are Next.js route handlers
// served on the same origin, so we hit them with a GET/HEAD request.
const ENDPOINTS = [
  { path: '/api/corpus/list', label: 'corpus/list' },
  { path: '/api/corpus/by-estado', label: 'corpus/by-estado' },
  { path: '/api/corpus/graph-data', label: 'corpus/graph-data' },
  { path: '/api/corpus/sync-status', label: 'corpus/sync-status' },
  { path: '/api/corpus/export', label: 'corpus/export' },
  { path: '/api/corpus/upload', label: 'corpus/upload (POST-only, expect 405)' },
  { path: '/api/corpus/analyze', label: 'corpus/analyze (POST-only, expect 405)' },
  { path: '/api/corpus/commit', label: 'corpus/commit (POST-only, expect 405)' },
] as const;

const TIMEOUT_MS = 5_000;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;

  const results = await Promise.all(
    ENDPOINTS.map(async ({ path, label }) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(`${origin}${path}`, {
          signal: controller.signal,
          headers: { Cookie: request.headers.get('cookie') ?? '' },
        });
        clearTimeout(timer);

        const latencyMs = Date.now() - start;
        // POST-only endpoints return 405; treat as reachable/ok
        const ok = res.status < 500;
        return { endpoint: label, status: res.status, ok, latencyMs };
      } catch (err) {
        return {
          endpoint: label,
          status: null,
          ok: false,
          latencyMs: Date.now() - start,
          error: err instanceof Error ? err.message : 'timeout',
        };
      }
    }),
  );

  return NextResponse.json({ endpoints: results });
}
