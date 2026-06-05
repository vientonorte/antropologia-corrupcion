#!/usr/bin/env python3
"""
Inventario Fase 0 — Sanitización Contra-Archivo
NO expone contenido a APIs externas. Procesamiento 100% local.

Uso:
  cd ~/Documents/GitHub/antropologia-corrupcion/sanitization-toolkit
  source venv/bin/activate
  python inventory_phase_0.py /Users/ro/Documents/GitHub/antropologia-corrupcion ./inventario.csv
"""
import os, sys, hashlib, csv, re
from datetime import datetime
from pathlib import Path

# Regex chileno-friendly
PII_PATTERNS = {
    'email': re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}'),
    'rut_chile': re.compile(r'\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b'),
    'telefono_cl': re.compile(r'\+56[\s\-]?\d{1,2}[\s\-]?\d{4}[\s\-]?\d{4}'),
    'fecha_iso': re.compile(r'\b\d{4}-\d{2}-\d{2}\b'),
    'url': re.compile(r'https?://[^\s<>"]+'),
}

# Nombres conocidos relevantes (extender ANTES de correr)
NAMES_KNOWN = [
    'Andrés Rojas Gaona', 'Rodrigo Gaete', 'Rö',
    'Camila',
    'Anakaren', 'Mónica González', 'Ángel Maulén',
    'Harald Beyer', 'Raúl Astudillo', 'Lucio Jiménez',
    # EXTENDER con la lista propia antes de correr:
    # - apellido pareja, hermano, primo, abuela, abuelo
    # - fuentes vivas mencionadas en fichas C0X
    # - colaboradoras: La Negra Colorada, integrantes CEAC Valdivia
    # - dirigentas Petorca, comuneros Temucuicui, etc.
]

TEXT_EXT = {'.md', '.txt', '.html', '.htm', '.json', '.csv', '.js',
            '.ts', '.py', '.css', '.yml', '.yaml', '.eml', '.mbox'}
PDF_EXT = {'.pdf'}
IMG_EXT = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.tiff', '.bmp'}
VIDEO_EXT = {'.mp4', '.mov', '.avi', '.mkv', '.webm'}
AUDIO_EXT = {'.mp3', '.m4a', '.wav', '.ogg', '.flac'}

EXCLUDE_DIRS = {'.git', 'node_modules', 'venv', '__pycache__',
                '.next', 'dist', 'build', '.vscode', '.claude',
                'sanitization-toolkit'}  # exclude self


def sha256_file(path):
    h = hashlib.sha256()
    try:
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(65536), b''):
                h.update(chunk)
        return h.hexdigest()[:16]
    except Exception:
        return 'ERROR'


def scan_text_pii(path):
    """Detecta PII sin exponer contenido. Solo cuenta y tipos."""
    counts = {k: 0 for k in PII_PATTERNS}
    counts['name_known'] = 0
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(2_000_000)  # cap 2 MB por archivo
        for key, pat in PII_PATTERNS.items():
            counts[key] = len(pat.findall(content))
        for name in NAMES_KNOWN:
            counts['name_known'] += content.count(name)
    except Exception:
        pass
    return counts


def classify_file(path):
    ext = Path(path).suffix.lower()
    if ext in TEXT_EXT: return 'text'
    if ext in PDF_EXT: return 'pdf'
    if ext in IMG_EXT: return 'image'
    if ext in VIDEO_EXT: return 'video'
    if ext in AUDIO_EXT: return 'audio'
    return 'other'


def main(root, output):
    root = Path(root).expanduser().resolve()
    rows = []
    total = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            full = Path(dirpath) / fn
            try:
                size = full.stat().st_size
                mtime = datetime.fromtimestamp(full.stat().st_mtime).isoformat()
            except Exception:
                continue
            kind = classify_file(full)
            row = {
                'path': str(full.relative_to(root)),
                'type': kind,
                'size_bytes': size,
                'last_modified': mtime,
                'sha256_16': sha256_file(full),
                'pii_email': 0, 'pii_rut': 0, 'pii_phone': 0,
                'pii_date': 0, 'pii_url': 0, 'name_known': 0,
            }
            if kind == 'text' and size < 2_000_000:
                pii = scan_text_pii(full)
                row['pii_email'] = pii['email']
                row['pii_rut'] = pii['rut_chile']
                row['pii_phone'] = pii['telefono_cl']
                row['pii_date'] = pii['fecha_iso']
                row['pii_url'] = pii['url']
                row['name_known'] = pii['name_known']
            rows.append(row)
            total += 1
            if total % 100 == 0:
                print(f'  procesados: {total}', file=sys.stderr)

    if not rows:
        print('No se encontraron archivos. Verifica la ruta de entrada.')
        sys.exit(2)

    with open(output, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)

    # Resumen
    print(f'\nINVENTARIO COMPLETO')
    print(f'  Total archivos: {total}')
    print(f'  Archivos por tipo:')
    by_type = {}
    for r in rows:
        by_type[r['type']] = by_type.get(r['type'], 0) + 1
    for k, v in sorted(by_type.items()):
        print(f'    {k}: {v}')
    print(f'  PII detectada (suma):')
    print(f'    emails: {sum(r["pii_email"] for r in rows)}')
    print(f'    RUTs: {sum(r["pii_rut"] for r in rows)}')
    print(f'    teléfonos: {sum(r["pii_phone"] for r in rows)}')
    print(f'    fechas ISO: {sum(r["pii_date"] for r in rows)}')
    print(f'    URLs: {sum(r["pii_url"] for r in rows)}')
    print(f'    nombres conocidos: {sum(r["name_known"] for r in rows)}')
    print(f'\nTop 10 archivos por densidad de PII:')
    scored = [
        (r['pii_email'] + r['pii_rut'] + r['pii_phone'] + r['name_known'], r)
        for r in rows if r['type'] == 'text'
    ]
    scored.sort(reverse=True, key=lambda x: x[0])
    for score, r in scored[:10]:
        if score > 0:
            print(f'    [{score:>4}] {r["path"]}')
    print(f'\nOutput: {output}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Uso: python inventory_phase_0.py <root_dir> <output.csv>')
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
