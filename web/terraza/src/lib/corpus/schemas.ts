import { z } from 'zod';

export const FuenteTipoEnum = z.enum([
  'documento_oficial',
  'prensa',
  'testimonio',
  'red_social',
  'archivo_propio',
  'otro',
]);

export const RegimensVerdadEnum = z.enum([
  'juridico',
  'mediatico',
  'institucional',
  'testimonial',
]);

export const EstadoCodificacionEnum = z.enum([
  'pendiente',
  'open',
  'axial',
  'selective',
  'verificado',
]);

export const CasoIdEnum = z.enum(['1', '2', '3', '4']).transform((val) => parseInt(val, 10) as 1 | 2 | 3 | 4);

export const UploadInitSchema = z.object({
  casoId: z.enum(['1', '2', '3', '4']).transform((val) => parseInt(val, 10) as 1 | 2 | 3 | 4),
  fuenteTipo: FuenteTipoEnum,
  regimenVerdad: RegimensVerdadEnum,
  tags: z.array(z.string()).optional(),
  fechaEvento: z.string().optional(),
});

export const UploadCompleteSchema = z.object({
  uploadId: z.string(),
  fileName: z.string(),
});

export type FuenteTipo = z.infer<typeof FuenteTipoEnum>;
export type RegimensVerdad = z.infer<typeof RegimensVerdadEnum>;
export type EstadoCodificacion = z.infer<typeof EstadoCodificacionEnum>;
export type UploadInit = z.infer<typeof UploadInitSchema>;
export type UploadComplete = z.infer<typeof UploadCompleteSchema>;
