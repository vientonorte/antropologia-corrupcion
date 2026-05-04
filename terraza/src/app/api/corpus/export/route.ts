import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUploadsByUserId } from '@/lib/db/uploads';
import { CASOS } from '@/lib/corpus/cases';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploads = getUploadsByUserId(session.userId, 500);

    const exported = uploads.map((u) => {
      const caso = Object.values(CASOS).find((c) => c.id === u.casoId);
      const tags = u.tags ? (JSON.parse(u.tags) as string[]) : [];

      let codes: unknown = null;
      let mistranslations: unknown = null;

      try { if (u.codes) codes = JSON.parse(u.codes); } catch { /* malformed */ }
      try { if (u.mistranslations) mistranslations = JSON.parse(u.mistranslations); } catch { /* malformed */ }

      return {
        id: u.id,
        caso: u.casoId,
        casoLabel: caso?.label ?? '',
        casoSlug: caso?.slug ?? '',
        fileName: u.fileName,
        fileType: u.fileType,
        hashSource: u.hashSource,
        fuenteTipo: u.fuenteTipo,
        regimenVerdad: u.regimenVerdad,
        estadoCodificacion: u.estadoCodificacion,
        tags,
        fechaEvento: u.fechaEvento,
        fechaCaptura: new Date(u.createdAt).toISOString(),
        transcription: u.transcription,
        codes,
        mistranslations,
      };
    });

    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), total: exported.length, corpus: exported }, null, 2);

    return new NextResponse(payload, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="corpus-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
