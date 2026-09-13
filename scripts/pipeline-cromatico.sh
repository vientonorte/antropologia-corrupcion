#!/usr/bin/env bash
# pipeline-cromatico.sh — editorial corpus (stubs + merge opcional + tests)
# Uso:
#   scripts/pipeline-cromatico.sh
#   scripts/pipeline-cromatico.sh ~/Downloads/corpus-citas-2026-09-06.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node scripts/ensure-editorial-stubs.mjs
if [[ $# -ge 1 ]]; then
  node scripts/merge-clave-a-export.mjs "$1"
fi
node tests/runner.js
echo "pipeline-cromatico OK"
echo "next: commit data/*-citas.json (JPG siguen gitignored)"
