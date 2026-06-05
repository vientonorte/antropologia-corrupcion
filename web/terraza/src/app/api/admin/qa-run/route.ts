import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { countAllUsers } from '@/lib/db/credentials';
import { getUploadStats } from '@/lib/db/uploads';
import { getDatabase } from '@/lib/db/init';
import { runQALevel1, type QAInput } from '@/lib/openrouter/qa';

// Use the configured server URL to avoid SSRF via user-controlled Host header.
function getServerOrigin(): string {
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Collect DB snapshot
    const db = getDatabase();
    const queueRows = db.prepare(
      'SELECT status, COUNT(*) as count FROM commit_queue GROUP BY status',
    ).all() as Array<{ status: string; count: number }>;

    const commitQueue = { pending: 0, committed: 0, synced: 0, error: 0 };
    for (const row of queueRows) {
      if (row.status in commitQueue) {
        commitQueue[row.status as keyof typeof commitQueue] = row.count;
      }
    }

    const uploadStats = getUploadStats();

    // Convert number-keyed byCaso to string-keyed for QAInput (JS object keys are always strings)
    const byCasoStr: Record<string, number> = {};
    for (const [k, v] of Object.entries(uploadStats.byCaso)) {
      byCasoStr[String(k)] = v;
    }

    // Collect API health snapshot using the configured server origin
    const origin = getServerOrigin();
    const endpoints = [
      '/api/corpus/list',
      '/api/corpus/by-estado',
      '/api/corpus/graph-data',
      '/api/corpus/sync-status',
    ];

    const apiHealth = await Promise.all(
      endpoints.map(async (path) => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 4_000);
          const res = await fetch(`${origin}${path}`, {
            signal: controller.signal,
            headers: { Cookie: request.headers.get('cookie') ?? '' },
          });
          return {
            endpoint: path,
            status: res.status,
            ok: res.status < 500,
            latencyMs: Date.now() - start,
          };
        } catch (err) {
          return {
            endpoint: path,
            status: null,
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : 'timeout',
          };
        }
      }),
    );

    const input: QAInput = {
      dbStats: {
        usuarios: countAllUsers(),
        uploads: {
          total: uploadStats.total,
          byCaso: byCasoStr,
          byEstado: uploadStats.byEstado as Record<string, number>,
          byFuente: uploadStats.byFuente as Record<string, number>,
        },
        commitQueue,
      },
      apiHealth,
    };

    const result = await runQALevel1(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'QA falló' },
      { status: 500 },
    );
  }
}
