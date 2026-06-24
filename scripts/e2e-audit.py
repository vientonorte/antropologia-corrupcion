#!/usr/bin/env python3
"""End-to-end audit — público + investigador + circuito grafo→buscador→huella."""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"

# ── Circuito visitante (público) ──
PUBLIC_JOURNEY = [
    ("P1 Inicio", "web/index.html", [
        ("boot", r"home-boot\.js"),
        ("grafo", r"graphBootstrap\.js|graphChunk\.js"),
        ("main landmark", r'<main[^>]+id="main-content"'),
        ("skip-link", r"skip-link"),
        ("tesis mount", r"ca-thesis-placeholder"),
        ("surfaces", r"siteSurface\.js"),
    ]),
    ("P2 Instrumento", "web/contra-archivo-v2.html", [
        ("instrumento-boot", r"instrumento-boot\.js"),
        ("grafo bust", r"graphBootstrap\.js\?v=20260624"),
    ]),
    ("P3 Buscador", "web/buscador.html", [
        ("buscador-boot", r"buscador-boot\.js"),
        ("huella", r"huellaDigital\.js"),
        ("avanzado", r"buscadorAvanzado\.js"),
    ]),
    ("P4 Leer", "web/leer.html", [
        ("narrative", r"narrativeRenderer\.js"),
        ("leer-boot", r"leer-boot\.js"),
    ]),
    ("P5 Biblioteca", "web/tesis.html", [
        ("catalog", r"bibliotecaLoader\.js"),
        ("privado-login", r"privado-login\.html"),
        ("no login.html", lambda h: 'href="login.html"' not in h),
    ]),
    ("P6 Archivo", "web/archivo.html", [
        ("archivo", r"archivo-index"),
    ]),
]

# ── Circuito investigador ──
INVESTIGATOR_JOURNEY = [
    ("I1 Acceso", "web/privado-login.html", [
        ("passkey", r"passkey\.js"),
        ("main", r'id="main-content"'),
    ]),
    ("I2 Login redirect", "web/login.html", [
        ("redirect", r"privado-login\.html"),
    ]),
]

# ── Deep-link circuit (static) ──
CIRCUIT_RULES = [
    ("grafo→buscador", ROOT / "src/nodeRenderer.js", r"CAHuellaDigital\.buildBuscadorUrl"),
    ("caso deep-link", ROOT / "src/graphBootstrap.js", r"get\('caso'\)"),
    ("fuente deep-link", WEB / "lib/buscadorAvanzado.js", r"get\('fuente'\)"),
    ("huella deep-link", WEB / "pages/buscador-boot.js", r"get\('huella'\)"),
    ("huella→grafo", WEB / "lib/huellaDigital.js", r"index\.html\?caso="),
    ("chips→buscador", WEB / "lib/basesConsultadas.js", r"buscador\.html\?fuente="),
]

DATA_FILES = [
    "data/archivo-index.json",
    "data/narrativa-rescatada.json",
    "data/casos.json",
    "data/fuentes-oficiales.json",
    "data/fuentes-config.json",
]

LIVE_BASE = "https://vientonorte.github.io/antropologia-corrupcion"
LIVE_PATHS = [
    "/index.html",
    "/tesis.html",
    "/buscador.html",
    "/leer.html",
    "/contra-archivo-v2.html",
    "/privado-login.html",
    "/src/graphBootstrap.js",
    "/src/socialField.js",
    "/styles/graph.css",
    "/data/casos.json",
]


def read(rel: str) -> str:
    p = ROOT / rel
    if not p.is_file():
        return ""
    return p.read_text(encoding="utf-8", errors="replace")


def check_journey(name: str, rel: str, rules: list) -> list[str]:
    issues = []
    content = read(rel)
    if not content:
        return [f"{name}: archivo ausente ({rel})"]
    for label, rule in rules:
        if callable(rule):
            ok = rule(content)
        else:
            ok = re.search(rule, content)
        if not ok:
            issues.append(f"{name}: {label}")
    return issues


def check_data() -> list[str]:
    issues = []
    for rel in DATA_FILES:
        p = ROOT / rel
        if not p.is_file():
            issues.append(f"DATA missing: {rel}")
            continue
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            issues.append(f"DATA invalid JSON {rel}: {e}")
            continue
        if rel.endswith("archivo-index.json"):
            entries = data.get("entries") or []
            if not entries:
                issues.append("DATA archivo-index: entries vacío")
        if rel.endswith("narrativa-rescatada.json"):
            if not data.get("presentacion_00"):
                issues.append("DATA narrativa: falta presentacion_00")
        if rel.endswith("casos.json"):
            casos = data if isinstance(data, list) else data.get("casos") or data.get("nodes") or []
            if not casos:
                issues.append("DATA casos.json: sin casos")
    return issues


