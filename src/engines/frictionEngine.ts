/**
 * frictionEngine.ts
 * Port TypeScript de frictionEngine.js — zero-dependency, zero-DOM.
 * Fricción = diferencia irreductible entre capas de verdad.
 */

import type { Caso, CasoLayer, FrictionType, GraphNode, GraphLink } from '../types/casos';

/* ─── CONSTANTES ─── */

export const FRICTION_TYPES = Object.freeze({
  POLITICA: 'politica' as FrictionType,
  SEMANTICA: 'semantica' as FrictionType,
  TECNICA: 'tecnica' as FrictionType,
});

const FRICTION_PAIR_LABELS: Record<string, string> = {
  etica_institucional: 'Ética ↔ Institucional',
  etica_material: 'Ética ↔ Material',
  institucional_material: 'Institucional ↔ Material',
};

interface FrictionMarker {
  a: string;
  b: string;
  tipo: FrictionType;
  peso: number;
}

const FRICTION_MARKERS: FrictionMarker[] = [
  { a: 'consentimiento', b: 'proceso administrativo', tipo: 'semantica', peso: 0.9 },
  { a: 'consulta', b: 'trámite', tipo: 'semantica', peso: 0.85 },
  { a: 'territorio', b: 'catastro', tipo: 'semantica', peso: 0.88 },
  { a: 'memoria', b: 'clasificación', tipo: 'semantica', peso: 0.75 },
  { a: 'autonomía', b: 'regulación', tipo: 'semantica', peso: 0.72 },
  { a: 'testimonio', b: 'resolución', tipo: 'politica', peso: 0.8 },
  { a: 'soberanía', b: 'CONADI', tipo: 'politica', peso: 0.9 },
  { a: 'resistencia', b: 'admisibilidad', tipo: 'politica', peso: 0.85 },
  { a: 'fuente', b: 'registro', tipo: 'politica', peso: 0.7 },
  { a: 'evidencia', b: 'dato', tipo: 'tecnica', peso: 0.65 },
  { a: 'deforestación', b: 'uso productivo', tipo: 'tecnica', peso: 0.88 },
  { a: 'opacidad', b: 'transparencia', tipo: 'tecnica', peso: 0.82 },
  { a: 'whistleblower', b: 'proceso regular', tipo: 'tecnica', peso: 0.78 },
  { a: 'consentimiento', b: 'liquidez como semáforo', tipo: 'tecnica', peso: 0.87 },
  { a: 'rescates fondos mutuos', b: 'cumplimiento normativo', tipo: 'tecnica', peso: 0.84 },
  { a: 'custodia transnacional', b: 'regulación', tipo: 'politica', peso: 0.86 },
  { a: 'opacidad', b: 'patrimonio depurado', tipo: 'tecnica', peso: 0.80 },
  { a: 'trabajador', b: 'cartera de custodia', tipo: 'semantica', peso: 0.91 },
];

/* ─── UTILIDADES ─── */

export function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function extractKeywords(capa: CasoLayer | undefined): string[] {
  if (!capa) return [];
  const base = [
    ...(capa.keywords ?? []),
    ...(capa.clasificaciones ?? []),
    capa.titulo ?? '',
    capa.descripcion ?? '',
  ];
  return base.flatMap((s) => normalizeStr(s).split(/\s+/)).filter(Boolean);
}

function keywordOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const intersection = b.filter((k) => setA.has(k));
  return intersection.length / Math.max(a.length, b.length);
}

/* ─── DETECCIÓN DE MARCADORES ─── */

interface MarkerResult {
  markers: FrictionMarker[];
  maxPeso: number;
}

function detectMarkers(kwA: string[], kwB: string[]): MarkerResult {
  const found: FrictionMarker[] = [];
  for (const marker of FRICTION_MARKERS) {
    const hasA = kwA.some((k) => k.includes(normalizeStr(marker.a)));
    const hasB = kwB.some((k) => k.includes(normalizeStr(marker.b)));
    const hasCross =
      kwA.some((k) => k.includes(normalizeStr(marker.b))) &&
      kwB.some((k) => k.includes(normalizeStr(marker.a)));
    if ((hasA && hasB) || hasCross) found.push(marker);
  }
  const maxPeso = found.length ? Math.max(...found.map((m) => m.peso)) : 0;
  return { markers: found, maxPeso };
}

