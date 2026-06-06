/**
 * tokens.js — Design System: fuente única de verdad para colores y tipografía
 * ─────────────────────────────────────────────────────────────────────────────
 * Atomic Design: nivel de átomos — ningún componente define colores inline.
 * Tanto CSS (via CSS custom properties) como canvas JS referencian estos tokens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Paleta base ── */
const _RAW = Object.freeze({
    bgDark:      { r: 6,   g: 6,   b: 8   },
    surface:     { r: 17,  g: 17,  b: 22  },
    surfaceAlt:  { r: 26,  g: 26,  b: 32  },
    textPrimary: { r: 224, g: 224, b: 224 },
    textMuted:   { r: 138, g: 138, b: 138 },
    border:      { r: 36,  g: 36,  b: 36  },

    // ── Ejes investigativos ──
    eje1:  { r: 201, g: 32,  b: 32  }, // Represión — rojo
    eje2:  { r: 201, g: 122, b: 26  }, // Finanza — ámbar
    eje3:  { r: 46,  g: 125, b: 79  }, // Territorio — verde
    eje4:  { r: 46,  g: 98,  b: 168 }, // Metodología — azul

    // ── Campo de fricción (fieldPhysics / frictionEngine) ──
    cold:  { r: 74,  g: 127, b: 165 }, // azul institucional
    warm:  { r: 200, g: 169, b: 110 }, // dorado — zona gris
    hot:   { r: 180, g: 60,  b: 50  }, // rojo — saturación

    // ── Campo termodinámico (socialField) ──
    agentClean:  { r: 160, g: 180, b: 200 },
    agentDirty:  { r: 200, g: 120, b: 70  },
    agentGlow:   { r: 200, g: 100, b: 60  },
    collapse:    { r: 140, g: 30,  b: 30  },
    collapseTxt: { r: 180, g: 50,  b: 40  },
    gridOrder:   { r: 74,  g: 127, b: 165 },
    gridChaos:   { r: 200, g: 169, b: 110 },
    noiseDeath:  { r: 180, g: 60,  b: 50  },
    trackRing:   { r: 60,  g: 80,  b: 100 },

    // ── Integridad (colores de texto sobre canvas) ──
    intHigh:   { r: 120, g: 180, b: 200 },
    intMid:    { r: 200, g: 169, b: 110 },
    intLow:    { r: 180, g: 60,  b: 50  },
});

/* ── Helpers canvas ── */
function _rgba(tok, alpha) {
    const t = _RAW[tok];
    if (!t) { console.warn('[tokens] token desconocido:', tok); return `rgba(0,0,0,${alpha})`; }
    return `rgba(${t.r},${t.g},${t.b},${alpha})`;
}
function _rgb(tok) {
    const t = _RAW[tok];
    if (!t) { console.warn('[tokens] token desconocido:', tok); return 'rgb(0,0,0)'; }
    return `rgb(${t.r},${t.g},${t.b})`;
}
function _rgbRaw(tok) { return _RAW[tok]; }

/* ── Eje → color hex ── */
function _ejeHex(eje) {
    const map = { 1: '#c92020', 2: '#c97a1a', 3: '#2e7d4f', 4: '#2e62a8' };
    return map[eje] || '#707070';
}

/* ── Tipografía para ctx.font ── */
const _FONT_MONO = '"SF Mono","Fira Code",monospace';
function _fontMono(px) { return `${px}px ${_FONT_MONO}`; }
function _fontMonoBold(px) { return `bold ${px}px ${_FONT_MONO}`; }

/* ══════════════════════════════════════════════════════════════════════
   API PÚBLICA — inmutable
══════════════════════════════════════════════════════════════════════ */
const CA_TOKENS = Object.freeze({
    raw:      _RAW,
    rgba:     _rgba,
    rgb:      _rgb,
    rgbRaw:   _rgbRaw,
    ejeHex:   _ejeHex,
    fontMono:     _FONT_MONO,
    font:         _fontMono,
    fontBold:     _fontMonoBold,
});

if (typeof window !== 'undefined') window.CA_TOKENS = CA_TOKENS;
