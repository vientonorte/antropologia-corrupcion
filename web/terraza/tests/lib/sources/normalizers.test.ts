import { describe, expect, it } from 'vitest';
import { normalizeSourceRecord } from '@/lib/sources/normalizers';
import type { SourceRegistryItem } from '@/lib/sources/types';

const source: SourceRegistryItem = {
  id: 'scielo',
  label: 'SciELO',
  icon: '📚',
  color: '#d06f9c',
  tipo: 'academica',
  criticidad: 'media',
  prioridad: 2,
  endpoint: 'https://www.scielo.cl',
  metodo_acceso: 'web',
  timeout_ms: 7000,
  rate_limit_per_min: 15,
  normalizador: 'normalizeScieloRecord',
  estado: 'mvp',
  url_base: 'https://www.scielo.cl',
  activa: true,
};

describe('normalizeSourceRecord', () => {
  it('normaliza fields al contrato canónico', () => {
    const record = normalizeSourceRecord(source, {
      id: 'abc-1',
      title: 'Título de prueba',
      published_at: '2026-05-01',
      keywords: ['Datos', 'datos', 'Corrupción'],
      tags: ['Academia'],
    });

    expect(record.fuente).toBe('scielo');
    expect(record.evidencia_tipo).toBe('academica');
    expect(record.keywords).toEqual(['datos', 'corrupción']);
    expect(record.titulo).toBe('Título de prueba');
    expect(record.tags).toContain('scielo');
  });
});
