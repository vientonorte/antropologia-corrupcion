import fs from 'fs';
import path from 'path';
import simpleGit, { type SimpleGit } from 'simple-git';
import { CASOS } from '@/lib/corpus/cases';
import type { UploadRecord } from '@/lib/db/uploads';

const CORPUS_REPO_PATH = process.env.CORPUS_REPO_PATH ?? '';

function getGit(): SimpleGit {
  if (!CORPUS_REPO_PATH) {
    throw new Error('CORPUS_REPO_PATH env var not set');
  }
  if (!fs.existsSync(CORPUS_REPO_PATH)) {
    throw new Error(`Corpus repo not found at: ${CORPUS_REPO_PATH}`);
  }
  return simpleGit(CORPUS_REPO_PATH);
}

function casoSlug(casoId: 1 | 2 | 3 | 4): string {
  const caso = Object.values(CASOS).find((c) => c.id === casoId);
  return caso?.slug ?? `caso-${casoId}`;
}

function buildSlug(upload: UploadRecord): string {
  const ext = path.extname(upload.fileName);
  const base = path.basename(upload.fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return base || upload.id.slice(0, 8);
}

function captureDir(upload: UploadRecord): string {
  const fecha = upload.fechaEvento
    ? upload.fechaEvento.slice(0, 10)
    : new Date(upload.createdAt).toISOString().slice(0, 10);
  const slug = buildSlug(upload);
  const caso = casoSlug(upload.casoId);
  return path.join(CORPUS_REPO_PATH, 'corpus', caso, `${fecha}-${slug}`);
}

export interface WriteResult {
  dir: string;
  files: string[];
}

export function writeCaptureToDisk(upload: UploadRecord): WriteResult {
  const dir = captureDir(upload);
  fs.mkdirSync(dir, { recursive: true });

  const files: string[] = [];

  // source file
  const srcExt = path.extname(upload.fileName);
  const sourceDest = path.join(dir, `source${srcExt}`);
  fs.copyFileSync(upload.filePath, sourceDest);
  files.push(sourceDest);

  // metadata.json
  const tags = upload.tags ? (JSON.parse(upload.tags) as string[]) : [];
  const metadata = {
    id: upload.id,
    caso: upload.casoId,
    fecha_captura: new Date(upload.createdAt).toISOString(),
    fecha_evento: upload.fechaEvento ?? null,
    fuente_tipo: upload.fuenteTipo,
    regimen_verdad_origen: upload.regimenVerdad,
    tags,
    estado_codificacion: upload.estadoCodificacion,
    hash_source: upload.hashSource,
  };
  const metaPath = path.join(dir, 'metadata.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  files.push(metaPath);

  // transcription.md
  if (upload.transcription) {
    const transcPath = path.join(dir, 'transcription.md');
    fs.writeFileSync(transcPath, upload.transcription, 'utf-8');
    files.push(transcPath);
  }

  // analysis.md
  if (upload.analysis) {
    const analysisPath = path.join(dir, 'analysis.md');
    fs.writeFileSync(analysisPath, upload.analysis, 'utf-8');
    files.push(analysisPath);
  }

  // codes.json
  if (upload.codes) {
    const codesPath = path.join(dir, 'codes.json');
    fs.writeFileSync(codesPath, upload.codes, 'utf-8');
    files.push(codesPath);
  }

  // mistranslations.json
  if (upload.mistranslations) {
    const mtPath = path.join(dir, 'mistranslations.json');
    fs.writeFileSync(mtPath, upload.mistranslations, 'utf-8');
    files.push(mtPath);
  }

  return { dir, files };
}

function buildCommitMessage(upload: UploadRecord): string {
  const tags = upload.tags ? (JSON.parse(upload.tags) as string[]) : [];
  const fecha = upload.fechaEvento
    ? upload.fechaEvento.slice(0, 10)
    : new Date(upload.createdAt).toISOString().slice(0, 10);
  const slug = buildSlug(upload);

  const analysisTag = tags.length > 0 ? tags.join(', ') : 'sin-tag';

  // Count codes if available
  let codesLine = '';
  if (upload.codes) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const codes = JSON.parse(upload.codes) as Record<string, any>;
      const open = Array.isArray(codes.codigos_open) ? codes.codigos_open.length : '?';
      const axial = Array.isArray(codes.codigos_axial) ? codes.codigos_axial.length : '?';
      codesLine = `\n- Códigos open: ${open} | axial: ${axial} | selective: pendiente`;
    } catch {
      // malformed JSON — skip
    }
  }

  return [
    `corpus(caso-${upload.casoId}): añade captura ${fecha}-${slug}`,
    '',
    `- Régimen origen: ${upload.regimenVerdad}`,
    `- Tag análisis: ${analysisTag}`,
    codesLine,
  ]
    .join('\n')
    .trim();
}

export async function commitCaptureToRepo(upload: UploadRecord): Promise<string> {
  const git = getGit();
  const { files } = writeCaptureToDisk(upload);

  const gitUserName = process.env.GIT_USER_NAME ?? 'Contra-archivo';
  const gitUserEmail = process.env.GIT_USER_EMAIL ?? 'terraza@local';

  await git.addConfig('user.name', gitUserName, false, 'local');
  await git.addConfig('user.email', gitUserEmail, false, 'local');

  // Stage only the new capture files
  const relFiles = files.map((f) => path.relative(CORPUS_REPO_PATH, f));
  await git.add(relFiles);

  const message = buildCommitMessage(upload);
  const result = await git.commit(message);

  return result.commit;
}

export async function getRemoteSyncStatus(): Promise<{ ahead: number; behind: number }> {
  const git = getGit();
  try {
    await git.fetch('origin', 'main');
    const status = await git.status();
    return { ahead: status.ahead, behind: status.behind };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}
