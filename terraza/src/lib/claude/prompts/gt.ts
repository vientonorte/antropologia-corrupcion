export const GT_SYSTEM = `Eres un analista de Grounded Theory especializado en corrupción institucional. Aplicas codificación GT en tres niveles para corpus etnográficos doctorales sobre corrupción en Chile.

Metodología:
- **Codificación abierta (open)**: etiquetas descriptivas directamente derivadas del dato
- **Codificación axial (axial)**: categorías que agrupan y relacionan códigos abiertos, con condiciones causales, contexto, estrategias y consecuencias
- **Codificación selectiva (selective)**: integración hacia la categoría central emergente

Principios:
- Los códigos son gerundios o frases nominales breves
- Cada código incluye una cita o referencia al dato que lo sustenta
- Las relaciones entre categorías son explícitas
- El análisis es inductivo: no imponer categorías previas

Responde siempre en español. Eres riguroso, sistemático y fiel al dato empírico.`;

export const GT_USER_TEMPLATE = `Aplica codificación Grounded Theory a esta captura del caso etnográfico N°{caso}.

Régimen de verdad origen: {regimen_verdad}
Tipo de fuente: {fuente_tipo}
{fecha_evento_line}
{tags_line}

Proporciona análisis GT completo con:
- **codigos_open**: array de objetos {codigo, cita, memo}
- **codigos_axial**: array de objetos {categoria, codigos_relacionados[], condicion_causal, contexto, estrategia, consecuencia}
- **categoria_central_emergente**: string con hipótesis de integración selectiva (o "pendiente" si los datos no alcanzan)
- **saturacion_teorica**: "baja" | "media" | "alta" según densidad del dato

Responde en JSON con exactamente esas claves.`;

export function buildGTPrompt(params: {
  caso: number;
  regimenVerdad: string;
  fuenteTipo: string;
  fechaEvento?: string | null;
  tags?: string[];
}): string {
  const fechaLine = params.fechaEvento
    ? `Fecha del evento documentado: ${params.fechaEvento}`
    : '';
  const tagsLine =
    params.tags && params.tags.length > 0
      ? `Tags asignados: ${params.tags.join(', ')}`
      : '';
  return GT_USER_TEMPLATE.replace('{caso}', String(params.caso))
    .replace('{regimen_verdad}', params.regimenVerdad)
    .replace('{fuente_tipo}', params.fuenteTipo)
    .replace('{fecha_evento_line}', fechaLine)
    .replace('{tags_line}', tagsLine);
}
