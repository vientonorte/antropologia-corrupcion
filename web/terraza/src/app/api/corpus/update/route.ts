import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getUpload, updateUploadAnalysis, updateUploadStatus } from '@/lib/db/uploads';
import { EstadoCodificacionEnum } from '@/lib/corpus/schemas';

const UpdateRequestSchema = z.object({
  uploadId: z.string(),
  transcription: z.string().optional(),
  analysis: z.string().optional(),
  codes: z.string().optional(),
  mistranslations: z.string().optional(),
  estadoCodificacion: EstadoCodificacionEnum.optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = UpdateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
    }

    const { uploadId, transcription, analysis, codes, mistranslations, estadoCodificacion } = parsed.data;

    const upload = getUpload(uploadId);
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    if (upload.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hasTextUpdate = transcription !== undefined || analysis !== undefined ||
      codes !== undefined || mistranslations !== undefined;

    if (hasTextUpdate) {
      updateUploadAnalysis(
        uploadId,
        transcription ?? upload.transcription ?? '',
        analysis ?? upload.analysis ?? '',
        codes ?? upload.codes ?? '',
        mistranslations ?? upload.mistranslations ?? '',
      );
    }

    if (estadoCodificacion !== undefined) {
      updateUploadStatus(uploadId, estadoCodificacion);
    }

    return NextResponse.json({ success: true, uploadId });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update upload' }, { status: 500 });
  }
}
