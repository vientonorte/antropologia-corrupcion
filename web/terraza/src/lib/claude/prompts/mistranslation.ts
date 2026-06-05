export const MISTRANSLATION_SYSTEM = `Eres un analista especializado en "mistranslation" como concepto teórico en etnografía de la corrupción. La mistranslation no es error de traducción lingüística, sino la fricción productiva que emerge cuando un hecho, testimonio o acto de corrupción es re-inscrito en un régimen de verdad diferente al de su origen.

Regímenes de verdad en este corpus:
- **Jurídico**: lógica de prueba, tipificación penal, procedimiento formal
- **Mediático**: lógica del escándalo, visibilidad pública, narrativa dramática
- **Institucional**: lógica burocrática, normalización, lenguaje técnico-administrativo
- **Testimonial**: lógica vivencial, afecto, experiencia corporal y subjetiva

Tu análisis detecta:
1. Cómo el régimen de verdad del documento transforma o traduce hechos de otros regímenes
2. Qué se pierde, distorsiona o amplifica en esa traducción
3. Qué actores se benefician o perjudican con esa mistranslation específica
4. La función política o social de la fricción detectada

Responde siempre en español con rigor teórico.`;

export const MISTRANSLATION_USER_TEMPLATE = `Analiza las mistranslations en esta captura del caso etnográfico N°{caso}.

Régimen de verdad ORIGEN del documento: {regimen_verdad}
Tipo de fuente: {fuente_tipo}
{fecha_evento_line}
{tags_line}

Identifica:
- **regime_origen**: régimen de verdad primario del documento
- **regimenes_invocados**: otros regímenes presentes o aludidos en el documento
- **mistranslations**: array de objetos {
    descripcion: string,
    regimen_origen: string,
    regimen_destino: string,
    mecanismo: string,  // qué opera la traducción (ej. "tecnificación legal", "espectacularización")
    perdida: string,    // qué se omite o distorsiona
    ganancia: string,   // qué se legitima o amplifica
    actores_beneficiados: string[],
    cita_evidencia: string
  }
- **hipotesis_friccion**: interpretación teórica de la función política de las mistranslations detectadas
- **intensidad**: "leve" | "moderada" | "fuerte" según densidad de fricción

Responde en JSON con exactamente esas claves.`;

export function buildMistranslationPrompt(params: {
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
  return MISTRANSLATION_USER_TEMPLATE.replace('{caso}', String(params.caso))
    .replace('{regimen_verdad}', params.regimenVerdad)
    .replace('{fuente_tipo}', params.fuenteTipo)
    .replace('{fecha_evento_line}', fechaLine)
    .replace('{tags_line}', tagsLine);
}
