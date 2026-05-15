# CLAUDE.md — `vientonorte/antropologia-corrupcion`

## Project
Contra-archivo: investigación antropológica doctoral-track sobre corrupción en Chile.
Live: https://vientonorte.github.io/antropologia-corrupcion
Owner: Rö (Rodrigo Gaete Gaona)

## Framework conceptual
"Motor de mistraducción / fricción" — la corrupción como práctica estructural mediada por mistraducciones entre normativa formal y práctica efectiva.

## Metodología
- **Grounded Theory**: open coding → axial coding → selective coding.
- **Esquema dimensional D1–D7** (ver `docs/dimensiones.md` si existe).
- **Sistema de fichas C.01–C.0N** (`docs/fichas/`).
- **Visualización d3-force** para mapas de actores/relaciones.

## Anchors teóricos
- Michael Taussig (terror, mimesis, sujeto colonial)
- Ann Stoler (archivo, ruina imperial)
- Philip Abrams ("state as mask")
- Larissa Adler-Lomnitz (redes informales)
- Veena Das & Deborah Poole (márgenes del Estado)

## Tech stack
- HTML5 + CSS3 + JS vanilla
- D3.js v7+ (force-directed graphs)
- GitHub Pages deploy
- Posible JSON como fuente de datos (`casos.json`, `frictionEngine.js`)

## File structure (probable)
```
/
├── index.html
├── admin.html
├── css/
├── js/
│   └── frictionEngine.js (puede ser privado)
├── data/
│   └── casos.json (puede ser privado)
└── docs/
    ├── dimensiones.md
    └── fichas/
        ├── C01-*.md
        ├── C02-*.md
        └── ...
```

## Conventions
- **Fichas**: una por archivo Markdown, nombrada `C0X-slug.md`.
- **Casos**: schema declarado en `casos.json`.
- **Refs bibliográficas**: APA + año.
- **Idioma**: español de Chile.

## Reglas duras de contenido
1. **Toda afirmación se ancla en fuente verificable**:
   - Documento legal (Ley/DS/OG con número y fecha)
   - Sentencia (causa, rol, juzgado)
   - Reportaje (autor, medio, fecha, URL)
   - Informe institucional (INDH, CIDH, etc.)
2. **Citas teóricas con referencia exacta**. Si no la tienes: `[CITA PENDIENTE]`.
3. **Distinguir**: hecho documentado / hipótesis investigativa / inferencia teórica.
4. **No saneamiento**: mantener el grano polémico cuando el dato lo sostenga.
5. **Sujetos y comunidades**: respeto a la memoria; precisión en hechos; citación de fuentes primarias.

## Privacy / ética
- **No publicar datos que comprometan fuentes vivas** sin protocolo de protección.
- Material sensible vive en `acab/DOCS/` (probablemente gitignored / privado).
- `frictionEngine.js` y `casos.json` pueden ser privados — verificar antes de exponer.

## Common commands
```bash
# Servir local
python3 -m http.server 8000

# Deploy
git push origin main

# Verificar
curl -I https://vientonorte.github.io/antropologia-corrupcion
```

## Do NOT
- Inventar citas o atribuir conceptos al autor equivocado.
- Usar lenguaje de "buen gobierno" / "transparencia" sin crítica teórica.
- Relativizar prácticas documentadas de violencia, montaje o tortura.
- Publicar material de `acab/DOCS/` sin revisión previa.
- Tratar la corrupción como anomalía moral en vez de práctica estructural.

## Skills relevantes
Si trabajas con Claude Code: invocar `/skill ficha-contra-archivo` para generar fichas con formato estándar.

## Definition of Done para ficha publicable
- [ ] Open / axial / selective coding completos
- [ ] Mapeo D1–D7 completo
- [ ] Anchor teórico citado con referencia
- [ ] Fuentes primarias y secundarias listadas
- [ ] Sitio de fricción identificado
- [ ] Visualización d3-force (nodos y edges declarados)
- [ ] Apertura analítica (no conclusión cerrada)
- [ ] Vínculos con otras fichas
