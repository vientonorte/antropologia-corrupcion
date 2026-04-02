#!/usr/bin/env python3
"""Extract academic content from obsolete branches before deletion."""
import json, subprocess, re

def git_show(branch, path):
    return subprocess.check_output(
        ['git', 'show', f'{branch}:{path}'], text=True
    )

html = git_show('origin/copilot/donde-quedamos', 'index.html')
html2 = git_show('origin/codex/mejora-el-artefacto-del-proyecto', 'index.html')

sections = {}

# Conclusiones section
m = re.search(r'<section id="conclusiones"[^>]*>(.*?)</section>', html, re.DOTALL)
if m:
    sections["conclusiones"] = m.group(1).strip()

# Investigador section
m = re.search(r'<section id="investigador"[^>]*>(.*?)</section>', html, re.DOTALL)
if m:
    sections["investigador"] = m.group(1).strip()

# Cronologia del despojo
m = re.search(r'<h3>Cronolog.a del despojo territorial</h3>(.*?)(?=<h3>|</section>)', html, re.DOTALL)
if m:
    sections["cronologia_despojo"] = m.group(0).strip()

# Agentes e intermediarios
m = re.search(r'<h3>Agentes e intermediarios institucionales</h3>(.*?)(?=</section>)', html, re.DOTALL)
if m:
    sections["agentes_intermediarios"] = m.group(0).strip()

# Mejoras de tesis from codex branch
m = re.search(r'<section id="mejoras-tesis"[^>]*>(.*?)</section>', html2, re.DOTALL)
if m:
    sections["mejoras_tesis"] = m.group(1).strip()

out = {
    "fuente": "Extraido de ramas copilot/donde-quedamos y codex/mejora-el-artefacto-del-proyecto",
    "fecha_extraccion": "2026-04-01",
    "nota": "Contenido academico rescatado antes de eliminar ramas obsoletas. HTML original preservado para integracion futura en main.",
    "commits_origen": {
        "donde-quedamos": "2e08a02",
        "codex-mejora": "352a350"
    },
    "secciones": {}
}

for key, val in sections.items():
    plain = re.sub(r'<[^>]+>', ' ', val)
    plain = re.sub(r'\s+', ' ', plain).strip()
    out["secciones"][key] = {
        "html": val,
        "texto_plano": plain,
        "caracteres": len(plain)
    }

with open('data/contenido-ramas-rescatado.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

total = sum(s["caracteres"] for s in out["secciones"].values())
print(f"Extraidas {len(out['secciones'])} secciones, {total:,} caracteres total:")
for k, v in out["secciones"].items():
    print(f"  {k}: {v['caracteres']:,} chars")
