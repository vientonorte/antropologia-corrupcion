/**
 * categoryExport.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Exportación CSV de resultados por categoría
 * Contra-Archivo — Sistema de Categorías Avanzadas de Búsqueda
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

(function() {
    /**
     * Genera CSV a partir de registros filtrados
     * @param {Array} records - Array de registros a exportar
     * @param {Object} options - Opciones de exportación
     * @param {Array} options.columns - Columnas a incluir (default: todas las relevantes)
     * @param {Object} options.metadata - Metadata adicional (categoria, fecha_export, etc.)
     * @returns {string} Contenido CSV
     */
    function generateCSV(records, options) {
        options = options || {};
        var columns = options.columns || [
            'id',
            'titulo',
            'fecha',
            'fuente',
            'institucion',
            'friccion_score',
            'tipo_friccion',
            'friccion_con',
            'keywords',
            'tags',
            'capa_oficial'
        ];
        var metadata = options.metadata || {};

        var lines = [];

        // Metadata header
        if (metadata.categoria) {
            lines.push('# Categoria: ' + metadata.categoria);
        }
        if (metadata.fecha_export) {
            lines.push('# Fecha exportacion: ' + metadata.fecha_export);
        }
        if (metadata.total_registros !== undefined) {
            lines.push('# Total registros: ' + metadata.total_registros);
        }
        if (lines.length > 0) {
            lines.push('');
        }

        // Column headers
        lines.push(columns.map(escapeCSVValue).join(','));

        // Data rows
        records.forEach(function(r) {
            var row = columns.map(function(col) {
                var value = r[col];
                
                // Special handling for arrays
                if (col === 'keywords' || col === 'tags') {
                    value = Array.isArray(value) ? value.join('; ') : '';
                }
                
                // Special handling for friction score
                if (col === 'friccion_score') {
                    value = r._frictionScore !== undefined ? r._frictionScore.toFixed(3) : '';
                }
                
                // Convert to string and escape
                return escapeCSVValue(value != null ? String(value) : '');
            });
            lines.push(row.join(','));
        });

        return lines.join('\n');
    }

    /**
     * Escapa valor para CSV (maneja comillas, comas, saltos de línea)
     * @param {string} value
     * @returns {string}
     */
    function escapeCSVValue(value) {
        if (!value) return '';
        value = String(value);
        
        // Si contiene comillas, comas, o saltos de línea, envolver en comillas y escapar comillas internas
        if (value.indexOf('"') !== -1 || value.indexOf(',') !== -1 || value.indexOf('\n') !== -1) {
            value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
    }

    /**
     * Descarga CSV como archivo
     * @param {string} csvContent - Contenido CSV
     * @param {string} filename - Nombre del archivo (default: contra-archivo.csv)
     */
    function downloadCSV(csvContent, filename) {
        filename = filename || 'contra-archivo.csv';
        
        // Crear blob con BOM para Excel UTF-8
        var BOM = '\uFEFF';
        var blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Crear link temporal y disparar descarga
        var link = document.createElement('a');
        if (link.download !== undefined) {
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Exporta resultados de categoría filtrados
     * @param {string} category - Categoría (E, F, G, H, I)
     * @param {Array} filteredRecords - Registros filtrados a exportar
     */
    function exportCategoryResults(category, filteredRecords) {
        var csv = generateCSV(filteredRecords, {
            columns: ['id', 'titulo', 'fecha', 'fuente', 'institucion', 'friccion_score', 'tipo_friccion', 'friccion_con', 'keywords', 'tags'],
            metadata: {
                categoria: category,
                fecha_export: new Date().toISOString(),
                total_registros: filteredRecords.length
            }
        });
        
        var timestamp = new Date().toISOString().slice(0, 10);
        var filename = 'contra-archivo-cat-' + category + '-' + timestamp + '.csv';
        
        downloadCSV(csv, filename);
    }

    // Export to window
    if (typeof window !== 'undefined') {
        window.categoryExport = {
            generateCSV: generateCSV,
            downloadCSV: downloadCSV,
            exportCategoryResults: exportCategoryResults
        };
    }
})();
