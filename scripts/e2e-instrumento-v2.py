#!/usr/bin/env python3
"""
e2e-instrumento-v2.py — Validación end-to-end instrumento v2 (Sprint P04)

Uso:
  python3 scripts/e2e-instrumento-v2.py
  python3 scripts/e2e-instrumento-v2.py --serve
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
SRC = ROOT / "src"

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


def check_files_exist() -> None:
    print("\n[1] Assets en disco")
    required = [
        WEB / "contra-archivo-v2.html",
        WEB / "pages/instrumento-boot.js",
        WEB / "lib/graphChunk.js",
        WEB / "lib/corpusStats.js",
        WEB / "lib/dataLoader.js",
        WEB / "components/organisms/thesis-section.js",
        DATA / "casos.json",
    ]
    for p in required:
        if p.exists():
            ok(str(p.relative_to(ROOT)))
        else:
            fail(f"falta {p.relative_to(ROOT)}")


def check_v2_structure() -> None:
    print("\n[2] Estructura contra-archivo-v2.html")
    html = read_text(WEB / "contra-archivo-v2.html")
    checks = [
        ("main landmark", bool(re.search(r'<main[^>]*id=["\']main-content["\']', html, re.I))),
        ("skip link", "skip-link" in html),
        ("instrumento-boot", "instrumento-boot.js" in html),
        ("graphChunk", "graphChunk.js" in html),
        ("corpus stats mount", "ca-instrumento-corpus-stats" in html),
        ("circuito buscador", "buscador.html" in html),
        ("circuito leer", "leer.html" in html),
        ("puente portal", "index.html" in html),
        ("sin casos.json en copy", "casos.json" not in html),
        ("sin d3 eager", "vendor/d3.min.js" not in html),
        ("no redirect", 'http-equiv="refresh"' not in html.lower()),
        ("canonical", 'rel="canonical"' in html),
    ]
    for name, passed in checks:
        (ok if passed else fail)(name)


def check_boot_and_circuit() -> None:
    print("\n[3] Boot y circuito E2E")
    boot = read_text(WEB / "pages/instrumento-boot.js")
    chunk = read_text(WEB / "lib/graphChunk.js")
    bootstrap = read_text(SRC / "graphBootstrap.js")
    renderer = read_text(SRC / "nodeRenderer.js")

    for name, content, needle in [
        ("boot → graphChunk", boot, "CAGraphChunk"),
        ("boot → corpusStats", boot, "ca-instrumento-corpus-stats"),
        ("boot → GraphBootstrap", boot, "GraphBootstrap.boot"),
        ("chunk → bootstrap", chunk, "graphBootstrap.js"),
        ("chunk → socialField", chunk, "socialField.js"),
        ("deep-link ?caso=", bootstrap, "get('caso')"),
        ("panel → buscador", renderer, "buildBuscadorUrl"),
    ]:
        (ok if needle in content else fail)(name)

    journeys = json.loads(read_text(DATA / "qa-journeys.json"))
    j04 = next((j for j in journeys.get("journeys", []) if j.get("id") == "J04"), None)
    if j04 and any(c.get("needle") == "graphChunk.js" for c in j04.get("circuit", [])):
        ok("J04 DT declara circuito graphChunk")
    else:
        fail("J04 sin circuito graphChunk")

    inv = json.loads(read_text(DATA / "ia-inventario.json"))
    p = next((s for s in inv.get("surfaces", []) if s.get("id") == "P_INSTRUMENTO"), None)
    if p and p.get("path") == "contra-archivo-v2.html":
        ok("P_INSTRUMENTO en ia-inventario.json")
    else:
        fail("P_INSTRUMENTO no declarado en ia-inventario")


def fetch(url: str, timeout: float = 8.0) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "vn-e2e-instrumento/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status, res.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except Exception as e:
        return 0, str(e)


def check_http_serve(port: int) -> None:
    print(f"\n[4] Fetch HTTP (localhost:{port})")

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
        "/contra-archivo-v2.html",
        "/pages/instrumento-boot.js",
        "/lib/graphChunk.js",
        "/lib/corpusStats.js",
        "/components/organisms/thesis-section.js",
    ]

    for rel in paths:
        status, _ = fetch(base + rel)
        (ok if status == 200 else fail)(f"GET {rel} → {status}")

    status, html = fetch(base + "/contra-archivo-v2.html")
    if status == 200 and "ca-instrumento-corpus-stats" in html and "graphChunk.js" in html:
        ok("contra-archivo-v2.html sirve Sprint v2")
    elif status == 200:
        fail("contra-archivo-v2.html sin contenido Sprint v2")

    server.shutdown()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--serve", action="store_true", help="Levantar servidor local y hacer fetch")
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()

    print("E2E — Instrumento v2 · Colectivo Viento Norte · Sprint P04")
    check_files_exist()
    check_v2_structure()
    check_boot_and_circuit()

    if args.serve:
        check_http_serve(args.port)

    print("\n── Resumen ──")
    print(f"  Fallos: {len(FAILURES)}")
    print(f"  Warnings: {len(WARNINGS)}")
    if FAILURES:
        for f in FAILURES:
            print(f"    • {f}")
        return 1
    print("  PASS — circuito instrumento v2 OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())