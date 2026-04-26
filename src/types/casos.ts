/** Capas de verdad de un caso */
export interface CasoLayer {
  titulo: string;
  descripcion: string;
  voces?: string[];
  documentos?: string[];
  documentos_ref?: string[];
  clasificaciones?: string[];
  keywords: string[];
  color?: string;
  valores?: string[];
}

/** Fricción explícita declarada en el JSON */
export interface CasoFriccion {
  tipo?: FrictionType;
  subtipo?: string;
  intensidad?: number;
  estado?: 'abierta' | 'cerrada' | 'latente';
  tension_central?: string;
  sin_resolver?: boolean;
}

/** Caso completo del JSON */
export interface Caso {
  id: string;
  titulo: string;
  anio: number;
  actores: string[];
  instituciones: string[];
  tags?: string[];
  conexiones?: string[];
  etica: CasoLayer;
  institucional: CasoLayer;
  material: CasoLayer;
  friccion?: CasoFriccion;
}

export interface CasosJSON {
  _meta?: Record<string, unknown>;
  casos: Caso[];
}

/** Tipos de fricción */
export type FrictionType = 'politica' | 'semantica' | 'tecnica';
export type LayerType = 'etica' | 'institucional' | 'material' | 'all';

/** Nodo computado para el grafo */
export interface GraphNode {
  id: string;
  titulo: string;
  anio: number;
  intensidad: number;
  tipo: FrictionType;
  subtipo: string | null;
  marcadores: string[];
  estado: string;
  tension: string;
  sinResolver: boolean;
  colorEtica: string;
  colorInstitucional: string;
  colorMaterial: string;
  tags: string[];
  etica: CasoLayer;
  institucional: CasoLayer;
  material: CasoLayer;
  audit: {
    avgOverlap: number;
    baseScore: number;
    markerScore: number;
    calculatedIntensity: number;
    source: 'json' | 'engine';
    explicitIntensity: number | null;
    effectiveIntensity: number;
    deltaFromCalculated: number;
  };
  // Propiedades de simulación (mutables por el motor de física)
  x: number;
  y: number;
  vx: number;
  vy: number;
  _dimmed?: boolean;
}

/** Arista del grafo */
export interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  weight: number;
  actores: string[];
  instituciones: string[];
  tags: string[];
}

/** Estado de la aplicación */
export interface AppState {
  mode: 'narrative' | 'graph';
  activeLayer: LayerType;
  activeFrictionType: FrictionType | 'all';
  fieldVisible: boolean;
  fieldPotential: boolean;
  fieldStreamlines: boolean;
  fieldParticles: boolean;
}
