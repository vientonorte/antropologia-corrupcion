/**
 * lib/imagePrepare.js — Preparar fotos para canvas (JPG/PNG/HEIC iPhone)
 * Usa object URLs (más fiables que data URLs en fotos grandes).
 */
(function (global) {
    'use strict';

    var MAX_BYTES = 20 * 1024 * 1024;
    var MAX_EDGE = 4096;
    var HEIC2ANY_URL = 'vendor/heic2any.min.js';

    function resolveMime(file) {
        var mime = (file && file.type) || '';
        var name = ((file && file.name) || '').toLowerCase();
        if (!mime || mime === 'application/octet-stream') {
            if (/\.heic$/i.test(name)) mime = 'image/heic';
            else if (/\.heif$/i.test(name)) mime = 'image/heif';
            else if (/\.png$/i.test(name)) mime = 'image/png';
            else if (/\.webp$/i.test(name)) mime = 'image/webp';
            else if (/\.gif$/i.test(name)) mime = 'image/gif';
            else if (/\.jpe?g$/i.test(name)) mime = 'image/jpeg';
        }
        return mime.toLowerCase();
    }

    function isHeic(file) {
        var mime = resolveMime(file);
        return mime === 'image/heic' || mime === 'image/heif' || /heic|heif/.test(mime);
    }

    function isSupportedImage(file) {
        if (!file) return false;
        var mime = resolveMime(file);
        if (/^image\//.test(mime)) return true;
        return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || '');
    }

    function loadScript(src) {
        if (global.heic2any) return Promise.resolve();
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = function () { resolve(); };
            s.onerror = function () {
                reject(new Error('No se pudo cargar el convertidor HEIC. Recarga la página o exporta la foto como JPEG desde Fotos.'));
            };
            document.head.appendChild(s);
        });
    }

    function tryDecodeImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            var done = false;
            function finish(ok) {
                if (done) return;
                done = true;
                resolve(!!ok);
            }
            img.onload = function () { finish(img.naturalWidth > 0 && img.naturalHeight > 0); };
            img.onerror = function () { finish(false); };
            img.src = url;
        });
    }

    function blobToObjectUrl(blob) {
        return URL.createObjectURL(blob);
    }

    function canvasToJpegBlob(canvas, quality) {
        return new Promise(function (resolve, reject) {
            if (canvas.toBlob) {
                canvas.toBlob(function (b) {
                    if (b) resolve(b);
                    else reject(new Error('No se pudo comprimir la imagen'));
                }, 'image/jpeg', quality || 0.9);
                return;
            }
            try {
                var dataUrl = canvas.toDataURL('image/jpeg', quality || 0.9);
                var parts = dataUrl.split(',');
                var bin = atob(parts[1]);
                var arr = new Uint8Array(bin.length);
                for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                resolve(new Blob([arr], { type: 'image/jpeg' }));
            } catch (e) {
                reject(e);
            }
        });
    }

    function downscaleIfNeeded(url, progress) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {
                var w = img.naturalWidth;
                var h = img.naturalHeight;
                if (!w || !h) {
                    reject(new Error('Imagen vacía o corrupta'));
                    return;
                }
                var maxEdge = Math.max(w, h);
                if (maxEdge <= MAX_EDGE) {
                    resolve({ url: url, revoke: true });
                    return;
                }
                if (progress) progress('Reduciendo tamaño para el navegador…');
                var scale = MAX_EDGE / maxEdge;
                var cw = Math.round(w * scale);
                var ch = Math.round(h * scale);
                var canvas = document.createElement('canvas');
                canvas.width = cw;
                canvas.height = ch;
                var ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ url: url, revoke: true });
                    return;
                }
                ctx.drawImage(img, 0, 0, cw, ch);
                canvasToJpegBlob(canvas, 0.88).then(function (blob) {
                    URL.revokeObjectURL(url);
                    resolve({ url: blobToObjectUrl(blob), revoke: true });
                }).catch(function () {
                    resolve({ url: url, revoke: true });
                });
            };
            img.onerror = function () {
                reject(new Error('No se pudo decodificar la imagen'));
            };
            img.src = url;
        });
    }

    function convertHeic(file, progress) {
        return loadScript(HEIC2ANY_URL).then(function () {
            return global.heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.92,
            });
        }).then(function (result) {
            var blob = Array.isArray(result) ? result[0] : result;
            if (!blob) throw new Error('Conversión HEIC vacía — exporta como JPEG desde Fotos (Compartir → Guardar imagen).');
            var url = blobToObjectUrl(blob);
            return downscaleIfNeeded(url, progress);
        });
    }

    function prepareRasterBlob(blob, progress) {
        var url = blobToObjectUrl(blob);
        return tryDecodeImage(url).then(function (ok) {
            if (!ok) {
                URL.revokeObjectURL(url);
                throw new Error('Formato de imagen no reconocido por el navegador');
            }
            return downscaleIfNeeded(url, progress);
        });
    }

    function prepareHeic(file, progress) {
        if (progress) progress('Preparando HEIC…');
        var nativeUrl = blobToObjectUrl(file);
        return tryDecodeImage(nativeUrl).then(function (nativeOk) {
            if (nativeOk) {
                return downscaleIfNeeded(nativeUrl, progress);
            }
            URL.revokeObjectURL(nativeUrl);
            if (progress) progress('Convirtiendo HEIC a JPEG en el navegador…');
            return convertHeic(file, progress);
        });
    }

    /**
     * @param {File|Blob} file
     * @param {{ onProgress?: (msg: string) => void }} [opts]
     * @returns {Promise<{ url: string, revoke?: boolean }>}
     */
    function prepareImageFile(file, opts) {
        opts = opts || {};
        var progress = opts.onProgress || function () {};

        if (!file) return Promise.reject(new Error('Sin archivo'));
        if (file.size > MAX_BYTES) {
            return Promise.reject(new Error('La imagen supera 20 MB. Exporta como JPEG o reduce el tamaño.'));
        }
        if (!isSupportedImage(file)) {
            return Promise.reject(new Error('Formato no admitido. Usa JPG, PNG, WebP o HEIC.'));
        }
        if (isHeic(file)) {
            return prepareHeic(file, progress);
        }
        progress('Cargando imagen…');
        return prepareRasterBlob(file, progress);
    }

    global.CAImagePrepare = {
        prepareImageFile: prepareImageFile,
        isSupportedImage: isSupportedImage,
        isHeic: isHeic,
        resolveMime: resolveMime,
        MAX_BYTES: MAX_BYTES,
        MAX_EDGE: MAX_EDGE,
    };
})(typeof window !== 'undefined' ? window : globalThis);