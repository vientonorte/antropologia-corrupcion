#!/usr/bin/env python3
"""
e2e-home-public.py — Validación end-to-end del inicio público (Sprint P01)

Uso:
  python3 scripts/e2e-home-public.py
  python3 scripts/e2e-home-public.py --serve   # levanta servidor y hace fetch HTTP
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
DATA = ROOT / "data"

FAILURES: list[str] = []
WARNINGS: list[str] = []


def ok(msg: str) -> None:
    print(f"  ✓ {msg}")


def fail(msg: str) -> None:
    FAILURES.append(msg)
    print(f"  ✗ {msg}")


def warn(msg: str) -> None:
    WARNINGS.append(msg)
    print(f"  ⚠ {msg}")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def check_files_exist() -> None:
    print("\n[1] Assets en disco")
    required = [
        WEB / "index.html",
        WEB / "components/molecules/hero-entry-paths.js",
        WEB / "components/organisms/friction-demo.js",
        WEB / "lib/corpusStats.js",
        WEB / "styles/molecules/hero-entry-paths.css",
        WEB / "styles/organisms/friction-demo.css",
        DATA / "fuentes-oficiales.json",
        DATA / "casos.json",
        DATA / "fuentes-config.json",
        DATA / "archivo-index.json",
        DATA / "narrativa-rescatada.json",
    ]
    for p in required:
        if p.exists():
            ok(str(p.relative_to(ROOT)))
        else:
            fail(f"falta {p.relative_to(ROOT)}")


def check_index_structure() -> None:
    print("\n[2] Estructura index.html")
    html = read_text(WEB / "index.html")
    checks = [
        ("main landmark", bool(re.search(r'<main[^>]*id=["\']main-content["\']', html, re.I))),
        ("H1 Contra-archivo", "Contra-archivo" in html),
        ("sin ¿Quién es?", "¿Quién es?" not in html),
        ("3 rutas mount", "ca-hero-entry-paths" in html),
        ("demo mount", "ca-friction-demo" in html),
        ("stats mount", "ca-corpus-stats" in html),
        ("resultados preliminares", "Resultados preliminares" in html),
        ("sin archivo-index.json en copy", "archivo-index.json" not in html),
        ("friction-demo.js", "friction-demo.js" in html),
        ("hero-entry-paths.js", "hero-entry-paths.js" in html),
    ]
    for name, passed in checks:
        (ok if passed else fail)(name)


def check_corpus_integrity() -> None:
    print("\n[3] Integridad corpus")
    fuentes_raw = load_json(DATA / "fuentes-oficiales.json")
    registros = fuentes_raw if isinstance(fuentes_raw, list) else fuentes_raw.get("registros", [])
    bcn = load_json(DATA / "bcn-legislativo.json")
    casos_data = load_json(DATA / "casos.json")
    casos = casos_data.get("casos", casos_data)
    config = load_json(DATA / "fuentes-config.json")

    total = len(registros) + len(bcn.get("boletines", bcn.get("registros", [])))
    if total >= 30:
        ok(f"{total} registros en corpus")
    else:
        fail(f"solo {total} registros (esperado ≥30)")

    by_fuente: dict[str, int] = {}
    for r in registros:
        f = r.get("fuente", "?")
        by_fuente[f] = by_fuente.get(f, 0) + 1

    top = sorted(by_fuente.items(), key=lambda x: -x[1])[:3]
    ok("top fuentes: " + ", ".join(f"{k}({v})" for k, v in top))

    activas = [s for s in config.get("sources", []) if s.get("activa", True)]
    if len(activas) >= 5:
        ok(f"{len(activas)} fuentes activas en config")
    else:
        fail(f"solo {len(activas)} fuentes activas")

    if len(casos) >= 1:
        ok(f"{len(casos)} casos etnográficos")
    else:
        fail("sin casos en casos.json")


def check_circuit_links() -> None:
    print("\n[4] Circuito de enlaces")
    bases = read_text(WEB / "lib/basesConsultadas.js")
    demo = read_text(WEB / "components/organisms/friction-demo.js")
    paths = read_text(WEB / "components/molecules/hero-entry-paths.js")

    for name, content, needle in [
        ("chip → buscador?fuente=", bases, "buscador.html?fuente="),
        ("demo → buscador?q=", demo, "buscador.html?q="),
        ("onboarding → buscador?q=", read_text(WEB / "pages/onboarding-search.js"), "buscador.html?q="),
        ("CTA grafo #tesis", paths, "index.html#tesis"),
        ("CTA leer", paths, "leer.html"),
    ]:
        (ok if needle in content else fail)(name)

    inv = load_json(DATA / "ia-inventario.json")
    p01 = next((s for s in inv.get("surfaces", []) if s.get("id") == "P01"), None)
    if p01 and p01.get("path") == "index.html" and p01.get("canonical"):
        ok("P01 canónico en ia-inventario.json")
    else:
        fail("P01 no declarado canónico en ia-inventario")

    buscador = read_text(WEB / "buscador.html")
    boot = read_text(WEB / "pages/buscador-boot.js")
    avanzado = read_text(WEB / "lib/buscadorAvanzado.js")
    for name, content, needle in [
        ("buscador strip mount", buscador, "ca-buscador-bases-strip"),
        ("buscador stats mount", buscador, "ca-buscador-corpus-stats"),
        ("buscador corpusStats.js", buscador, "corpusStats.js"),
        ("buscador ?q= reader", avanzado, "get('q')"),
    ]:
        (ok if needle in content else fail)(name)
    if "params.huella || params.casoId || params.query" in boot:
        fail("?q= solo no debe forzar huella")
    else:
        ok("?q= no fuerza pestaña huella")


def fetch(url: str, timeout: float = 8.0) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "vn-e2e/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status, res.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except Exception as e:
        return 0, str(e)


def check_http_serve(port: int) -> None:
    print(f"\n[5] Fetch HTTP (localhost:{port})")

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(WEB), **kwargs)

        def log_message(self, fmt, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.3)

    base = f"http://127.0.0.1:{port}"
    paths = [
        "/index.html",
        "/leer.html",
        "/buscador.html",
        "/components/molecules/hero-entry-paths.js",
        "/components/organisms/friction-demo.js",
        "/lib/corpusStats.js",
        "/data/fuentes-oficiales.json",
    ]

    for rel in paths:
        status, body = fetch(base + rel)
        if status == 200:
            ok(f"GET {rel} → 200")
        else:
            # data/ vive en raíz repo, no en web/ — esperado 404 desde web server
            if rel.startswith("/data/"):
                data_path = ROOT / rel.lstrip("/")
                if data_path.exists():
                    warn(f"GET {rel} → {status} (data en raíz, OK en GitHub Pages con rsync)")
                else:
                    fail(f"GET {rel} → {status}")
            else:
                fail(f"GET {rel} → {status}")

    status, html = fetch(base + "/index.html")
    if status == 200 and "ca-friction-demo" in html and "Contra-archivo" in html:
        ok("index.html sirve hero Sprint P01")
    elif status == 200:
        fail("index.html sin contenido Sprint P01")

    server.shutdown()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--serve", action="store_true", help="Levantar servidor local y hacer fetch")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    print("E2E — Inicio público · Colectivo Viento Norte · Sprint P01")
    check_files_exist()
    check_index_structure()
    check_corpus_integrity()
    check_circuit_links()

    if args.serve:
        check_http_serve(args.port)

    print("\n── Resumen ──")
    print(f"  Fallos: {len(FAILURES)}")
    print(f"  Warnings: {len(WARNINGS)}")
    if FAILURES:
        for f in FAILURES:
            print(f"    • {f}")
        return 1
    print("  PASS — circuito E2E OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())