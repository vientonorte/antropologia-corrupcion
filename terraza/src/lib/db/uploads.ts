import { getDatabase } from './init';
import { v4 as uuidv4 } from 'uuid';

export type FuenteTipo = 'documento_oficial' | 'prensa' | 'testimonio' | 'red_social' | 'archivo_propio' | 'otro';
export type RegimensVerdad = 'juridico' | 'mediatico' | 'institucional' | 'testimonial';
export type EstadoCodificacion = 'pendiente' | 'open' | 'axial' | 'selective' | 'verificado';

export interface UploadRecord {
  id: string;
  userId: string;
  casoId: 1 | 2 | 3 | 4;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  hashSource: string;
  fuenteTipo: FuenteTipo;
  regimenVerdad: RegimensVerdad;
  tags: string | null;
  estadoCodificacion: EstadoCodificacion;
  fechaEvento: string | null;
  transcription: string | null;
  analysis: string | null;
  codes: string | null;
  mistranslations: string | null;
  createdAt: number;
  updatedAt: number;
}

export function createUpload(
  userId: string,
  casoId: 1 | 2 | 3 | 4,
  fileName: string,
  filePath: string,
  fileType: string,
  fileSize: number,
  hashSource: string,
  fuenteTipo: FuenteTipo,
  regimenVerdad: RegimensVerdad,
  tags?: string[],
  fechaEvento?: string,
): UploadRecord {
  const db = getDatabase();
  const id = uuidv4();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO uploads (
      id, user_id, caso_id, file_name, file_path, file_type, file_size,
      hash_source, fuente_tipo, regimen_verdad, tags, estado_codificacion,
      fecha_evento, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    casoId,
    fileName,
    filePath,
    fileType,
    fileSize,
    hashSource,
    fuenteTipo,
    regimenVerdad,
    tags ? JSON.stringify(tags) : null,
    'pendiente',
    fechaEvento || null,
    now,
    now,
  );

  return {
    id,
    userId,
    casoId,
    fileName,
    filePath,
    fileType,
    fileSize,
    hashSource,
    fuenteTipo,
    regimenVerdad,
    tags: tags ? JSON.stringify(tags) : null,
    estadoCodificacion: 'pendiente',
    fechaEvento: fechaEvento || null,
    transcription: null,
    analysis: null,
    codes: null,
    mistranslations: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getUpload(id: string): UploadRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM uploads WHERE id = ?');
  const row = stmt.get(id) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    casoId: row.caso_id as 1 | 2 | 3 | 4,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    hashSource: row.hash_source as string,
    fuenteTipo: row.fuente_tipo as FuenteTipo,
    regimenVerdad: row.regimen_verdad as RegimensVerdad,
    tags: (row.tags as string) || null,
    estadoCodificacion: row.estado_codificacion as EstadoCodificacion,
    fechaEvento: (row.fecha_evento as string) || null,
    transcription: (row.transcription as string) || null,
    analysis: (row.analysis as string) || null,
    codes: (row.codes as string) || null,
    mistranslations: (row.mistranslations as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function getUploadsByUserId(userId: string, limit: number = 50): UploadRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
  );
  const rows = stmt.all(userId, limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    casoId: row.caso_id as 1 | 2 | 3 | 4,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    hashSource: row.hash_source as string,
    fuenteTipo: row.fuente_tipo as FuenteTipo,
    regimenVerdad: row.regimen_verdad as RegimensVerdad,
    tags: (row.tags as string) || null,
    estadoCodificacion: row.estado_codificacion as EstadoCodificacion,
    fechaEvento: (row.fecha_evento as string) || null,
    transcription: (row.transcription as string) || null,
    analysis: (row.analysis as string) || null,
    codes: (row.codes as string) || null,
    mistranslations: (row.mistranslations as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}

export function getUploadByCaso(casoId: 1 | 2 | 3 | 4, limit: number = 50): UploadRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM uploads WHERE caso_id = ? ORDER BY created_at DESC LIMIT ?',
  );
  const rows = stmt.all(casoId, limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    casoId: row.caso_id as 1 | 2 | 3 | 4,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    hashSource: row.hash_source as string,
    fuenteTipo: row.fuente_tipo as FuenteTipo,
    regimenVerdad: row.regimen_verdad as RegimensVerdad,
    tags: (row.tags as string) || null,
    estadoCodificacion: row.estado_codificacion as EstadoCodificacion,
    fechaEvento: (row.fecha_evento as string) || null,
    transcription: (row.transcription as string) || null,
    analysis: (row.analysis as string) || null,
    codes: (row.codes as string) || null,
    mistranslations: (row.mistranslations as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}

export function updateUploadAnalysis(
  id: string,
  transcription: string,
  analysis: string,
  codes: string,
  mistranslations: string,
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE uploads
    SET transcription = ?, analysis = ?, codes = ?, mistranslations = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(transcription, analysis, codes, mistranslations, Date.now(), id);
}

export function updateUploadStatus(
  id: string,
  estadoCodificacion: EstadoCodificacion,
): void {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE uploads SET estado_codificacion = ?, updated_at = ? WHERE id = ?',
  );
  stmt.run(estadoCodificacion, Date.now(), id);
}

export function getUploadByHash(hashSource: string): UploadRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM uploads WHERE hash_source = ?');
  const row = stmt.get(hashSource) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    casoId: row.caso_id as 1 | 2 | 3 | 4,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    hashSource: row.hash_source as string,
    fuenteTipo: row.fuente_tipo as FuenteTipo,
    regimenVerdad: row.regimen_verdad as RegimensVerdad,
    tags: (row.tags as string) || null,
    estadoCodificacion: row.estado_codificacion as EstadoCodificacion,
    fechaEvento: (row.fecha_evento as string) || null,
    transcription: (row.transcription as string) || null,
    analysis: (row.analysis as string) || null,
    codes: (row.codes as string) || null,
    mistranslations: (row.mistranslations as string) || null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export interface UploadStats {
  total: number;
  byCaso: Record<number, number>;
  byEstado: Record<EstadoCodificacion, number>;
  byFuente: Record<FuenteTipo, number>;
}

export function getUploadStats(): UploadStats {
  const db = getDatabase();

  const total = (db.prepare('SELECT COUNT(*) as count FROM uploads').get() as Record<string, unknown>).count as number;

  const byCasoRows = db.prepare('SELECT caso_id, COUNT(*) as count FROM uploads GROUP BY caso_id').all() as Record<string, unknown>[];
  const byCaso: Record<number, number> = {};
  for (const row of byCasoRows) {
    byCaso[row.caso_id as number] = row.count as number;
  }

  const byEstadoRows = db.prepare('SELECT estado_codificacion, COUNT(*) as count FROM uploads GROUP BY estado_codificacion').all() as Record<string, unknown>[];
  const byEstado = {} as Record<EstadoCodificacion, number>;
  for (const row of byEstadoRows) {
    byEstado[row.estado_codificacion as EstadoCodificacion] = row.count as number;
  }

  const byFuenteRows = db.prepare('SELECT fuente_tipo, COUNT(*) as count FROM uploads GROUP BY fuente_tipo').all() as Record<string, unknown>[];
  const byFuente = {} as Record<FuenteTipo, number>;
  for (const row of byFuenteRows) {
    byFuente[row.fuente_tipo as FuenteTipo] = row.count as number;
  }

  return { total, byCaso, byEstado, byFuente };
}