interface PairAudit {
  id: string;
  label: string;
  overlap: number;
  overlapScore: number;
  markerScore: number;
  pairIntensity: number;
  markers: Array<{ a: string; b: string; tipo: FrictionType; peso: number; label: string }>;
}

function auditLayerPair(pairId: string, kwA: string[], kwB: string[]): PairAudit {
  const overlap = keywordOverlap(kwA, kwB);
  const { markers, maxPeso } = detectMarkers(kwA, kwB);
  const overlapScore = 1 - Math.min(overlap * 8, 1);
  const pairIntensity =
    maxPeso > 0 ? overlapScore * 0.4 + maxPeso * 0.6 : overlapScore * 0.7;

  return {
    id: pairId,
    label: FRICTION_PAIR_LABELS[pairId] ?? pairId,
    overlap: parseFloat(overlap.toFixed(3)),
    overlapScore: parseFloat(overlapScore.toFixed(3)),
    markerScore: parseFloat(maxPeso.toFixed(3)),
    pairIntensity: parseFloat(pairIntensity.toFixed(3)),
    markers: markers.map((m) => ({
      a: m.a,
      b: m.b,
      tipo: m.tipo,
      peso: m.peso,
      label: `${m.a} ↔ ${m.b}`,
    })),
  };
}

export interface CaseFrictionAudit {
  avgOverlap: number;
  baseScore: number;
  markerScore: number;
  calculatedIntensity: number;
  dominantPair: PairAudit | null;
  pairs: PairAudit[];
}

export function auditCaseFriction(
  etica: CasoLayer | undefined,
  institucional: CasoLayer | undefined,
  material: CasoLayer | undefined
): CaseFrictionAudit {
  const kwE = extractKeywords(etica);
  const kwI = extractKeywords(institucional);
  const kwM = extractKeywords(material);

  const pairs = [
    auditLayerPair('etica_institucional', kwE, kwI),
    auditLayerPair('etica_material', kwE, kwM),
    auditLayerPair('institucional_material', kwI, kwM),
  ];

  const avgOverlap = pairs.reduce((sum, p) => sum + p.overlap, 0) / pairs.length;
  const markerScore = Math.max(...pairs.map((p) => p.markerScore));
  const baseScore = 1 - Math.min(avgOverlap * 8, 1);
  const calculatedIntensity =
    markerScore > 0 ? baseScore * 0.4 + markerScore * 0.6 : baseScore * 0.7;

  const dominantPair =
    pairs.slice().sort((a, b) => b.pairIntensity - a.pairIntensity)[0] ?? null;

  return {
    avgOverlap: parseFloat(avgOverlap.toFixed(3)),
    baseScore: parseFloat(baseScore.toFixed(3)),
    markerScore: parseFloat(markerScore.toFixed(3)),
    calculatedIntensity: Math.min(Math.max(parseFloat(calculatedIntensity.toFixed(3)), 0.05), 1.0),
    dominantPair,
    pairs,
  };
}

export interface FrictionTypeResult {
  tipo: FrictionType;
  subtipo: string | null;
  marcadores: string[];
  confianza: number;
}

export function detectFrictionType(caso: Caso): FrictionTypeResult {
  const kwE = extractKeywords(caso.etica);
  const kwI = extractKeywords(caso.institucional);
  const kwM = extractKeywords(caso.material);

  const pairs = [
    { a: kwE, b: kwI },
    { a: kwE, b: kwM },
    { a: kwI, b: kwM },
  ];

  const allMarkers: FrictionMarker[] = [];
  for (const { a, b } of pairs) {
    allMarkers.push(...detectMarkers(a, b).markers);
  }

  const scores: Record<FrictionType, number> = { politica: 0, semantica: 0, tecnica: 0 };
  for (const m of allMarkers) scores[m.tipo] += m.peso;

  const tipoExplicito = caso.friccion?.tipo;
  const subtipoExplicito = caso.friccion?.subtipo ?? null;
  const tipoCalculado = (
    Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'semantica'
  ) as FrictionType;

  return {
    tipo: tipoExplicito ?? tipoCalculado,
    subtipo: subtipoExplicito,
    marcadores: allMarkers.map((m) => `${m.a} ↔ ${m.b}`),
    confianza: allMarkers.length > 0 ? Math.min(allMarkers.length / 5, 1) : 0.3,
  };
}

