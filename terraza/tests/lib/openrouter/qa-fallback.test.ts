import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/openrouter/client', () => ({
  openRouterChat: vi.fn(),
}));

vi.mock('@/lib/openclaw/client', () => ({
  openClawAsk: vi.fn(),
}));

import { runQALevel1 } from '@/lib/openrouter/qa';
import { openRouterChat } from '@/lib/openrouter/client';
import { openClawAsk } from '@/lib/openclaw/client';

describe('runQALevel1 fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa OpenCLAW cuando OpenRouter falla', async () => {
    vi.mocked(openRouterChat).mockRejectedValue(new Error('router down'));
    vi.mocked(openClawAsk).mockResolvedValue(
      JSON.stringify({
        score: 75,
        nivel: 'ADVERTENCIA',
        resumen: 'fallback',
        hallazgos: [],
        timestamp: new Date().toISOString(),
      }),
    );

    const result = await runQALevel1({
      dbStats: {
        usuarios: 1,
        uploads: { total: 0, byCaso: {}, byEstado: {}, byFuente: {} },
        commitQueue: { pending: 0, committed: 0, synced: 0, error: 0 },
      },
      apiHealth: [],
    });

    expect(result.provider).toBe('openclaw');
    expect(result.score).toBe(75);
    expect(openClawAsk).toHaveBeenCalledTimes(1);
  });
});
