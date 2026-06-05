import { describe, it, expect } from 'vitest';
import {
  FuenteTipoEnum,
  RegimensVerdadEnum,
  EstadoCodificacionEnum,
  UploadInitSchema,
  UploadCompleteSchema,
} from '@/lib/corpus/schemas';

describe('FuenteTipoEnum', () => {
  it('accepts all valid fuente types', () => {
    const valid = [
      'documento_oficial',
      'prensa',
      'testimonio',
      'red_social',
      'archivo_propio',
      'otro',
    ] as const;
    valid.forEach((v) => {
      expect(() => FuenteTipoEnum.parse(v)).not.toThrow();
    });
  });

  it('rejects unknown fuente type', () => {
    expect(() => FuenteTipoEnum.parse('desconocido')).toThrow();
  });
});

describe('RegimensVerdadEnum', () => {
  it('accepts all valid regimen types', () => {
    const valid = ['juridico', 'mediatico', 'institucional', 'testimonial'] as const;
    valid.forEach((v) => {
      expect(() => RegimensVerdadEnum.parse(v)).not.toThrow();
    });
  });

  it('rejects unknown regimen type', () => {
    expect(() => RegimensVerdadEnum.parse('financiero')).toThrow();
  });
});

describe('EstadoCodificacionEnum', () => {
  it('accepts all valid estados', () => {
    const valid = ['pendiente', 'open', 'axial', 'selective', 'verificado'] as const;
    valid.forEach((v) => {
      expect(() => EstadoCodificacionEnum.parse(v)).not.toThrow();
    });
  });

  it('rejects unknown estado', () => {
    expect(() => EstadoCodificacionEnum.parse('cerrado')).toThrow();
  });
});

describe('UploadInitSchema', () => {
  const validPayload = {
    casoId: '1' as const,
    fuenteTipo: 'documento_oficial' as const,
    regimenVerdad: 'juridico' as const,
  };

  it('parses a valid payload and transforms casoId to number', () => {
    const result = UploadInitSchema.parse(validPayload);
    expect(result.casoId).toBe(1);
    expect(typeof result.casoId).toBe('number');
  });

  it('accepts optional fields', () => {
    const withOptionals = {
      ...validPayload,
      tags: ['corrupcion', 'territorio'],
      fechaEvento: '2026-01-15',
    };
    const result = UploadInitSchema.parse(withOptionals);
    expect(result.tags).toEqual(['corrupcion', 'territorio']);
    expect(result.fechaEvento).toBe('2026-01-15');
  });

  it('rejects casoId out of range', () => {
    expect(() => UploadInitSchema.parse({ ...validPayload, casoId: '5' })).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => UploadInitSchema.parse({ casoId: '1' })).toThrow();
  });

  it('accepts and transforms all four valid casoIds correctly', () => {
    ['1', '2', '3', '4'].forEach((id) => {
      const result = UploadInitSchema.parse({ ...validPayload, casoId: id });
      expect(result.casoId).toBe(parseInt(id, 10));
    });
  });
});

describe('UploadCompleteSchema', () => {
  it('parses valid upload complete payload', () => {
    const payload = { uploadId: 'abc-123', fileName: 'documento.pdf' };
    const result = UploadCompleteSchema.parse(payload);
    expect(result.uploadId).toBe('abc-123');
    expect(result.fileName).toBe('documento.pdf');
  });

  it('rejects missing uploadId', () => {
    expect(() => UploadCompleteSchema.parse({ fileName: 'doc.pdf' })).toThrow();
  });

  it('rejects missing fileName', () => {
    expect(() => UploadCompleteSchema.parse({ uploadId: 'abc' })).toThrow();
  });
});
