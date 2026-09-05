#!/usr/bin/env bash
# ingest-tui-img.sh — copia una foto del TUI (o Downloads) a la carpeta canónica
# Estado del Arte en el repo iCloud antropologia-corrupcion.
#
# Uso:
#   scripts/ingest-tui-img.sh --book gramsci IMG_1213.heic
#   scripts/ingest-tui-img.sh --clave a ~/Downloads/bullet-ro.jpg
#   scripts/ingest-tui-img.sh --dry-run --book salazar ./foto.jpg
#
# Destino Clave B: src/docs/Estado del Arte/Citas <Libro>/
# Destino Clave A: src/docs/Estado del Arte/ciper-mvp/assets/inbox-clave-a/
# Desconocido:     src/docs/Estado del Arte/_inbox/
set -euo pipefail

REPO="${REPO:-/Users/ro/Library/Mobile Documents/com~apple~CloudDocs/Documents/GitHub/antropologia-corrupcion}"
EA="$REPO/src/docs/Estado del Arte"
DRY=0
CLAVE="b"
BOOK=""
FORCE=0

usage() {
  cat <<'EOF'
ingest-tui-img.sh [--book gramsci|salazar|attac|zuboff|dussel|marx|varoufakis] [--clave a|b] [--dry-run] [--force] IMAGE [IMAGE...]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --book) BOOK="${2:-}"; shift 2 ;;
    --clave) CLAVE="${2:-b}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --force) FORCE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    --) shift; break ;;
    -*) echo "flag desconocida: $1" >&2; usage; exit 2 ;;
    *) break ;;
  esac
done

if [[ $# -lt 1 ]]; then
  usage
  exit 2
fi

dest_dir_for() {
  local clave="$1" book="$2"
  if [[ "$clave" == "a" ]]; then
    echo "$EA/ciper-mvp/assets/inbox-clave-a"
    return
  fi
  case "$book" in
    gramsci|gramsci-reforma) echo "$EA/Citas Gramsci" ;;
    salazar|salazar-acumulacion) echo "$EA/Citas Salazar" ;;
    attac) echo "$EA/Citas Attac" ;;
    zuboff|zuboff-vigilancia) echo "$EA/Citas Zuboff" ;;
    dussel|dussel-hipotesis) echo "$EA/Citas Dussel" ;;
    marx|marx-capital-i) echo "$EA/Citas Marx" ;;
    varoufakis|varoufakis-tecnofeudalismo) echo "$EA/Citas Varoufakis" ;;
    ""|_inbox|inbox) echo "$EA/_inbox" ;;
    *) echo "$EA/Citas $book" ;;
  esac
}

copied=0
skipped=0
for src in "$@"; do
  if [[ ! -f "$src" ]]; then
    echo "NO DATO: no existe $src" >&2
    exit 1
  fi
  dest_dir="$(dest_dir_for "$CLAVE" "$BOOK")"
  base="$(basename "$src")"
  dest="$dest_dir/$base"
  if [[ "$DRY" == 1 ]]; then
    echo "DRY $src → $dest"
    continue
  fi
  mkdir -p "$dest_dir"
  if [[ -e "$dest" && "$FORCE" != 1 ]]; then
    if cmp -s "$src" "$dest" 2>/dev/null; then
      echo "SKIP idéntico $dest"
      skipped=$((skipped + 1))
      continue
    fi
    echo "SKIP existe (usa --force) $dest" >&2
    skipped=$((skipped + 1))
    continue
  fi
  cp "$src" "$dest"
  echo "OK $dest"
  copied=$((copied + 1))
done

echo "ingested copied=$copied skipped=$skipped clave=$CLAVE book=${BOOK:-_inbox}"
echo "next: lectura-clave-b → data/*-citas.json (una cita por fragmento marcado; leyenda ≠ cita)"
