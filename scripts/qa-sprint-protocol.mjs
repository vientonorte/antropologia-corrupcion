#!/usr/bin/env node
/**
 * Protocolo manual 3×5 min — validación post Sprint P01/P02/P03
 *
 *   node scripts/qa-sprint-protocol.mjs
 *   node scripts/qa-sprint-protocol.mjs --base=https://vientonorte.github.io/antropologia-corrupcion
 */
const BASE =
  process.argv.find((a) => a.startsWith('--base='))?.split('=')[1]
  || 'http://localhost:8000';

const PERSONAS = [
  {
    id: 'visitante',
    label: 'Visitante público (5 min)',
    steps: [
      `Abrir ${BASE}/index.html — verificar H1 «Contra-archivo» y 3 rutas (Grafo · Leer · Buscar)`,
      'Revisar barra de métricas del corpus y chips de fuentes bajo la búsqueda',
      'Abrir demo de fricción precargada → clic «Profundizar en buscador»',
      `Confirmar llegada a buscador con resultados en pestaña Registros (no Huella)`,
    ],
  },
  {
    id: 'investigador',
    label: 'Investigador de datos (5 min)',
    steps: [
      `Abrir ${BASE}/buscador.html?q=transparencia — strip de fuentes visible sin abrir sidebar`,
      'Cambiar categorías E–I y abrir dossier de un resultado con badges epistémicos',
      'Exportar CSV si hay resultados; probar chip de fuente → filtro ?fuente=',
      'Pestaña Huella digital solo con ?huella=1 o ?caso=',
    ],
  },
  {
    id: 'comite',
    label: 'Comité académico (5 min)',
    steps: [
      `Abrir ${BASE}/index.html#tesis — grafo carga (lazy) y panel de nodo`,
      'Scroll a strip de 7 casos etnográficos → abrir Michillanca y Ensayo D4',
      `${BASE}/archivo.html — fichas C05 publicable y ensayo con enlace al grafo`,
      `${BASE}/leer.html — marco narrativo sin nombres de archivos JSON en copy`,
    ],
  },
];

const AUTOMATED = [
  'node tests/runner.js',
  'node scripts/qa-live.mjs --local',
  'python3 scripts/e2e-home-public.py',
  'node scripts/atomic-audit.mjs --local',
  'Lighthouse CI: categories:accessibility minScore 0.9 en index.html',
];

console.log('═'.repeat(60));
console.log('Protocolo QA — Sprints P01 · P02 · P03');
console.log('Base URL:', BASE);
console.log('═'.repeat(60));

PERSONAS.forEach((p, i) => {
  console.log(`\n[${i + 1}/3] ${p.label}`);
  p.steps.forEach((step, j) => {
    console.log(`  ${j + 1}. ${step}`);
  });
  console.log('  ✓ Criterio: completar sin bloqueos ni copy roto');
});

console.log('\n── Gates automatizados (CI) ──');
AUTOMATED.forEach((cmd) => console.log('  ·', cmd));

console.log('\n── Criterio de cierre QA ──');
console.log('  · 3/3 personas completan flujo sin asistencia');
console.log('  · Suite tests + e2e-home-public PASS');
console.log('  · Lighthouse accessibility ≥ 90 en /index.html');
console.log('');