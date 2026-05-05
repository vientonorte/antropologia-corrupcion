/**
 * ciperFeed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Feed RSS de CIPER Chile — Contra-Archivo
 *
 * Carga, filtra y cruza noticias de CIPER con los casos etnográficos
 * del contra-archivo. Usa proxy CORS para acceso client-side;
 * si falla, entrega datos de respaldo relevantes al proyecto.
 *
 * Dependencias: ninguna (vanilla JS, DOMParser nativo)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

(function () {

  /* ─── CONSTANTES ─── */

  var FEED_URL = 'https://www.ciperchile.cl/feed/';
  // Proxy CORS de terceros necesario para acceso client-side desde GitHub Pages.
  // Privacidad: el proxy recibe la URL del feed de CIPER (dato público), no
  // información de la usuaria. En caso de fallo, se sirven artículos de respaldo.
  var PROXY_URL = 'https://api.allorigins.win/raw?url=';
  var FETCH_TIMEOUT_MS = 8000;

  /* ─── DATOS DE RESPALDO ─── */

  var MOCK_ARTICLES = [
    {
      titulo: 'AFP e inversiones en zonas de sacrificio: los fondos que financian lo que nadie ve',
      enlace: 'https://www.ciperchile.cl/2025/09/12/afp-inversiones-zonas-sacrificio/',
      fecha: '2025-09-12',
      descripcion: 'Una investigación revela cómo los fondos de pensiones chilenos mantienen participación accionaria en empresas con operaciones en territorios declarados como zonas de sacrificio ambiental, sin que los afiliados tengan información accesible sobre el destino de sus ahorros.',
      categorias: ['AFP', 'Inversiones', 'Medio Ambiente', 'Transparencia']
    },
    {
      titulo: 'SURA y la opacidad regulatoria: qué dice (y qué omite) la CMF',
      enlace: 'https://www.ciperchile.cl/2025/11/03/sura-opacidad-regulatoria-cmf/',
      fecha: '2025-11-03',
      descripcion: 'El grupo SURA Investments opera bajo un marco de supervisión que la CMF califica de suficiente, pero que deja fuera la trazabilidad completa de las cadenas de custodia transnacional. El regulador valida semáforos verdes mientras la información crítica permanece en notas al pie de documentos FECU.',
      categorias: ['CMF', 'SURA', 'Regulación', 'Corrupción Institucional']
    },
    {
      titulo: 'Territorio mapuche y consulta previa: el mecanismo que neutraliza',
      enlace: 'https://www.ciperchile.cl/2026/01/18/territorio-mapuche-consulta-previa-neutraliza/',
      fecha: '2026-01-18',
      descripcion: 'Comunidades mapuche-huilliche de la región de Los Ríos denuncian que los procesos de consulta previa bajo el Convenio 169 de la OIT operan como dispositivos de legitimación, no de participación real. CONADI media sin poder vinculante y las empresas forestales avanzan con permisos sectoriales.',
      categorias: ['Pueblos Originarios', 'OIT 169', 'Consulta Previa', 'CONADI']
    },
    {
      titulo: 'Periodismo de datos en Chile: las bases públicas que no alcanzan',
      enlace: 'https://www.ciperchile.cl/2025/07/25/periodismo-datos-chile-bases-publicas/',
      fecha: '2025-07-25',
      descripcion: 'El acceso a datos públicos en Chile sigue siendo fragmentario. Plataformas como InfoLobby, ComprasPublicas y el portal de Transparencia entregan información parcial que dificulta el cruce entre actores, instituciones y territorios. El periodismo de datos opera con materia prima incompleta.',
      categorias: ['Periodismo', 'Datos Abiertos', 'Transparencia', 'Corrupción']
    },
    {
      titulo: 'La Negra: memoria y resistencia frente al despojo territorial',
      enlace: 'https://www.ciperchile.cl/2026/03/07/la-negra-memoria-resistencia-despojo/',
      fecha: '2026-03-07',
      descripcion: 'En el sector de La Negra, región de Los Ríos, la memoria oral de las comunidades mapuche-huilliche choca con los registros catastrales del Ministerio de Bienes Nacionales. Lo que el Estado clasifica como terreno fiscal, las comunidades reconocen como territorio ancestral con historia de ocupación continua.',
      categorias: ['Territorio', 'Memoria', 'Mapuche-Huilliche', 'Bienes Nacionales']
    }
  ];

  /* ─── UTILIDADES ─── */

  /**
   * Normaliza una cadena para comparación accent-insensitive.
   * Elimina diacríticos y convierte a minúsculas.
   */
  function _normalize(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Trunca texto a un máximo de caracteres, cortando en espacio.
   */
  function _truncate(str, max) {
    if (!str || str.length <= max) return str || '';
    var cut = str.substring(0, max);
    var lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 0 ? cut.substring(0, lastSpace) : cut) + '…';
  }

  /**
   * Extrae texto plano de una cadena que puede contener HTML.
   */
  function _stripHTML(html) {
    if (!html) return '';
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Escapa caracteres HTML para prevenir XSS al inyectar en el DOM.
   */
  function _escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ─── PARSER RSS ─── */

  /**
   * Parsea XML RSS y devuelve array de artículos.
   */
  function _parseRSS(xmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, 'text/xml');

    var parseError = doc.querySelector('parsererror');
    if (parseError) {
      return null;
    }

    var items = doc.querySelectorAll('item');
    var articulos = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var titleEl = item.querySelector('title');
      var linkEl = item.querySelector('link');
      var pubDateEl = item.querySelector('pubDate');
      var descEl = item.querySelector('description');
      var catEls = item.querySelectorAll('category');

      var categorias = [];
      for (var j = 0; j < catEls.length; j++) {
        var catText = catEls[j].textContent;
        if (catText) categorias.push(catText.trim());
      }

      var rawDesc = descEl ? descEl.textContent : '';

      articulos.push({
        titulo: titleEl ? titleEl.textContent.trim() : '',
        enlace: linkEl ? linkEl.textContent.trim() : '',
        fecha: pubDateEl ? _formatDate(pubDateEl.textContent.trim()) : '',
        descripcion: _stripHTML(rawDesc).trim(),
        categorias: categorias
      });
    }

    return articulos;
  }

  /**
   * Convierte fecha RFC-2822 o ISO a YYYY-MM-DD.
   */
  function _formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var yyyy = d.getFullYear();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return yyyy + '-' + mm + '-' + dd;
  }

  /* ─── API PÚBLICA ─── */

  /**
   * Carga artículos desde el feed RSS de CIPER vía proxy CORS.
   * Si falla, devuelve datos de respaldo.
   * @returns {Promise<Array>} artículos
   */
  function cargar() {
    var url = PROXY_URL + encodeURIComponent(FEED_URL);

    return new Promise(function (resolve) {
      var aborted = false;
      var timer = setTimeout(function () {
        aborted = true;
        resolve(MOCK_ARTICLES.slice());
      }, FETCH_TIMEOUT_MS);

      fetch(url)
        .then(function (res) {
          if (aborted) return;
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (xmlText) {
          if (aborted || !xmlText) return;
          clearTimeout(timer);
          var parsed = _parseRSS(xmlText);
          resolve(parsed && parsed.length > 0 ? parsed : MOCK_ARTICLES.slice());
        })
        .catch(function (err) {
          if (aborted) return;
          clearTimeout(timer);
          console.error('CiperFeed: fallo al cargar feed — ' + err.message);
          resolve(MOCK_ARTICLES.slice());
        });
    });
  }

  /**
   * Filtra artículos cuyos titulo o descripcion mencionan algún actor.
   * Comparación accent-insensitive.
   * @param {Array} articulos
   * @param {Array<string>} actores — nombres de actores
   * @returns {Array} artículos filtrados
   */
  function filtrarPorActores(articulos, actores) {
    if (!articulos || !actores || actores.length === 0) return [];
    var actoresNorm = actores.map(_normalize);

    return articulos.filter(function (art) {
      var texto = _normalize(art.titulo + ' ' + art.descripcion);
      return actoresNorm.some(function (actor) {
        return texto.indexOf(actor) !== -1;
      });
    });
  }

  /**
   * Filtra artículos cuyos titulo o descripcion contienen algún keyword.
   * Comparación accent-insensitive.
   * @param {Array} articulos
   * @param {Array<string>} keywords
   * @returns {Array} artículos filtrados
   */
  function filtrarPorKeywords(articulos, keywords) {
    if (!articulos || !keywords || keywords.length === 0) return [];
    var kwNorm = keywords.map(_normalize);

    return articulos.filter(function (art) {
      var texto = _normalize(art.titulo + ' ' + art.descripcion);
      return kwNorm.some(function (kw) {
        return texto.indexOf(kw) !== -1;
      });
    });
  }

  /**
   * Cruza artículos con casos etnográficos del contra-archivo.
   * Calcula overlap de keywords entre cada artículo y caso.
   * @param {Array} articulos
   * @param {Array} casos — array de casos.json
   * @returns {Array<{articulo, casosRelacionados}>}
   */
  function cruzarConCasos(articulos, casos) {
    if (!articulos || !casos) return [];

    var casosKw = casos.map(function (caso) {
      var allKw = [];
      ['etica', 'institucional', 'material'].forEach(function (capa) {
        if (caso[capa] && Array.isArray(caso[capa].keywords)) {
          caso[capa].keywords.forEach(function (kw) {
            allKw.push(_normalize(kw));
          });
        }
      });
      if (Array.isArray(caso.tags)) {
        caso.tags.forEach(function (t) { allKw.push(_normalize(t)); });
      }
      if (Array.isArray(caso.actores)) {
        caso.actores.forEach(function (a) { allKw.push(_normalize(a)); });
      }
      return { id: caso.id, titulo: caso.titulo, keywords: allKw };
    });

    return articulos.map(function (art) {
      var textoNorm = _normalize(art.titulo + ' ' + art.descripcion +
        ' ' + (art.categorias || []).join(' '));

      var relacionados = [];
      casosKw.forEach(function (c) {
        var matches = c.keywords.filter(function (kw) {
          return kw.length > 2 && textoNorm.indexOf(kw) !== -1;
        });
        if (matches.length > 0) {
          relacionados.push({
            id: c.id,
            titulo: c.titulo,
            overlap: matches.length
          });
        }
      });

      relacionados.sort(function (a, b) { return b.overlap - a.overlap; });

      return { articulo: art, casosRelacionados: relacionados };
    });
  }

  /**
   * Renderiza artículos en un contenedor DOM con tarjetas estilizadas.
   * @param {Array} articulos — puede ser resultado de cruzarConCasos o array plano
   * @param {string} containerId — id del elemento contenedor
   */
  function renderHTML(articulos, containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.error('CiperFeed: contenedor #' + containerId + ' no encontrado');
      return;
    }

    if (!articulos || articulos.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-muted);font-family:var(--font-mono);' +
        'font-size:0.85rem;">Sin artículos de CIPER disponibles.</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < articulos.length; i++) {
      var item = articulos[i];
      var art = item.articulo || item;
      var casos = item.casosRelacionados || [];

      var catsHTML = (art.categorias || []).map(function (c) {
        return _escapeHTML(c);
      }).join(', ');

      var matchHTML = '';
      if (casos.length > 0) {
        var nombresHTML = casos.map(function (c) {
          return '<strong>' + _escapeHTML(c.titulo) + '</strong>' +
            ' <span style="opacity:0.6;">(' + c.overlap + ')</span>';
        }).join(', ');
        matchHTML = '<div class="ciper-match" style="margin-top:0.5rem;padding-top:0.5rem;' +
          'border-top:1px solid var(--color-border);font-size:0.75rem;' +
          'color:var(--color-text-muted);font-family:var(--font-mono);">' +
          'Relacionado con: ' + nombresHTML + '</div>';
      }

      html += '<article class="ciper-card" style="background:var(--color-surface);' +
        'border:1px solid var(--color-border);border-radius:4px;padding:1rem;' +
        'margin-bottom:0.75rem;">' +
        '<div class="ciper-meta" style="font-family:var(--font-mono);font-size:0.7rem;' +
        'color:var(--color-text-muted);margin-bottom:0.4rem;">' +
        '<time>' + _escapeHTML(art.fecha) + '</time>' +
        (catsHTML ? ' · <span class="ciper-cats">' + catsHTML + '</span>' : '') +
        '</div>' +
        '<h3 style="font-size:0.95rem;font-weight:normal;margin-bottom:0.3rem;line-height:1.4;">' +
        '<a href="' + _escapeHTML(art.enlace) + '" target="_blank" rel="noopener" ' +
        'style="color:var(--color-accent);text-decoration:none;">' +
        _escapeHTML(art.titulo) + '</a></h3>' +
        '<p style="font-size:0.8rem;color:var(--color-text);line-height:1.5;margin:0;">' +
        _escapeHTML(_truncate(art.descripcion, 200)) + '</p>' +
        matchHTML +
        '</article>';
    }

    container.innerHTML = html;
  }

  /* ─── EXPONER MÓDULO ─── */

  window.CiperFeed = {
    cargar: cargar,
    filtrarPorActores: filtrarPorActores,
    filtrarPorKeywords: filtrarPorKeywords,
    cruzarConCasos: cruzarConCasos,
    renderHTML: renderHTML
  };

})();