/* ─── CONEXIONES ENTRE CASOS ─── */

function sharedActors(a: Caso, b: Caso): string[] {
  const setA = new Set((a.actores ?? []).map(normalizeStr));
  return (b.actores ?? []).filter((x) => setA.has(normalizeStr(x)));
}

function sharedInstituciones(a: Caso, b: Caso): string[] {
  const setA = new Set((a.instituciones ?? []).map(normalizeStr));
  return (b.instituciones ?? []).filter((x) => setA.has(normalizeStr(x)));
}

function sharedTags(a: Caso, b: Caso): string[] {
  const setA = new Set((a.tags ?? []).map(normalizeStr));
  return (b.tags ?? []).filter((x) => setA.has(normalizeStr(x)));
}

function connectionWeight(a: Caso, b: Caso): number {
  const actors = sharedActors(a, b).length;
  const instit = sharedInstituciones(a, b).length;
  const tags = sharedTags(a, b).length;
  const explicit = (a.conexiones ?? []).includes(b.id) ? 1 : 0;
  const raw = actors * 0.3 + instit * 0.25 + tags * 0.15 + explicit * 0.8;
  return Math.min(parseFloat(raw.toFixed(3)), 1.0);
}

/** Construye nodos y aristas del grafo a partir de los casos del JSON */
export function buildGraph(
  casos: Caso[],
  width: number,
  height: number
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = casos.map((caso) => {
    const audit = auditCaseFriction(caso.etica, caso.institucional, caso.material);
    const explicitIntensity = caso.friccion?.intensidad ?? null;
    const intensity = explicitIntensity ?? audit.calculatedIntensity;
    const { tipo, subtipo, marcadores } = detectFrictionType(caso);

    return {
      id: caso.id,
      titulo: caso.titulo,
      anio: caso.anio,
      intensidad: intensity,
      tipo,
      subtipo,
      marcadores,
      estado: caso.friccion?.estado ?? 'abierta',
      tension: caso.friccion?.tension_central ?? '',
      sinResolver: caso.friccion?.sin_resolver ?? true,
      colorEtica: caso.etica?.color ?? '#c8a96e',
      colorInstitucional: caso.institucional?.color ?? '#4a7fa5',
      colorMaterial: caso.material?.color ?? '#7a9e6e',
      tags: caso.tags ?? [],
      etica: caso.etica,
      institucional: caso.institucional,
      material: caso.material,
      audit: {
        ...audit,
        source: explicitIntensity != null ? 'json' : 'engine',
        explicitIntensity,
        effectiveIntensity: intensity,
        deltaFromCalculated:
          explicitIntensity != null
            ? parseFloat((explicitIntensity - audit.calculatedIntensity).toFixed(3))
            : 0,
      },
      // Posición inicial aleatoria dentro del canvas
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const links: GraphLink[] = [];
  for (let i = 0; i < casos.length; i++) {
    for (let j = i + 1; j < casos.length; j++) {
      const weight = connectionWeight(casos[i], casos[j]);
      if (weight > 0.1) {
        const src = nodeMap.get(casos[i].id);
        const tgt = nodeMap.get(casos[j].id);
        if (src && tgt) {
          links.push({
            source: src,
            target: tgt,
            weight,
            actores: sharedActors(casos[i], casos[j]),
            instituciones: sharedInstituciones(casos[i], casos[j]),
            tags: sharedTags(casos[i], casos[j]),
          });
        }
      }
    }
  }

  return { nodes, links };
}

/* ─── FILTROS ─── */

export function filterByLayer(nodes: GraphNode[], capa: string): GraphNode[] {
  if (capa === 'all') return nodes.map((n) => ({ ...n, _dimmed: false }));
  return nodes.map((n) => ({ ...n, _dimmed: !n[capa as keyof GraphNode] }));
}

export function filterByFrictionType(nodes: GraphNode[], tipo: string): GraphNode[] {
  if (!tipo || tipo === 'all') return nodes.map((n) => ({ ...n, _dimmed: false }));
  return nodes.map((n) => ({ ...n, _dimmed: n.tipo !== tipo }));
}

export function filterByIntensity(nodes: GraphNode[], minIntensidad: number): GraphNode[] {
  return nodes.map((n) => ({ ...n, _dimmed: n.intensidad < minIntensidad }));
}

export { FRICTION_MARKERS };
