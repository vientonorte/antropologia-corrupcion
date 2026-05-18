import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { UploadInitSchema } from '@/lib/corpus/schemas';
import { createUpload } from '@/lib/db/uploads';
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const metadata = formData.get('metadata') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!metadata) {
      return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, PDF' },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 50MB' },
        { status: 400 },
      );
    }

    // Parse and validate metadata
    let uploadMeta;
    try {
      uploadMeta = UploadInitSchema.parse(JSON.parse(metadata));
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid metadata' },
        { status: 400 },
      );
    }

    // Read file buffer and compute hash
    const buffer = await file.arrayBuffer();
    const hashSource = createHash('sha256')
      .update(Buffer.from(buffer))
      .digest('hex');

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Create upload with unique filename based on hash
    const ext = path.extname(file.name);
    const fileName = `${hashSource}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Create upload record in database
    const upload = createUpload(
      session.userId,
      uploadMeta.casoId,
      file.name,
      filePath,
      file.type,
      file.size,
      hashSource,
      uploadMeta.fuenteTipo,
      uploadMeta.regimenVerdad,
      uploadMeta.tags,
      uploadMeta.fechaEvento,
    );

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      hashSource: upload.hashSource,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 },
    );
  }
}
