import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUploadsByUserId } from '@/lib/db/uploads';
import { CASOS } from '@/lib/corpus/cases';

export interface GraphNode {
  id: string;
  label: string;
  casoId: 1 | 2 | 3 | 4;
  casoSlug: string;
  regimenVerdad: string;
  fuenteTipo: string;
  estadoCodificacion: string;
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number; // shared tags count
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploads = getUploadsByUserId(session.userId, 200);

    const nodes: GraphNode[] = uploads.map((u) => {
      const caso = Object.values(CASOS).find((c) => c.id === u.casoId);
      const tags = u.tags ? (JSON.parse(u.tags) as string[]) : [];
      return {
        id: u.id,
        label: u.fileName,
        casoId: u.casoId,
        casoSlug: caso?.slug ?? `caso-${u.casoId}`,
        regimenVerdad: u.regimenVerdad,
        fuenteTipo: u.fuenteTipo,
        estadoCodificacion: u.estadoCodificacion,
        tags,
      };
    });

    // Edges: connect nodes that share at least one tag
    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const shared = a.tags.filter((t) => b.tags.includes(t));
        if (shared.length > 0) {
          edges.push({ source: a.id, target: b.id, weight: shared.length });
        }
      }
    }

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('graph-data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
