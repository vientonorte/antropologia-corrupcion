/**
 * lib/imagePrepare.js — Preparar fotos para canvas (incl. HEIC iPhone → JPEG local)
 */
(function (global) {
    'use strict';

    var MAX_BYTES = 20 * 1024 * 1024;
    var HEIC2ANY_URL = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';

    function resolveMime(file) {
        var mime = file.type || '';
        var name = (file.name || '').toLowerCase();
        if (!mime || mime === 'application/octet-stream') {
            if (/\.heic$/i.test(name)) mime = 'image/heic';
            else if (/\.heif$/i.test(name)) mime = 'image/heif';
            else if (/\.png$/i.test(name)) mime = 'image/png';
            else if (/\.webp$/i.test(name)) mime = 'image/webp';
            else if (/\.gif$/i.test(name)) mime = 'image/gif';
            else if (/\.jpe?g$/i.test(name)) mime = 'image/jpeg';
        }
        return mime;
    }

    function isHeic(file) {
        var mime = resolveMime(file);
        return mime === 'image/heic' || mime === 'image/heif';
    }

    function isSupportedImage(file) {
        if (!file) return false;
        var mime = resolveMime(file);
        if (/^image\//.test(mime)) return true;
        return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || '');
    }

    function loadHeic2any() {
        if (global.heic2any) return Promise.resolve();
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = HEIC2ANY_URL;
            s.onload = function () { resolve(); };
            s.onerror = function () {
                reject(new Error('No se pudo cargar el convertidor HEIC. Comprueba tu conexión o exporta la foto como JPEG.'));
            };
            document.head.appendChild(s);
        });
    }

    function blobToDataUrl(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('Error leyendo imagen convertida')); };
            reader.readAsDataURL(blob);
        });
    }

    function fileToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('No se pudo leer el archivo')); };
            reader.readAsDataURL(file);
        });
    }

    function convertHeic(file) {
        return loadHeic2any().then(function () {
            return global.heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.92,
            });
        }).then(function (result) {
            var blob = Array.isArray(result) ? result[0] : result;
            if (!blob) throw new Error('Conversión HEIC vacía — prueba exportar como JPEG desde Fotos.');
            return blobToDataUrl(blob);
        });
    }

    /**
     * @param {File} file
     * @param {{ onProgress?: (msg: string) => void }} [opts]
     * @returns {Promise<string>} data URL (JPEG/PNG…)
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
            progress('Convirtiendo HEIC a JPEG en el navegador…');
            return convertHeic(file);
        }
        progress('Cargando imagen…');
        return fileToDataUrl(file);
    }

    global.CAImagePrepare = {
        prepareImageFile: prepareImageFile,
        isSupportedImage: isSupportedImage,
        isHeic: isHeic,
        resolveMime: resolveMime,
        MAX_BYTES: MAX_BYTES,
    };
})(typeof window !== 'undefined' ? window : globalThis);