import fs from 'fs';
import path from 'path';
import type { SourceRegistry, SourceRegistryItem } from './types';

const FALLBACK_REGISTRY: SourceRegistry = { sources: [] };
let cachedRegistry: SourceRegistry | null = null;

function resolveRegistryPath(): string {
  return path.join(process.cwd(), '..', 'data', 'fuentes-config.json');
}

export function getSourceRegistry(): SourceRegistry {
  if (cachedRegistry) return cachedRegistry;

  const registryPath = resolveRegistryPath();
  try {
    const raw = fs.readFileSync(registryPath, 'utf-8');
    const parsed = JSON.parse(raw) as SourceRegistry;
    if (!parsed.sources || !Array.isArray(parsed.sources)) {
      return FALLBACK_REGISTRY;
    }
    cachedRegistry = parsed;
    return parsed;
  } catch {
    return FALLBACK_REGISTRY;
  }
}

export function listRegistrySources(): SourceRegistryItem[] {
  return getSourceRegistry().sources.slice().sort((a, b) => a.prioridad - b.prioridad);
}

export function getRegistrySourceById(sourceId: string): SourceRegistryItem | null {
  const source = listRegistrySources().find((item) => item.id === sourceId);
  return source ?? null;
}

export function clearRegistryCache(): void {
  cachedRegistry = null;
}
