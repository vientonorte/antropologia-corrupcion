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

  async function ensureTesseract() {
    if (global.Tesseract) return global.Tesseract;
    await loadScript(
      'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    );
    return global.Tesseract;
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
    };

    if (!this.els.canvas) {
      console.error('[LecturaClaveB] canvas #claveBCanvas no encontrado');
      return;
    }
    this.ctx = this.els.canvas.getContext('2d', { willReadFrequently: true });
    this.bindUi();
    this.renderToolbar();
    this.setDefaults();
  }

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
              self.status('Foto cargada. Elige color Clave B y marca fragmentos.', 'success');
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
    this.selection = null;
    this.revokeImageUrl();
    if (this.ctx && this.els.canvas) {
      this.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
    }
    if (this.els.workspace) this.els.workspace.style.display = 'none';
    this.status('');
  };

  LecturaClaveB.prototype.fitCanvas = function () {
    if (!this.image || !this.els.wrap || !this.els.canvas) return;
    const iw = this.image.naturalWidth || this.image.width;
    const ih = this.image.naturalHeight || this.image.height;
    if (!iw || !ih) return;
    const maxW = this.els.wrap.clientWidth || 640;
    const maxH = 480;
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

  LecturaClaveB.prototype.ocrRegion = async function (region, Tesseract) {
    const tess = Tesseract || (await ensureTesseract());
    const crop = this.cropRegionToCanvas(region);
    const result = await tess.recognize(crop, 'spa', { logger: () => {} });
    return (result.data.text || '').replace(/\s+/g, ' ').trim();
  };

  LecturaClaveB.prototype.ocrSelection = async function () {
    if (!this.selection || !this.image) {
      this.status('Selecciona una región en la foto primero.', 'error');
      return;
    }
    this.status('OCR local en progreso…');
    try {
      const text = await this.ocrRegion(this.selection);
      if (this.els.texto) this.els.texto.value = text || '[ilegible]';
      this.status(text ? 'OCR completado — revisa y corrige la transcripción.' : 'OCR sin texto — transcribe manualmente.', text ? 'success' : '');
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
      const Tesseract = await ensureTesseract();
      const libro = (this.els.libro?.value || '').trim() || this.opts.defaultLibro;
      const autor = (this.els.autor?.value || '').trim() || this.opts.defaultAutor;
      const pagina = parseInt(this.els.pagina?.value, 10) || null;
      let added = 0;
      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        this.status(`OCR fragmento ${i + 1}/${regions.length} · ${getClaveById(region.color).label}…`);
        const texto = await this.ocrRegion(region, Tesseract);
        if (!texto || texto.length < 4) continue;
        const clave = getClaveById(region.color);
        this.queue.push({
          libro,
          autor,
          pagina,
          texto,
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
        this.status('Marcadores detectados pero OCR sin texto legible — transcribe manualmente.', 'error');
      } else {
        this.status(
          `${added} fragmento${added !== 1 ? 's' : ''} detectado${added !== 1 ? 's' : ''} y transcrito${added !== 1 ? 's' : ''}. Revisa la cola e importa al archivo.`,
          'success',
        );
        if (this.opts.onQueueChange) this.opts.onQueueChange(this.queue);
      }
    } catch (err) {
      this.status('Error en escaneo automático: ' + err.message, 'error');
    }
    this._scanning = false;
  };

  LecturaClaveB.prototype.readForm = function () {
    const clave = getClaveById(this.activeColor);
    const texto = (this.els.texto?.value || '').trim();
    if (!texto) {
      this.status('Escribe o extrae el texto del fragmento.', 'error');
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
    if (this.opts.onImportAll) {
      this.opts.onImportAll(this.queue.slice());
      this.status(`${this.queue.length} citas importadas al archivo.`, 'success');
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
    init: function (options) {
      return new LecturaClaveB(options);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);