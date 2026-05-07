import type { SourceRegistryItem } from './types';

export interface CanonicalSourceRecord {
  id: string;
  fuente: string;
  titulo: string;
  fecha: string;
  url: string;
  institucion: string;
  materia: string;
  keywords: string[];
  capa_oficial: string;
  friccion_con: string;
  tipo_friccion: 'politica' | 'semantica' | 'tecnica';
  tags: string[];
  published_at: string;
  fetched_at: string;
  verificado: boolean;
  official_score: number;
  evidencia_tipo: 'oficial' | 'academica' | 'periodistica';
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeKeywords(list: unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const kw = normalizeText(item).toLowerCase();
    if (!kw || seen.has(kw)) continue;
    seen.add(kw);
    out.push(kw);
  }
  return out;
}

function mapEvidenceType(
  source: SourceRegistryItem,
): 'oficial' | 'academica' | 'periodistica' {
  if (source.tipo === 'academica') return 'academica';
  if (source.tipo === 'periodistica') return 'periodistica';
  return 'oficial';
}

function parseTipoFriccion(value: unknown): 'politica' | 'semantica' | 'tecnica' {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'politica') return 'politica';
  if (normalized === 'tecnica') return 'tecnica';
  // Default conservador: cuando no hay tipo explícito, tratamos la fricción como semántica.
  return 'semantica';
}

export function normalizeSourceRecord(
  source: SourceRegistryItem,
  raw: Record<string, unknown>,
): CanonicalSourceRecord {
  const now = new Date().toISOString().slice(0, 10);
  const keywords = normalizeKeywords([
    ...(Array.isArray(raw.keywords) ? raw.keywords : []),
    raw.tema,
    raw.topic,
    raw.norma_tipo,
  ]);

  const tags = normalizeKeywords([
    ...(Array.isArray(raw.tags) ? raw.tags : []),
    source.label,
    source.tipo,
  ]);

  return {
    id: normalizeText(raw.id || raw.pid || raw.doi || `${source.id}-${Date.now()}`),
    fuente: source.id,
    titulo: normalizeText(raw.titulo || raw.title || raw.headline || source.label),
    fecha: normalizeText(raw.fecha || raw.published_at || now),
    url: normalizeText(raw.url || raw.link || source.endpoint),
    institucion: normalizeText(raw.institucion || raw.journal || source.label),
    materia: normalizeText(raw.materia || raw.abstract || raw.descripcion || ''),
    keywords,
    capa_oficial: normalizeText(
      raw.capa_oficial || `Registro normalizado desde ${source.label} (${source.metodo_acceso}).`,
    ),
    friccion_con: normalizeText(raw.friccion_con || 'periodismo-datos-chile'),
    tipo_friccion: parseTipoFriccion(raw.tipo_friccion),
    tags,
    published_at: normalizeText(raw.published_at || raw.fecha || now),
    fetched_at: now,
    verificado: raw.verificado !== false,
    official_score: typeof raw.official_score === 'number' ? raw.official_score : 0.7,
    evidencia_tipo: mapEvidenceType(source),
  };
}
