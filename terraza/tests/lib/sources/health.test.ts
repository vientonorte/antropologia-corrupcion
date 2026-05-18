import { describe, expect, it } from 'vitest';
import { runConsolidationPipeline } from '@/lib/sources/health';

describe('runConsolidationPipeline', () => {
  it('normaliza registros para múltiples fuentes heterogéneas', async () => {
    const result = await runConsolidationPipeline(['scielo', 'diariooficial', 'ciper']);
    expect(result.length).toBe(3);
    for (const chunk of result) {
      expect(chunk.records.length).toBeGreaterThan(0);
      expect(chunk.records[0].fuente).toBe(chunk.sourceId);
      expect(Array.isArray(chunk.records[0].keywords)).toBe(true);
    }
  });
});
