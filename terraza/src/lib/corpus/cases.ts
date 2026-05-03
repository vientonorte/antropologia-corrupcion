export const CASOS = {
  SURA_GOBERNANZA: {
    id: 1 as const,
    slug: 'sura-gobernanza-datos',
    label: 'SURA Investments: Gobernanza de Datos',
    provisional: false,
  },
  LA_NEGRA: {
    id: 2 as const,
    slug: 'la-negra',
    label: 'La Negra — Territorio Mapuche-Huilliche',
    provisional: true,
  },
  CIPER_PERIODISMO: {
    id: 3 as const,
    slug: 'ciper-periodismo-datos',
    label: 'Periodismo de Datos (CIPER Chile)',
    provisional: false,
  },
  OIT_169: {
    id: 4 as const,
    slug: 'oit-169',
    label: 'OIT 169 — Consulta Previa',
    provisional: false,
  },
} as const;

export type CasoId = typeof CASOS[keyof typeof CASOS]['id'];
export type CasoKey = keyof typeof CASOS;
