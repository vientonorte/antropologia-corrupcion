import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listRegistrySources } from '@/lib/sources/registry';
import {
  getAllSourcesHealth,
  getSourceStateSnapshot,
  resetSourceCircuit,
  runConsolidationPipeline,
  testSourceHealth,
} from '@/lib/sources/health';
import { setSourceActiveOverride } from '@/lib/db/sourceState';

const ActionSchema = z.object({
  action: z.enum(['test', 'toggle', 'retry', 'consolidate']),
  sourceId: z.string().optional(),
  active: z.boolean().optional(),
  sourceIds: z.array(z.string()).nonempty().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const [registry, health, state] = await Promise.all([
    Promise.resolve(listRegistrySources()),
    getAllSourcesHealth(),
    Promise.resolve(getSourceStateSnapshot()),
  ]);

  return NextResponse.json({ registry, health, state });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = ActionSchema.parse(await request.json());

    if (body.action === 'test') {
      if (!body.sourceId) {
        return NextResponse.json({ error: 'sourceId requerido' }, { status: 400 });
      }
      const result = await testSourceHealth(body.sourceId);
      return NextResponse.json({ result });
    }

    if (body.action === 'toggle') {
      if (!body.sourceId || typeof body.active !== 'boolean') {
        return NextResponse.json({ error: 'sourceId y active requeridos' }, { status: 400 });
      }
      const state = setSourceActiveOverride(body.sourceId, body.active);
      return NextResponse.json({ state });
    }

    if (body.action === 'retry') {
      if (!body.sourceId) {
        return NextResponse.json({ error: 'sourceId requerido' }, { status: 400 });
      }
      resetSourceCircuit(body.sourceId);
      const result = await testSourceHealth(body.sourceId);
      return NextResponse.json({ result });
    }

    // Si sourceIds se omite, el pipeline usa el fallback MVP (primeras fuentes activas).
    const consolidated = await runConsolidationPipeline(body.sourceIds ?? []);
    return NextResponse.json({ consolidated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Acción inválida' },
      { status: 400 },
    );
  }
}
