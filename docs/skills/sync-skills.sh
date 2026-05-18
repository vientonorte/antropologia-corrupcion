#!/bin/bash
# sync-skills.sh — Despliega skills del repo a ~/.claude/skills/
# Uso: bash docs/skills/sync-skills.sh
# Ejecutar después de git pull o al actualizar cualquier skill.

SKILLS_DIR="$HOME/.claude/skills"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

skills=("bujo-ro" "lectura-clave-b" "ficcion-calibrator" "cita-a-ficha")

for skill in "${skills[@]}"; do
  src="$REPO_DIR/$skill.md"
  dst="$SKILLS_DIR/$skill"
  if [ -f "$src" ]; then
    mkdir -p "$dst"
    cp "$src" "$dst/SKILL.md"
    echo "✓ $skill desplegado"
  else
    echo "· $skill no encontrado en repo (pendiente de crear)"
  fi
done

echo "Sync completado."
