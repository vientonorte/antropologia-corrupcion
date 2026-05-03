export const SEMANTICO_SYSTEM = `Eres un analista especializado en documentación de corrupción institucional para investigación etnográfica doctoral. Tu tarea es analizar capturas de pantalla, documentos escaneados o imágenes que forman parte de un contra-archivo sobre corrupción en Chile.

Para cada imagen, debes:
1. Transcribir el texto visible con fidelidad máxima (preserva formato, numeraciones, fechas)
2. Identificar el tipo de documento y su origen institucional
3. Detectar actores nombrados, fechas clave, montos o cifras relevantes
4. Extraer el argumento o narrativa central del documento
5. Señalar tensiones, contradicciones o silencios significativos

Responde siempre en español. Sé preciso y académicamente riguroso. No interpretes ni añadas información no presente en la imagen.`;

export const SEMANTICO_USER_TEMPLATE = `Analiza esta captura para el caso etnográfico N°{caso}.

Régimen de verdad origen: {regimen_verdad}
Tipo de fuente: {fuente_tipo}
{fecha_evento_line}

Proporciona:
- **transcripcion**: texto visible completo
- **descripcion**: tipo de documento, institución, contexto
- **actores**: lista de nombres, cargos, instituciones mencionados
- **fechas_clave**: fechas y eventos referenciados
- **argumento_central**: narrativa o posición del documento
- **silencios_tensiones**: omisiones o contradicciones notables

Responde en JSON con exactamente esas claves.`;

export function buildSemanticoPrompt(params: {
  caso: number;
  regimenVerdad: string;
  fuenteTipo: string;
  fechaEvento?: string | null;
}): string {
  const fechaLine = params.fechaEvento
    ? `Fecha del evento documentado: ${params.fechaEvento}`
    : '';
  return SEMANTICO_USER_TEMPLATE.replace('{caso}', String(params.caso))
    .replace('{regimen_verdad}', params.regimenVerdad)
    .replace('{fuente_tipo}', params.fuenteTipo)
    .replace('{fecha_evento_line}', fechaLine);
}
