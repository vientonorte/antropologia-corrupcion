/**
 * lectura-clave-a.js — Lectura cromática Bullet Ro (Clave A) sin IA
 * Protocolo bujo-ro v1.2 · cuaderno / post-its
 */
(function (global) {
  'use strict';

  const CLAVE_A = [
    { id: 'pink', color: '#e8847a', label: 'Personal', categoria: 'personal', emoji: '🩷' },
    { id: 'gray', color: '#8a8a8a', label: 'Vínculos', categoria: 'vinculos', emoji: '⬛' },
    { id: 'teal', color: '#4ab8a5', label: 'Camila', categoria: 'camila', emoji: '🩵' },
    { id: 'orange', color: '#e8a24a', label: 'Laboral', categoria: 'laboral', emoji: '🟠' },
    { id: 'yellow', color: '#f4d35e', label: 'Referencias', categoria: 'referencia', emoji: '🟡' },
  ];

  const REF_RGB = {
    pink: [232, 132, 122],
    gray: [138, 138, 138],
    teal: [74, 184, 165],
    orange: [232, 162, 74],
    yellow: [244, 211, 94],
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
    return bestD < 130 ? best : null;
  }

  function sampleRegion(ctx, x, y, w, h) {
    const data = ctx.getImageData(x, y, w, h).data;
    const counts = {};
    let samples = 0;
    for (let i = 0; i < data.length; i += 16) {
      const hit = classifyPixel(data[i], data[i + 1], data[i + 2]);
      if (hit) {
        counts[hit] = (counts[hit] || 0) + 1;
        samples += 1;
      }
    }
    if (!samples) return null;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function getClaveById(id) {
    return CLAVE_A.find((c) => c.id === id) || CLAVE_A[4];
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

  function LecturaClaveA(options) {
    this.opts = Object.assign(
      {
        defaultFuente: 'Bullet Ro',
        defaultAutor: 'Rö',
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
      workspace: document.getElementById('claveAWorkspace'),
      toolbar: document.getElementById('claveAToolbar'),
      canvas: document.getElementById('claveACanvas'),
      wrap: document.getElementById('claveACanvasWrap'),
      referencia: document.getElementById('claveAReferencia'),
      texto: document.getElementById('claveATexto'),
      notas: document.getElementById('claveANotas'),
      colorLabel: document.getElementById('claveAColorLabel'),
      queue: document.getElementById('claveAQueue'),
      queueCount: document.getElementById('claveAQueueCount'),
      status: document.getElementById('claveAStatus'),
    };

    if (!this.els.canvas) {
      console.error('[LecturaClaveA] canvas #claveACanvas no encontrado');
      return;
    }
    this.ctx = this.els.canvas.getContext('2d', { willReadFrequently: true });
    this.bindUi();
    this.renderToolbar();
  }

  LecturaClaveA.prototype.status = function (msg, type) {
    if (this.els.status) {
      this.els.status.textContent = msg || '';
      this.els.status.className = 'analyze-status' + (type ? ' ' + type : '');
    }
    if (this.opts.onStatus) this.opts.onStatus(msg, type);
  };

  LecturaClaveA.prototype.renderToolbar = function () {
    if (!this.els.toolbar) return;
    this.els.toolbar.innerHTML = CLAVE_A.map(
      (c) =>
        `<button type="button" class="clave-b-swatch${this.activeColor === c.id ? ' active' : ''}" data-color="${c.id}" style="--swatch:${c.color}" title="${c.emoji} ${c.label}" aria-label="${c.label}" aria-pressed="${this.activeColor === c.id}">${c.emoji}</button>`,
    ).join('');
    this.els.toolbar.querySelectorAll('.clave-b-swatch').forEach((btn) => {
      btn.addEventListener('click', () => this.selectColor(btn.dataset.color));
    });
    this.updateColorLabel();
  };

  LecturaClaveA.prototype.selectColor = function (id) {
    this.activeColor = id;
    this.renderToolbar();
  };

  LecturaClaveA.prototype.updateColorLabel = function () {
    const c = getClaveById(this.activeColor);
    if (this.els.colorLabel) {
      this.els.colorLabel.textContent = `${c.emoji} ${c.label} · ${c.categoria}`;
    }
  };

  LecturaClaveA.prototype.bindUi = function () {
    const self = this;
    const canvas = this.els.canvas;

    document.querySelectorAll('[data-clave-a-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-clave-a-mode]').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        self.mode = btn.dataset.claveAMode;
        canvas.style.cursor = self.mode === 'eyedropper' ? 'crosshair' : 'cell';
      });
    });

    document.getElementById('claveAAddFragment')?.addEventListener('click', () =>
      self.addFragment(),
    );
    document.getElementById('claveAImportQueue')?.addEventListener('click', () =>
      self.importQueue(),
    );
    document.getElementById('claveAClearQueue')?.addEventListener('click', () =>
      self.clearQueue(),
    );
    document.getElementById('claveAOcrRegion')?.addEventListener('click', () =>
      self.ocrSelection(),
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

  LecturaClaveA.prototype.revokeImageUrl = function () {
    if (this._objectUrl) {
      try {
        URL.revokeObjectURL(this._objectUrl);
      } catch (e) {
        /* noop */
      }
      this._objectUrl = null;
    }
  };

  LecturaClaveA.prototype.loadImage = function (src) {
    const self = this;
    const url = typeof src === 'string' ? src : src && src.url;
    if (!url) {
      this.status('URL de imagen inválida.', 'error');
      return;
    }
    this.revokeImageUrl();
    if (typeof src === 'object' && src.url && src.revoke !== false) {
      this._objectUrl = src.url;
    }
    const img = new Image();
    img.onload = function () {
      self.image = img;
      if (self.els.workspace) self.els.workspace.style.display = 'block';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.fitCanvas();
          self.draw();
          self.status('Foto cargada. Elige color Clave A y marca fragmentos.', 'success');
        });
      });
    };
    img.onerror = function () {
      self.revokeImageUrl();
      self.status(
        'No se pudo mostrar la imagen. Prueba exportar como JPEG desde Fotos o usa una foto más pequeña.',
        'error',
      );
    };
    img.src = url;
  };

  LecturaClaveA.prototype.clear = function () {
    this.image = null;
    this.selection = null;
    this.revokeImageUrl();
    if (this.ctx) this.ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
    if (this.els.workspace) this.els.workspace.style.display = 'none';
    this.status('');
  };

  LecturaClaveA.prototype.fitCanvas = function () {
    if (!this.image || !this.els.wrap) return;
    const maxW = this.els.wrap.clientWidth || 640;
    const maxH = 480;
    const ratio = Math.min(maxW / this.image.width, maxH / this.image.height, 1);
    this.scale = ratio;
    this.els.canvas.width = Math.round(this.image.width * ratio);
    this.els.canvas.height = Math.round(this.image.height * ratio);
  };

  LecturaClaveA.prototype.draw = function () {
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

  LecturaClaveA.prototype.canvasPoint = function (e) {
    const rect = this.els.canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(this.els.canvas.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(this.els.canvas.height, e.clientY - rect.top)),
    };
  };

  LecturaClaveA.prototype.onPointerDown = function (e) {
    if (!this.image) return;
    const p = this.canvasPoint(e);
    if (this.mode === 'eyedropper') {
      const px = this.ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
      const hit = classifyPixel(px[0], px[1], px[2]);
      if (hit) {
        this.selectColor(hit);
        this.status(`Color detectado: ${getClaveById(hit).label}`, 'success');
      } else {
        this.status('Clic sin marcador — selecciona color manualmente.', '');
      }
      return;
    }
    this.drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
  };

  LecturaClaveA.prototype.onPointerMove = function (e) {
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

  LecturaClaveA.prototype.onPointerUp = function (e) {
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

  LecturaClaveA.prototype.ocrSelection = async function () {
    if (!this.selection || !this.image) {
      this.status('Selecciona una región en la foto primero.', 'error');
      return;
    }
    this.status('OCR local en progreso…');
    try {
      const Tesseract = await ensureTesseract();
      const crop = document.createElement('canvas');
      const s = this.selection;
      const inv = 1 / this.scale;
      crop.width = Math.max(1, Math.round(s.w * inv));
      crop.height = Math.max(1, Math.round(s.h * inv));
      crop.getContext('2d').drawImage(
        this.image,
        s.x * inv,
        s.y * inv,
        s.w * inv,
        s.h * inv,
        0,
        0,
        crop.width,
        crop.height,
      );
      const result = await Tesseract.recognize(crop, 'spa', {
        logger: () => {},
      });
      const text = (result.data.text || '').replace(/\s+/g, ' ').trim();
      if (this.els.texto) this.els.texto.value = text || '[ilegible]';
      this.status(
        text ? 'OCR completado — revisa y corrige la transcripción.' : 'OCR sin texto — transcribe manualmente.',
        text ? 'success' : '',
      );
    } catch (err) {
      this.status('Error OCR: ' + err.message, 'error');
    }
  };

  LecturaClaveA.prototype.readForm = function () {
    const clave = getClaveById(this.activeColor);
    const texto = (this.els.texto?.value || '').trim();
    if (!texto) {
      this.status('Escribe o extrae el texto del fragmento.', 'error');
      return null;
    }
    const ref = (this.els.referencia?.value || '').trim();
    return {
      clave: 'A',
      libro: this.opts.defaultFuente,
      autor: this.opts.defaultAutor,
      pagina: ref || null,
      texto,
      color: clave.id,
      categoria: clave.categoria,
      notas_clave_a: (this.els.notas?.value || '').trim(),
    };
  };

  LecturaClaveA.prototype.addFragment = function () {
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

  LecturaClaveA.prototype.renderQueue = function () {
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
        '<p class="clave-b-queue-empty">Sin fragmentos en cola — añade notas desde la foto.</p>';
      return;
    }
    this.els.queue.innerHTML = this.queue
      .map(
        (r, i) => `
      <div class="result-item">
        <div class="result-color-dot" style="background:${getClaveById(r.color).color}"></div>
        <div style="flex:1">
          <div class="result-text">"${esc(r.texto)}"</div>
          <div class="result-meta">${esc(r.referencia || r.pagina || '?')} · ${esc(getClaveById(r.color).label)} · ${esc(r.notas_clave_a || '')}</div>
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

  LecturaClaveA.prototype.clearQueue = function () {
    this.queue = [];
    this.renderQueue();
    this.status('Cola vaciada.', '');
  };

  LecturaClaveA.prototype.importQueue = function () {
    if (!this.queue.length) {
      this.status('No hay fragmentos para importar.', 'error');
      return;
    }
    if (this.opts.onImportAll) {
      this.opts.onImportAll(this.queue.slice());
      this.status(`${this.queue.length} notas importadas al archivo.`, 'success');
      this.queue = [];
      this.renderQueue();
    }
  };

  global.LecturaClaveA = {
    CLAVE_A,
    classifyPixel,
    init: function (options) {
      return new LecturaClaveA(options);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);