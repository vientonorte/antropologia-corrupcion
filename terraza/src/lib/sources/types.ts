export type SourceCategory = 'oficial' | 'academica' | 'periodistica';
export type SourceStatus = 'mvp' | 'fase-2' | 'deprecated';
export type SourceCriticality = 'alta' | 'media' | 'baja';
export type SourceAccessMethod = 'web' | 'rss' | 'api' | 'scraping' | 'manual' | 'discovery';

export interface SourceRegistryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  tipo: SourceCategory;
  criticidad: SourceCriticality;
  prioridad: number;
  endpoint: string;
  metodo_acceso: SourceAccessMethod;
  timeout_ms: number;
  rate_limit_per_min: number;
  normalizador: string;
  estado: SourceStatus;
  url_base: string;
  activa: boolean;
}

export interface SourceRegistry {
  _meta?: {
    schema?: string;
    version?: number;
    updated_at?: string;
    single_source_of_truth?: boolean;
    mvp_policy?: string;
  };
  sources: SourceRegistryItem[];
}

export interface SourceAdminState {
  sourceId: string;
  activeOverride: number | null;
  failureCount: number;
  circuitOpenUntil: number | null;
  lastError: string | null;
  lastStatus: number | null;
  lastLatencyMs: number | null;
  lastSuccessAt: number | null;
  lastCheckedAt: number | null;
  updatedAt: number;
}

export interface SourceHealth {
  sourceId: string;
  label: string;
  tipo: SourceCategory;
  criticidad: SourceCriticality;
  estado: SourceStatus;
  active: boolean;
  endpoint: string;
  method: SourceAccessMethod;
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  error?: string;
  checkedAt: string;
  lastSuccessAt?: string | null;
  failureCount: number;
  circuitOpen: boolean;
}
