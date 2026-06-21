/**
 * lectura-clave-b.js — Lectura cromática académica (Clave B) sin IA
 * Protocolo bujo-ro v1.2 · libros impresos
 */
(function (global) {
  'use strict';

  const CLAVE_B = [
    { id: 'red', color: '#e066a6', label: 'Concepto clave', categoria: 'concepto_clave', emoji: '🟥' },
    { id: 'gray', color: '#888888', label: 'Investigar', categoria: 'investigar', emoji: '⬛' },
    { id: 'yellow', color: '#e6c800', label: 'Referencia', categoria: 'referencia', emoji: '🟨' },
    { id: 'green', color: '#3a7a4a', label: 'Persona de interés', categoria: 'persona_interes', emoji: '🟩' },
    { id: 'blue', color: '#2A5FAC', label: 'Reflexión', categoria: 'reflexion', emoji: '🟦' },
    { id: 'orange', color: '#c4962a', label: 'Compartir', categoria: 'compartir', emoji: '🟧' },
  ];

  const REF_RGB = {
    red: [224, 102, 166],
    gray: [140, 140, 140],
    yellow: [230, 200, 50],
    green: [58, 122, 74],
    blue: [42, 95, 172],
    orange: [196, 150, 42],
  };

  function distRgb(a, b) {
    return Math.sqrt(
      (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
    );
  }

  function classifyPixel(r, g, b) {
    if (r > 240 && g > 240 && b > 240) return null;
    if (r < 40 && g < 40 && b < 40) return null;
    let best = 'yellow';
    let bestD = Infinity;
    for (const [id, rgb] of Object.entries(REF_RGB)) {
      const d = distRgb([r, g, b], rgb);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    return bestD < 120 ? best : null;
  }

  function sampleRegion(ctx, x, y, w, h) {
    const data = ctx.getImageData(x, y, w, h).data;
    const counts = {};
    let samples = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const hit = classifyPixel(r, g, b);
      if (hit) {
        counts[hit] = (counts[hit] || 0) + 1;
        samples += 1;
      }
    }
    if (!samples) return null;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function clusterPoints(points, maxDist) {
    const clusters = [];
    const used = new Uint8Array(points.length);
    const maxDistSq = maxDist * maxDist;
    for (let i = 0; i < points.length; i++) {
      if (used[i]) continue;
      const cluster = [points[i]];
      used[i] = 1;
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < points.length; j++) {
          if (used[j]) continue;
          for (let k = 0; k < cluster.length; k++) {
            const dx = points[j].x - cluster[k].x;
            const dy = points[j].y - cluster[k].y;
            if (dx * dx + dy * dy <= maxDistSq) {
              cluster.push(points[j]);
              used[j] = 1;
              changed = true;
              break;
            }
          }
        }
      }
      clusters.push(cluster);
    }
    return clusters;
  }

  function boundingBox(points, pad) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    points.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    const p = pad || 0;
    return {
      x: Math.max(0, minX - p),
      y: Math.max(0, minY - p),
      w: maxX - minX + p * 2,
      h: maxY - minY + p * 2,
    };
  }

  function detectMarkedRegions(ctx, width, height, stride) {
    const step = stride || 6;
    const byColor = {};
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        const hit = classifyPixel(data[i], data[i + 1], data[i + 2]);
        if (!hit) continue;
        if (!byColor[hit]) byColor[hit] = [];
        byColor[hit].push({ x, y });
      }
    }
    const boxes = [];
    Object.entries(byColor).forEach(([color, points]) => {
      if (points.length < 8) return;
      clusterPoints(points, 36).forEach((cluster) => {
        const box = boundingBox(cluster, 10);
        if (box.w >= 28 && box.h >= 10) {
          boxes.push({
            x: box.x,
            y: box.y,
            w: Math.min(width - box.x, box.w),
            h: Math.min(height - box.y, box.h),
            color,
          });
        }
      });
    });
    return boxes.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  const GTD_NOTA_PREFIX = {
    concepto_clave: 'GTD · concepto axial · motor epistémico',
    investigar: 'GTD · open coding · pendiente verificar fuente',
    referencia: 'GTD · referencia bibliográfica · archivo',
    persona_interes: 'GTD · actor de red · mapear vínculo',
    reflexion: 'GTD · memo analítico · mistranslation',
    compartir: 'GTD · salida pública · revisar antes de exportar',
  };

  function getClaveById(id) {
    return CLAVE_B.find((c) => c.id === id) || CLAVE_B[2];
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  let tessWorker = null;

  async function ensureTesseract() {
    if (global.Tesseract) return global.Tesseract;
    await loadScript(
      'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    );
    return global.Tesseract;
  }

  async function ensureTesseractWorker() {
    if (tessWorker) return tessWorker;
    const Tesseract = await ensureTesseract();
    const worker = await Tesseract.createWorker('spa', 1, { logger: () => {} });
    const psm = Tesseract.PSM && Tesseract.PSM.SINGLE_BLOCK
      ? Tesseract.PSM.SINGLE_BLOCK
      : '6';
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    });
    tessWorker = worker;
    return worker;
  }

  const OCR_MIN_CONFIDENCE = 58;
  const OCR_MIN_WORD_CONFIDENCE = 42;
  const OCR_MIN_CHARS = 14;
  const OCR_MIN_WORDS = 3;

  const SPANISH_HINTS = new Set([
    'de', 'la', 'el', 'en', 'los', 'las', 'un', 'una', 'que', 'del', 'por', 'con', 'para', 'al',
    'se', 'es', 'su', 'sus', 'como', 'más', 'pero', 'son', 'esta', 'este', 'entre', 'sobre',
    'también', 'cuando', 'donde', 'todo', 'muy', 'sin', 'hay', 'ser', 'fue', 'han', 'puede',
    'forma', 'modo', 'otro', 'otra', 'cada', 'solo', 'bien', 'vez', 'parte', 'mismo', 'misma',
    'tiene', 'desde', 'hasta', 'ello', 'ella', 'ellos', 'así', 'aquí', 'ante', 'cual', 'quien',
    'ni', 'no', 'sí', 'ya', 'aún', 'tan', 'nos', 'ese', 'esa', 'eso', 'estas', 'estos', 'qué',
  ]);

  const ENGLISH_STOP = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has', 'was', 'were', 'are',
    'not', 'but', 'you', 'your', 'they', 'their', 'what', 'when', 'where', 'which', 'who', 'how',
    'all', 'can', 'will', 'one', 'two', 'out', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'would', 'could', 'should', 'there', 'these', 'those',
  ]);

  function normalizeWord(w) {
    return w.toLowerCase().replace(/[^\wáéíóúüñ]/gi, '');
  }

  function spanishPlausibility(words) {
    if (!words.length) return { score: 0, englishRatio: 0 };
    let spanishHits = 0;
    let englishHits = 0;
    let morphHits = 0;
    for (const raw of words) {
      const w = normalizeWord(raw);
      if (!w) continue;
      if (SPANISH_HINTS.has(w)) spanishHits += 1;
      if (ENGLISH_STOP.has(w)) englishHits += 1;
      if (/[ñáéíóúü]/i.test(w)) morphHits += 1;
      if (/(ción|sión|mente|idad|ando|iendo|ado|ada|oso|osa|ante|ible|amiento)$/i.test(w)) {
        morphHits += 1;
      }
    }
    return {
      score: (spanishHits + morphHits * 0.6) / words.length,
      englishRatio: englishHits / words.length,
    };
  }

  /**
   * Rechaza transcripciones nulas, fragmentadas, anglicismos OCR o incoherentes.
   */
  function assessTranscription(text, confidence, wordConfs) {
    if (!text || typeof text !== 'string') {
      return { ok: false, reason: 'vacio' };
    }
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length < OCR_MIN_CHARS) {
      return { ok: false, reason: 'muy_corto' };
    }
    const letters = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    if (letters < 10 || letters / t.length < 0.58) {
      return { ok: false, reason: 'pocos_caracteres_letra' };
    }
    const words = t.split(/\s+/).filter((w) => normalizeWord(w).length >= 2);
    if (words.length < OCR_MIN_WORDS) {
      return { ok: false, reason: 'pocas_palabras' };
    }
    const vowels = (t.match(/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/g) || []).length;
    if (vowels < 3 || (letters > 0 && vowels / letters < 0.14)) {
      return { ok: false, reason: 'sin_vocales' };
    }
    const singles = t.split(/\s+/).filter((w) => w.length === 1).length;
    if (singles > Math.max(2, words.length * 0.4)) {
      return { ok: false, reason: 'fragmentado' };
    }
    const noise = (t.match(/[^\wÀ-ÿ\s.,;:!?¿¡'"()\-—«»]/g) || []).length;
    if (noise / t.length > 0.18) {
      return { ok: false, reason: 'ruido' };
    }
    if (/^[\W\d_]+$/.test(t) || /(.)\1{5,}/.test(t)) {
      return { ok: false, reason: 'incoherente' };
    }
    const plaus = spanishPlausibility(words);
    if (plaus.englishRatio > 0.2) {
      return { ok: false, reason: 'texto_en_ingles' };
    }
    if (words.length >= 4 && plaus.score < 0.12 && plaus.englishRatio > 0.08) {
      return { ok: false, reason: 'no_parece_espanol' };
    }
    if (typeof confidence === 'number' && confidence < OCR_MIN_CONFIDENCE) {
      return { ok: false, reason: 'baja_confianza' };
    }
    if (wordConfs && wordConfs.length) {
      const low = wordConfs.filter((c) => c < OCR_MIN_WORD_CONFIDENCE).length;
      if (low / wordConfs.length > 0.45) {
        return { ok: false, reason: 'palabras_dudosas' };
      }
      const avg = wordConfs.reduce((a, b) => a + b, 0) / wordConfs.length;
      if (avg < OCR_MIN_CONFIDENCE) {
        return { ok: false, reason: 'baja_confianza' };
      }
    }
    return { ok: true };
  }

  function otsuThreshold(hist, total) {
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sumB = 0;
    let wB = 0;
    let max = 0;
    let threshold = 128;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (!wB) continue;
      const wF = total - wB;
      if (!wF) break;
      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > max) {
        max = between;
        threshold = t;
      }
    }
    return threshold;
  }

  /** Blanquea resaltados, binariza y escala para OCR de libros marcados. */
  function enhanceCropForOcr(canvas) {
    const minH = canvas.height;
    const targetH = 560;
    const scale = minH < targetH ? targetH / minH : 1;
    const outW = Math.max(1, Math.round(canvas.width * scale));
    const outH = Math.max(1, Math.round(canvas.height * scale));
    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, outW, outH);
    const imageData = ctx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    const hist = new Array(256).fill(0);
    const gray = new Float32Array(outW * outH);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;
      if (sat > 28 && maxC > 110 && maxC < 248 && minC > 45) {
        const bleed = Math.min(1, sat / 110);
        r += (255 - r) * bleed * 0.88;
        g += (255 - g) * bleed * 0.88;
        b += (255 - b) * bleed * 0.88;
      }
      const gv = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[p] = gv;
      const bin = Math.max(0, Math.min(255, Math.round(gv)));
      hist[bin] += 1;
    }
    const threshold = otsuThreshold(hist, gray.length);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const v = gray[p] > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return out;
  }

  /** Amplía la caja del marcador para incluir líneas de texto completas. */
  function expandRegionForOcr(region, canvasW, canvasH) {
    const padX = Math.max(6, Math.round(region.w * 0.06));
    const padY = Math.max(14, Math.round(region.h * 0.75));
    const x = Math.max(0, region.x - padX);
    const y = Math.max(0, region.y - padY);
    const w = Math.min(canvasW - x, region.w + padX * 2);
    const h = Math.min(canvasH - y, region.h + padY * 2);
    return { x, y, w, h, color: region.color };
  }

  function reasonLabel(reason) {
    const labels = {
      vacio: 'sin texto',
      muy_corto: 'demasiado corto',
      pocos_caracteres_letra: 'pocos caracteres legibles',
      pocas_palabras: 'pocas palabras',
      sin_vocales: 'sin vocales (español)',
      fragmentado: 'texto fragmentado',
      ruido: 'demasiado ruido OCR',
      incoherente: 'incoherente',
      baja_confianza: 'baja confianza OCR',
      palabras_dudosas: 'palabras dudosas',
      texto_en_ingles: 'parece inglés (foto ilegible)',
      no_parece_espanol: 'no parece español',
      foto_baja_calidad: 'foto con poca resolución',
    };
    return labels[reason] || reason;
  }

  function photoQualityHint(meta) {
    if (!meta) return '';
    if (meta.fullRes === false) {
      return ' Foto reducida para el navegador — sube JPEG sin comprimir o acerca más el texto.';
    }
    const maxEdge = Math.max(meta.width || 0, meta.height || 0);
    if (maxEdge > 0 && maxEdge < 2400) {
      return ' Resolución baja para OCR — luz uniforme, perpendicular al texto, sin sombra.';
    }
    return '';
  }

  function LecturaClaveB(options) {
    this.opts = Object.assign(
      {
        defaultLibro: 'Zuboff — La era del capitalismo de la vigilancia',
        defaultAutor: 'Shoshana Zuboff',
        onQueueChange: null,
        onStatus: null,
      },
      options || {},
    );

    this.activeColor = 'yellow';
    this.mode = 'eyedropper';
    this.queue = [];
    this.image = null;
    this.imageMeta = null;
    this.scale = 1;
    this.selection = null;
    this.drag = null;

    this.els = {
      workspace: document.getElementById('claveBWorkspace'),
      toolbar: document.getElementById('claveBToolbar'),
      canvas: document.getElementById('claveBCanvas'),
      wrap: document.getElementById('claveBCanvasWrap'),
      libro: document.getElementById('claveBLibro'),
      autor: document.getElementById('claveBAutor'),
      pagina: document.getElementById('claveBPagina'),
      texto: document.getElementById('claveBTexto'),
      notas: document.getElementById('claveBNotas'),
      colorLabel: document.getElementById('claveBColorLabel'),
      queue: document.getElementById('claveBQueue'),
      queueCount: document.getElementById('claveBQueueCount'),
      status: document.getElementById('claveBStatus'),
      ocrBtn: document.getElementById('claveBOcrRegion'),
    };

    if (!this.els.canvas) {
      console.error('[LecturaClaveB] canvas #claveBCanvas no encontrado');
      return;
    }
    this.ctx = this.els.canvas.getContext('2d', { willReadFrequently: true });
    this.bindUi();
    this.renderToolbar();
    this.setDefaults();
    this.updateOcrButton();
  }

  LecturaClaveB.prototype.updateOcrButton = function () {
    const btn = this.els.ocrBtn;
    if (!btn) return;
    const busy = !!this._scanning;
    const hasSelection =
      !busy &&
      this.image &&
      this.selection &&
      this.selection.w > 8 &&
      this.selection.h > 8;
    btn.disabled = !hasSelection;
    btn.setAttribute('aria-disabled', hasSelection ? 'false' : 'true');
    btn.title = busy
      ? 'Espera a que termine el escaneo automático'
      : hasSelection
        ? 'Transcribir el texto dentro de la región seleccionada'
        : 'Primero selecciona una región (modo Seleccionar región)';
  };

  LecturaClaveB.prototype.setDefaults = function () {
    if (this.els.libro) this.els.libro.value = this.opts.defaultLibro;
    if (this.els.autor) this.els.autor.value = this.opts.defaultAutor;
  };

  LecturaClaveB.prototype.status = function (msg, type) {
    if (this.els.status) {
      this.els.status.textContent = msg || '';
      this.els.status.className = 'analyze-status' + (type ? ' ' + type : '');
    }
    if (this.opts.onStatus) this.opts.onStatus(msg, type);
  };

  LecturaClaveB.prototype.renderToolbar = function () {
    if (!this.els.toolbar) return;
    this.els.toolbar.innerHTML = CLAVE_B.map(
      (c) =>
        `<button type="button" class="clave-b-swatch${this.activeColor === c.id ? ' active' : ''}" data-color="${c.id}" style="--swatch:${c.color}" title="${c.emoji} ${c.label}" aria-label="${c.label}" aria-pressed="${this.activeColor === c.id}">${c.emoji}</button>`,
    ).join('');
    this.els.toolbar.querySelectorAll('.clave-b-swatch').forEach((btn) => {
      btn.addEventListener('click', () => this.selectColor(btn.dataset.color));
    });
    this.updateColorLabel();
  };

  LecturaClaveB.prototype.selectColor = function (id) {
    this.activeColor = id;
    this.renderToolbar();
  };

  LecturaClaveB.prototype.updateColorLabel = function () {
    const c = getClaveById(this.activeColor);
    if (this.els.colorLabel) {
      this.els.colorLabel.textContent = `${c.emoji} ${c.label} · ${c.categoria}`;
    }
  };

  LecturaClaveB.prototype.bindUi = function () {
    const self = this;
    const canvas = this.els.canvas;

    document.querySelectorAll('[data-clave-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-clave-mode]').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        self.mode = btn.dataset.claveMode;
        canvas.style.cursor = self.mode === 'eyedropper' ? 'crosshair' : 'cell';
      });
    });

    document.getElementById('claveBAddFragment')?.addEventListener('click', () =>
      self.addFragment(),
    );
    document.getElementById('claveBImportQueue')?.addEventListener('click', () =>
      self.importQueue(),
    );
    document.getElementById('claveBClearQueue')?.addEventListener('click', () =>
      self.clearQueue(),
    );
    document.getElementById('claveBOcrRegion')?.addEventListener('click', () =>
      self.ocrSelection(),
    );
    document.getElementById('claveBAutoScan')?.addEventListener('click', () =>
      self.autoScanFragments(),
    );

    canvas.addEventListener('mousedown', (e) => self.onPointerDown(e));
    canvas.addEventListener('mousemove', (e) => self.onPointerMove(e));
    canvas.addEventListener('mouseup', (e) => self.onPointerUp(e));
    canvas.addEventListener('mouseleave', () => {
      self.drag = null;
    });
    canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        self.onPointerDown(e.touches[0]);
      },
      { passive: false },
    );
    canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        self.onPointerMove(e.touches[0]);
      },
      { passive: false },
    );
    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches[0]) self.onPointerUp(e.changedTouches[0]);
    });
  };

  LecturaClaveB.prototype.revokeImageUrl = function () {
    if (this._objectUrl) {
      try {
        URL.revokeObjectURL(this._objectUrl);
      } catch (e) {
        /* noop */
      }
      this._objectUrl = null;
    }
  };

  LecturaClaveB.prototype.loadImage = function (src) {
    const self = this;
    const url = typeof src === 'string' ? src : src && src.url;
    if (!url) {
      this.status('URL de imagen inválida.', 'error');
      return Promise.reject(new Error('URL de imagen inválida'));
    }
    if (!this.els.canvas || !this.ctx) {
      this.status('Canvas no disponible. Recarga la página.', 'error');
      return Promise.reject(new Error('Canvas no disponible'));
    }
    this.revokeImageUrl();
    if (typeof src === 'object' && src.url && src.revoke !== false) {
      this._objectUrl = src.url;
    }
    if (typeof src === 'object') {
      this.imageMeta = {
        width: src.width || null,
        height: src.height || null,
        fullRes: src.fullRes !== false,
        format: src.format || null,
      };
    } else {
      this.imageMeta = null;
    }
    if (this.els.workspace) this.els.workspace.style.display = 'block';
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        if (!img.naturalWidth || !img.naturalHeight) {
          self.revokeImageUrl();
          self.status('Imagen vacía o corrupta.', 'error');
          reject(new Error('Imagen vacía o corrupta'));
          return;
        }
        self.image = img;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            try {
              self.fitCanvas();
              self.draw();
              const dim = self.imageMeta && self.imageMeta.width
                ? ` (${self.imageMeta.width}×${self.imageMeta.height})`
                : '';
              const hint = photoQualityHint(self.imageMeta);
              self.status(
                'Foto cargada' + dim + '. Escanea marcadores o selecciona región manual.' + hint,
                hint ? '' : 'success',
              );
              self.updateOcrButton();
              resolve();
            } catch (err) {
              self.status('Error al dibujar la imagen: ' + err.message, 'error');
              reject(err);
            }
          });
        });
      };
      img.onerror = function () {
        self.revokeImageUrl();
        const msg = 'No se pudo mostrar la imagen. Prueba exportar como JPEG desde Fotos o usa una foto más pequeña.';
        self.status(msg, 'error');
        reject(new Error(msg));
      };
      img.src = url;
    });
  };

  LecturaClaveB.prototype.clear = function () {
    this.image = null;
    this.imageMeta = null;
    this.selection = null;
    this.revokeImageUrl();
    if (this.ctx && this.els.canvas) {
      this.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
    }
    if (this.els.workspace) this.els.workspace.style.display = 'none';
    this.status('');
    this.updateOcrButton();
  };

  LecturaClaveB.prototype.fitCanvas = function () {
    if (!this.image || !this.els.wrap || !this.els.canvas) return;
    const iw = this.image.naturalWidth || this.image.width;
    const ih = this.image.naturalHeight || this.image.height;
    if (!iw || !ih) return;
    const maxW = this.els.wrap.clientWidth || 640;
    const maxH = 640;
    const ratio = Math.min(maxW / iw, maxH / ih, 1);
    this.scale = ratio;
    this.els.canvas.width = Math.max(1, Math.round(iw * ratio));
    this.els.canvas.height = Math.max(1, Math.round(ih * ratio));
  };

  LecturaClaveB.prototype.draw = function () {
    const canvas = this.els.canvas;
    const ctx = this.ctx;
    if (!this.image || !canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    if (this.selection) {
      const s = this.selection;
      ctx.strokeStyle = getClaveById(this.activeColor).color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.setLineDash([]);
    }
  };

  LecturaClaveB.prototype.canvasPoint = function (e) {
    const rect = this.els.canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(this.els.canvas.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(this.els.canvas.height, e.clientY - rect.top)),
    };
  };

  LecturaClaveB.prototype.onPointerDown = function (e) {
    if (!this.image) return;
    const p = this.canvasPoint(e);
    if (this.mode === 'eyedropper') {
      const px = this.ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
      const hit = classifyPixel(px[0], px[1], px[2]);
      if (hit) {
        this.selectColor(hit);
        this.status(`Color detectado: ${getClaveById(hit).label}`, 'success');
      } else {
        this.status('Clic en texto sin marcador — selecciona color manualmente.', '');
      }
      return;
    }
    this.drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
  };

  LecturaClaveB.prototype.onPointerMove = function (e) {
    if (!this.drag) return;
    const p = this.canvasPoint(e);
    this.drag.x1 = p.x;
    this.drag.y1 = p.y;
    this.selection = {
      x: Math.min(this.drag.x0, this.drag.x1),
      y: Math.min(this.drag.y0, this.drag.y1),
      w: Math.abs(this.drag.x1 - this.drag.x0),
      h: Math.abs(this.drag.y1 - this.drag.y0),
    };
    this.draw();
  };

  LecturaClaveB.prototype.onPointerUp = function (e) {
    if (!this.drag) return;
    const p = this.canvasPoint(e);
    this.drag.x1 = p.x;
    this.drag.y1 = p.y;
    const w = Math.abs(this.drag.x1 - this.drag.x0);
    const h = Math.abs(this.drag.y1 - this.drag.y0);
    if (w > 8 && h > 8) {
      this.selection = {
        x: Math.min(this.drag.x0, this.drag.x1),
        y: Math.min(this.drag.y0, this.drag.y1),
        w,
        h,
      };
      const hit = sampleRegion(
        this.ctx,
        Math.floor(this.selection.x),
        Math.floor(this.selection.y),
        Math.floor(this.selection.w),
        Math.floor(this.selection.h),
      );
      if (hit) {
        this.selectColor(hit);
        this.status(`Región marcada · ${getClaveById(hit).label}`, 'success');
      } else {
        this.status('Región seleccionada — transcribe el fragmento abajo.', '');
      }
    }
    this.drag = null;
    this.draw();
    this.updateOcrButton();
  };

  LecturaClaveB.prototype.cropRegionToCanvas = function (region) {
    const crop = document.createElement('canvas');
    const inv = 1 / this.scale;
    crop.width = Math.max(1, Math.round(region.w * inv));
    crop.height = Math.max(1, Math.round(region.h * inv));
    crop.getContext('2d').drawImage(
      this.image,
      region.x * inv,
      region.y * inv,
      region.w * inv,
      region.h * inv,
      0,
      0,
      crop.width,
      crop.height,
    );
    return crop;
  };

  LecturaClaveB.prototype.ocrRegion = async function (region, worker) {
    const w = worker || (await ensureTesseractWorker());
    const crop = this.cropRegionToCanvas(region);
    if (crop.width < 80 || crop.height < 24) {
      return { text: '', confidence: 0, ok: false, reason: 'foto_baja_calidad' };
    }
    const enhanced = enhanceCropForOcr(crop);
    const result = await w.recognize(enhanced);
    const text = (result.data.text || '').replace(/\s+/g, ' ').trim();
    const confidence = result.data.confidence;
    const wordConfs = (result.data.words || [])
      .map((item) => item.confidence)
      .filter((c) => typeof c === 'number' && c >= 0);
    const assessment = assessTranscription(text, confidence, wordConfs);
    return {
      text,
      confidence,
      ok: assessment.ok,
      reason: assessment.reason,
    };
  };

  LecturaClaveB.prototype.ocrSelection = async function () {
    if (!this.selection || !this.image) {
      this.status('Selecciona una región en la foto primero.', 'error');
      return;
    }
    this.status('OCR local en progreso…');
    try {
      const ocr = await this.ocrRegion(this.selection);
      if (this.els.texto) {
        this.els.texto.value = ocr.ok ? ocr.text : '';
      }
      const photoHint = photoQualityHint(this.imageMeta);
      if (ocr.ok) {
        this.status('OCR completado — revisa y corrige la transcripción.', 'success');
      } else if (ocr.text) {
        this.status(
          `OCR rechazado (${reasonLabel(ocr.reason)}). Transcribe manualmente.${photoHint}`,
          'error',
        );
      } else {
        this.status(`OCR sin texto legible — transcribe manualmente.${photoHint}`, 'error');
      }
    } catch (err) {
      this.status('Error OCR: ' + err.message, 'error');
    }
  };

  LecturaClaveB.prototype.autoScanFragments = async function () {
    if (!this.image || !this.ctx) {
      this.status('Sube una foto del libro primero.', 'error');
      return;
    }
    this._scanning = true;
    this.updateOcrButton();
    this.status('Escaneando marcadores Clave B en la página…');
    try {
      const regions = detectMarkedRegions(
        this.ctx,
        this.els.canvas.width,
        this.els.canvas.height,
        6,
      );
      if (!regions.length) {
        this.status('No se detectaron marcadores de color. Usa cuentaagotas o selección manual.', 'error');
        this._scanning = false;
        return;
      }
      const worker = await ensureTesseractWorker();
      const libro = (this.els.libro?.value || '').trim() || this.opts.defaultLibro;
      const autor = (this.els.autor?.value || '').trim() || this.opts.defaultAutor;
      const pagina = parseInt(this.els.pagina?.value, 10) || null;
      const canvasW = this.els.canvas.width;
      const canvasH = this.els.canvas.height;
      const photoHint = photoQualityHint(this.imageMeta);
      let added = 0;
      let skipped = 0;
      for (let i = 0; i < regions.length; i++) {
        const region = expandRegionForOcr(regions[i], canvasW, canvasH);
        this.status(`OCR fragmento ${i + 1}/${regions.length} · ${getClaveById(region.color).label}…`);
        const ocr = await this.ocrRegion(region, worker);
        if (!ocr.ok) {
          skipped += 1;
          continue;
        }
        const clave = getClaveById(region.color);
        this.queue.push({
          libro,
          autor,
          pagina,
          texto: ocr.text,
          color: clave.id,
          categoria: clave.categoria,
          notas_clave_b: (GTD_NOTA_PREFIX[clave.categoria] || 'GTD · captura automática Clave B') +
            ' · revisar transcripción',
          auto: true,
        });
        added += 1;
      }
      this.renderQueue();
      if (!added) {
        const skipMsg = skipped
          ? ` ${skipped} región${skipped !== 1 ? 'es' : ''} omitida${skipped !== 1 ? 's' : ''} por ilegibles o incoherentes.`
          : '';
        this.status(
          'Marcadores detectados pero sin transcripciones válidas — transcribe manualmente.' +
            skipMsg +
            photoHint,
          'error',
        );
      } else {
        const skipMsg = skipped
          ? ` · ${skipped} omitido${skipped !== 1 ? 's' : ''} (ilegible/incoherente)`
          : '';
        this.status(
          `${added} fragmento${added !== 1 ? 's' : ''} válido${added !== 1 ? 's' : ''} en cola${skipMsg}. Revisa e importa al archivo.${photoHint}`,
          photoHint ? '' : 'success',
        );
        if (this.opts.onQueueChange) this.opts.onQueueChange(this.queue);
      }
    } catch (err) {
      this.status('Error en escaneo automático: ' + err.message, 'error');
    }
    this._scanning = false;
    this.updateOcrButton();
  };

  LecturaClaveB.prototype.readForm = function () {
    const clave = getClaveById(this.activeColor);
    const texto = (this.els.texto?.value || '').trim();
    if (!texto) {
      this.status('Escribe o extrae el texto del fragmento.', 'error');
      return null;
    }
    const assessment = assessTranscription(texto);
    if (!assessment.ok) {
      this.status(
        `Transcripción incoherente (${reasonLabel(assessment.reason)}) — corrige antes de añadir.`,
        'error',
      );
      return null;
    }
    return {
      libro: (this.els.libro?.value || '').trim() || this.opts.defaultLibro,
      autor: (this.els.autor?.value || '').trim() || this.opts.defaultAutor,
      pagina: parseInt(this.els.pagina?.value, 10) || null,
      texto,
      color: clave.id,
      categoria: clave.categoria,
      notas_clave_b: (this.els.notas?.value || '').trim(),
    };
  };

  LecturaClaveB.prototype.addFragment = function () {
    const frag = this.readForm();
    if (!frag) return;
    this.queue.push(frag);
    if (this.els.texto) this.els.texto.value = '';
    if (this.els.notas) this.els.notas.value = '';
    this.selection = null;
    this.draw();
    this.updateOcrButton();
    this.renderQueue();
    this.status(`Fragmento añadido (${this.queue.length} en cola).`, 'success');
    if (this.opts.onQueueChange) this.opts.onQueueChange(this.queue);
  };

  LecturaClaveB.prototype.renderQueue = function () {
    if (!this.els.queue) return;
    const esc = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    if (this.els.queueCount) {
      this.els.queueCount.textContent = `${this.queue.length} fragmento${this.queue.length !== 1 ? 's' : ''}`;
    }
    if (!this.queue.length) {
      this.els.queue.innerHTML =
        '<p class="clave-b-queue-empty">Sin fragmentos en cola — añade citas desde la foto.</p>';
      return;
    }
    this.els.queue.innerHTML = this.queue
      .map(
        (r, i) => `
      <div class="result-item">
        <div class="result-color-dot" style="background:${getClaveById(r.color).color}"></div>
        <div style="flex:1">
          <div class="result-text">"${esc(r.texto)}"</div>
          <div class="result-meta">p.${r.pagina || '?'} · ${esc(getClaveById(r.color).label)} · ${esc(r.notas_clave_b || '')}</div>
        </div>
        <button type="button" class="clave-b-queue-remove" data-idx="${i}" title="Quitar">✕</button>
      </div>`,
      )
      .join('');
    this.els.queue.querySelectorAll('.clave-b-queue-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.queue.splice(Number(btn.dataset.idx), 1);
        this.renderQueue();
      });
    });
  };

  LecturaClaveB.prototype.clearQueue = function () {
    this.queue = [];
    this.renderQueue();
    this.status('Cola vaciada.', '');
  };

  LecturaClaveB.prototype.importQueue = function () {
    if (!this.queue.length) {
      this.status('No hay fragmentos para importar.', 'error');
      return;
    }
    const valid = this.queue.filter((f) => assessTranscription(f.texto).ok);
    const dropped = this.queue.length - valid.length;
    if (!valid.length) {
      this.status('Ningún fragmento en cola cumple criterios de legibilidad.', 'error');
      return;
    }
    if (this.opts.onImportAll) {
      this.opts.onImportAll(valid);
      const dropMsg = dropped
        ? ` · ${dropped} descartado${dropped !== 1 ? 's' : ''} por incoherentes`
        : '';
      this.status(`${valid.length} cita${valid.length !== 1 ? 's' : ''} importada${valid.length !== 1 ? 's' : ''} al archivo${dropMsg}.`, 'success');
      this.queue = [];
      this.renderQueue();
    }
  };

  LecturaClaveB.prototype.exportJson = function () {
    return JSON.stringify(this.queue, null, 2);
  };

  LecturaClaveB.prototype.getQueue = function () {
    return this.queue.slice();
  };

  global.LecturaClaveB = {
    CLAVE_B,
    classifyPixel,
    detectMarkedRegions,
    assessTranscription,
    enhanceCropForOcr,
    expandRegionForOcr,
    spanishPlausibility,
    reasonLabel,
    photoQualityHint,
    init: function (options) {
      return new LecturaClaveB(options);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);