def check_internal_links() -> list[str]:
    """Crawl href/src from seed pages — local file resolution."""
    issues = []
    seeds = [
        "index.html", "tesis.html", "buscador.html", "leer.html",
        "contra-archivo-v2.html", "archivo.html", "privado-login.html",
    ]
    seen: set[str] = set()
    queue = list(seeds)
    href_re = re.compile(r'''(?:href|src)=["']([^"'#?]+)["']''', re.I)

    def resolve(page: str, target: str) -> Path | None:
        if target.startswith("data:") or target.startswith("mailto:"):
            return None
        if target.startswith("http://") or target.startswith("https://"):
            return None  # external / canonical — no local resolve
        base = (WEB / page).parent
        candidate = (base / target).resolve()
        if candidate.is_file():
            return candidate
        # repo-root assets (src/, data/)
        alt = (ROOT / target).resolve()
        if alt.is_file():
            return alt
        return None

    while queue:
        page = queue.pop(0)
        if page in seen:
            continue
        seen.add(page)
        html_path = WEB / page
        if not html_path.is_file():
            issues.append(f"LINK seed missing: {page}")
            continue
        text = html_path.read_text(encoding="utf-8", errors="replace")
        for m in href_re.finditer(text):
            target = m.group(1).strip()
            if target.startswith("http://") or target.startswith("https://"):
                continue
            if not target or target.endswith((".js", ".css", ".json", ".svg", ".jpg", ".png", ".woff2")):
                resolved = resolve(page, target)
                if resolved is None and not target.startswith("../"):
                    # allow vendor paths
                    if target.startswith("src/") or target.startswith("data/") or target.startswith("lib/"):
                        alt = ROOT / target.split("?")[0]
                        if not alt.is_file() and not (WEB / target.split("?")[0]).is_file():
                            issues.append(f"LINK broken from {page}: {target}")
                continue
            resolved = resolve(page, target)
            if resolved is None:
                if target.endswith(".html"):
                    issues.append(f"LINK broken from {page}: {target}")
            elif resolved.suffix == ".html" and resolved.name not in seen:
                rel = str(resolved.relative_to(WEB))
                queue.append(rel)

    return issues


def check_live() -> list[str]:
    issues = []
    for path in LIVE_PATHS:
        url = LIVE_BASE + path
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "vn-e2e/1.0"})
            with urllib.request.urlopen(req, timeout=12) as res:
                status = res.status
                body = res.read(2048)
        except urllib.error.HTTPError as e:
            status = e.code
            body = b""
        except Exception as e:
            issues.append(f"LIVE {path}: {e}")
            continue
        if status != 200:
            issues.append(f"LIVE {path}: HTTP {status}")
        elif path.endswith("socialField.js") and b"sf-formula" not in body:
            issues.append(f"LIVE {path}: sf-formula no desplegado aún (cache/deploy pendiente)")
    return issues


def main() -> int:
    mode = "--live" in sys.argv
    issues: list[str] = []

    print("═══ E2E Audit — Contra-Archivo ═══\n")

    print("▸ Circuito público")
    for name, rel, rules in PUBLIC_JOURNEY:
        step_issues = check_journey(name, rel, rules)
        if step_issues:
            issues.extend(step_issues)
            print(f"  ✗ {name}")
            for i in step_issues:
                print(f"      {i}")
        else:
            print(f"  ✓ {name}")

    print("\n▸ Circuito investigador")
    for name, rel, rules in INVESTIGATOR_JOURNEY:
        step_issues = check_journey(name, rel, rules)
        if step_issues:
            issues.extend(step_issues)
            print(f"  ✗ {name}")
            for i in step_issues:
                print(f"      {i}")
        else:
            print(f"  ✓ {name}")

    print("\n▸ Deep-links grafo → buscador → huella")
    for label, path, pattern in CIRCUIT_RULES:
        if not path.is_file():
            issues.append(f"CIRCUIT {label}: missing {path.name}")
            print(f"  ✗ {label}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if re.search(pattern, text):
            print(f"  ✓ {label}")
        else:
            issues.append(f"CIRCUIT {label}: pattern not found")
            print(f"  ✗ {label}")

    print("\n▸ Datos JSON")
    data_issues = check_data()
    if data_issues:
        issues.extend(data_issues)
        for i in data_issues:
            print(f"  ✗ {i}")
    else:
        print(f"  ✓ {len(DATA_FILES)} archivos OK")

    print("\n▸ Enlaces internos (crawl local)")
    link_issues = check_internal_links()
    if link_issues:
        issues.extend(link_issues[:20])
        for i in link_issues[:20]:
            print(f"  ✗ {i}")
        if len(link_issues) > 20:
            print(f"  … +{len(link_issues) - 20} más")
    else:
        print("  ✓ sin enlaces rotos en crawl")

    if mode:
        print("\n▸ Producción GitHub Pages")
        live_issues = check_live()
        if live_issues:
            issues.extend(live_issues)
            for i in live_issues:
                print(f"  ✗ {i}")
        else:
            print(f"  ✓ {len(LIVE_PATHS)} rutas live OK")

    print(f"\n{'═' * 40}")
    if issues:
        print(f"FAIL — {len(issues)} issue(s)")
        return 1
    print("PASS — circuito end-to-end OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())