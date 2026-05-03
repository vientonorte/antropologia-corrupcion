import { describe, it, expect } from 'vitest';
import { CASOS, type CasoId, type CasoKey } from '@/lib/corpus/cases';

describe('CASOS', () => {
  it('should export four cases with correct structure', () => {
    expect(Object.keys(CASOS)).toHaveLength(4);
  });

  it('should have all required properties on each case', () => {
    Object.values(CASOS).forEach((caso) => {
      expect(caso).toHaveProperty('id');
      expect(caso).toHaveProperty('slug');
      expect(caso).toHaveProperty('label');
      expect(caso).toHaveProperty('provisional');
    });
  });

  it('should have unique ids', () => {
    const ids = Object.values(CASOS).map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique slugs', () => {
    const slugs = Object.values(CASOS).map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should allow type-safe access via CasoKey', () => {
    const key: CasoKey = 'SURA_GOBERNANZA';
    expect(CASOS[key]).toBeDefined();
    expect(CASOS[key].id).toBe(1);
  });

  it('should allow type-safe id reference via CasoId', () => {
    const id: CasoId = 1;
    const caso = Object.values(CASOS).find((c) => c.id === id);
    expect(caso).toBeDefined();
    expect(caso?.slug).toBe('sura-gobernanza-datos');
  });

  it('should have SURA_GOBERNANZA as non-provisional', () => {
    expect(CASOS.SURA_GOBERNANZA.provisional).toBe(false);
  });

  it('should have LA_NEGRA as provisional', () => {
    expect(CASOS.LA_NEGRA.provisional).toBe(true);
  });
});
