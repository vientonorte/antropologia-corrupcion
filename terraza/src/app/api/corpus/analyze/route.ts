import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getUpload, updateUploadAnalysis, updateUploadStatus } from '@/lib/db/uploads';
import { analyzeCapture, type AnalysisTag } from '@/lib/claude/analyze';

const AnalyzeRequestSchema = z.object({
  uploadId: z.string(),
  analysisTag: z.enum(['semantico', 'gt', 'mistranslation', 'todo']),
});

export async function POST(request: NextRequest) {
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

    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
    }

    const { uploadId, analysisTag } = parsed.data;

    const upload = getUpload(uploadId);
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    if (upload.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tags = upload.tags ? (JSON.parse(upload.tags) as string[]) : [];

    const result = await analyzeCapture({
      filePath: upload.filePath,
      fileType: upload.fileType,
      caso: upload.casoId,
      regimenVerdad: upload.regimenVerdad,
      fuenteTipo: upload.fuenteTipo,
      fechaEvento: upload.fechaEvento,
      tags,
      analysisTag: analysisTag as AnalysisTag,
    });

    updateUploadAnalysis(
      uploadId,
      result.transcription ?? '',
      result.analysis ?? '',
      result.codes ?? '',
      result.mistranslations ?? '',
    );

    updateUploadStatus(uploadId, 'open');

    return NextResponse.json({
      success: true,
      uploadId,
      result,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 },
    );
  }
}
