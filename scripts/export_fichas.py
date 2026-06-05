#!/usr/bin/env python3
"""
export_fichas.py
────────────────────────────────────────────────────────────────────────────────
Pipeline Obsidian → casos.json

Lee fichas Markdown del vault, extrae YAML frontmatter,
valida el schema y merge a data/casos.json.

También genera data/grafo-nodos.json y data/grafo-edges.json
para alimentar fieldPhysics.js (magnetismo) y socialField.js (entropía).

Uso:
    python3 scripts/export_fichas.py [--dry-run] [--ficha C05-...]
    python3 scripts/export_fichas.py --all
────────────────────────────────────────────────────────────────────────────────
"""

import json
import sys
import argparse
import hashlib
import re
from pathlib import Path
from datetime import datetime

try:
    import yaml
except ImportError:
    print("Instala PyYAML: pip install pyyaml")
    sys.exit(1)

# ── RUTAS ────────────────────────────────────────────────────────────────────

REPO_ROOT   = Path(__file__).parent.parent
VAULT_DIR   = REPO_ROOT / "vault" / "casos"
DATA_DIR    = REPO_ROOT / "data"
CASOS_JSON  = DATA_DIR / "casos.json"
NODOS_JSON  = DATA_DIR / "grafo-nodos.json"
EDGES_JSON  = DATA_DIR / "grafo-edges.json"

# ── VALIDACIÓN ───────────────────────────────────────────────────────────────

REQUIRED_FIELDS = [
    "id", "titulo", "anio", "estado",
    "actores", "instituciones",
    "etica_titulo", "etica_descripcion",
    "institucional_titulo", "institucional_descripcion",
    "material_titulo", "material_descripcion",
    "friccion_tipo", "friccion_intensidad", "friccion_descripcion",
    "nodos",
]

ESTADOS_VALIDOS = {"borrador", "en-proceso", "publicable", "archivado"}
TIPOS_FRICCION  = {"politica", "economica", "juridica", "simbolica"}
CAPAS_VALIDAS   = {"etica", "institucional", "material"}
TIPOS_NODO      = {"actor", "dispositivo", "norma", "territorio", "evento"}


def validar_ficha(fm: dict, path: Path) -> list[str]:
    errores = []

    for campo in REQUIRED_FIELDS:
        if campo not in fm or fm[campo] in (None, "", [], {}):
            errores.append(f"  FALTA: {campo}")

    if fm.get("estado") not in ESTADOS_VALIDOS:
        errores.append(f"  estado inválido: {fm.get('estado')} → {ESTADOS_VALIDOS}")

    if fm.get("friccion_tipo") not in TIPOS_FRICCION:
        errores.append(f"  friccion_tipo inválido: {fm.get('friccion_tipo')}")

    intensidad = fm.get("friccion_intensidad", -1)
    if not (0.0 <= float(intensidad) <= 1.0):
        errores.append(f"  friccion_intensidad fuera de rango: {intensidad}")

    for i, nodo in enumerate(fm.get("nodos", [])):
        if nodo.get("capa") not in CAPAS_VALIDAS:
            errores.append(f"  nodo[{i}].capa inválida: {nodo.get('capa')}")
        if nodo.get("tipo") not in TIPOS_NODO:
            errores.append(f"  nodo[{i}].tipo inválido: {nodo.get('tipo')}")
        pf = nodo.get("peso_friccion", -1)
        if not (0.0 <= float(pf) <= 1.0):
            errores.append(f"  nodo[{i}].peso_friccion fuera de rango: {pf}")

    return errores


# ── PARSEO DE FRONTMATTER ─────────────────────────────────────────────────────

def parse_frontmatter(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n(.*)", text, re.DOTALL)
    if not match:
        raise ValueError(f"No se encontró frontmatter YAML en {path.name}")
    fm = yaml.safe_load(match.group(1))
    body = match.group(2)
    return fm, body


# ── CONVERSIÓN A SCHEMA casos.json ───────────────────────────────────────────

def fm_to_caso(fm: dict, body: str) -> dict:
    def kw(campo: str) -> list:
        return fm.get(campo) or []

    caso = {
        "id": fm["id"],
        "titulo": fm["titulo"],
        "anio": fm["anio"],
        "actores": kw("actores"),
        "instituciones": kw("instituciones"),
        "etica": {
            "titulo": fm.get("etica_titulo", ""),
            "descripcion": fm.get("etica_descripcion", ""),
            "voces": kw("etica_voces"),
            "documentos_ref": kw("etica_documentos_ref"),
            "keywords": kw("etica_keywords"),
            "color": fm.get("etica_color", "#c8a96e"),
        },
        "institucional": {
            "titulo": fm.get("institucional_titulo", ""),
            "descripcion": fm.get("institucional_descripcion", ""),
            "documentos": kw("institucional_documentos"),
            "clasificaciones": kw("institucional_clasificaciones"),
            "keywords": kw("institucional_keywords"),
            "color": fm.get("institucional_color", "#4a7fa5"),
        },
        "material": {
            "titulo": fm.get("material_titulo", ""),
            "descripcion": fm.get("material_descripcion", ""),
            "evidencias": kw("material_evidencias"),
            "keywords": kw("material_keywords"),
            "color": fm.get("material_color", "#7a9e6e"),
        },
        "friccion": {
            "tipo": fm.get("friccion_tipo", ""),
            "subtipo": fm.get("friccion_subtipo", ""),
            "intensidad": float(fm.get("friccion_intensidad", 0.5)),
            "estado": fm.get("friccion_estado", "abierta"),
            "descripcion": fm.get("friccion_descripcion", ""),
            "tension_central": fm.get("friccion_tension_central", ""),
            "sin_resolver": fm.get("friccion_sin_resolver", True),
        },
        "conexiones": kw("conexiones"),
        "tags": kw("tags"),
        "nodos": [],
        "_vault_estado": fm.get("estado", "borrador"),
        "_vault_fuentes_primarias": kw("fuentes_primarias"),
        "_vault_fuentes_secundarias": kw("fuentes_secundarias"),
        "_vault_hash": hashlib.sha256(body.encode()).hexdigest()[:12],
        "_vault_exportado": datetime.now().isoformat(),
    }

    for nodo in fm.get("nodos", []):
        caso["nodos"].append({
            "id": nodo["id"],
            "capa": nodo.get("capa", ""),
            "tipo": nodo.get("tipo", ""),
            "peso_friccion": float(nodo.get("peso_friccion", 0.5)),
            "fuente_id": nodo.get("fuente_id", ""),
            "fecha_evidencia": nodo.get("fecha_evidencia", ""),
            "descripcion": nodo.get("descripcion", ""),
            # Campos extra para los grafos de entropía/magnetismo
            "_entropia_calor": float(nodo.get("entropia_calor", 0.5)),
            "_masa_poder": float(nodo.get("masa_poder", 0.5)),
        })

    return caso


# ── GENERACIÓN DE GRAFO APLANADO ─────────────────────────────────────────────

def generar_grafo(casos_data: dict) -> tuple[list, list]:
    """
    Extrae todos los nodos y relaciones de todos los casos
    para alimentar fieldPhysics.js y socialField.js directamente.
    """
    nodos_flat = []
    edges_flat = []
    nodos_vistos = set()

    for caso in casos_data["casos"]:
        caso_id = caso["id"]
        for nodo in caso.get("nodos", []):
            if nodo["id"] not in nodos_vistos:
                nodos_vistos.add(nodo["id"])
                nodos_flat.append({
                    "id": nodo["id"],
                    "caso_id": caso_id,
                    "capa": nodo.get("capa", ""),
                    "tipo": nodo.get("tipo", ""),
                    # magnetismo (fieldPhysics): carga coulombiana
                    "carga": nodo.get("peso_friccion", 0.5),
                    # entropía (socialField): calor y masa de poder
                    "calor": nodo.get("_entropia_calor", 0.5),
                    "masa_poder": nodo.get("_masa_poder", 0.5),
                    "descripcion": nodo.get("descripcion", ""),
                })

        # Nodo-caso como agregador
        if caso_id not in nodos_vistos:
            nodos_vistos.add(caso_id)
            nodos_flat.append({
                "id": caso_id,
                "caso_id": caso_id,
                "capa": "caso",
                "tipo": "caso",
                "carga": caso.get("friccion", {}).get("intensidad", 0.5),
                "calor": caso.get("friccion", {}).get("intensidad", 0.5) * 0.8,
                "masa_poder": 0.6,
                "descripcion": caso.get("titulo", ""),
            })

        # Relaciones declaradas en frontmatter vault
        for rel in caso.get("_relaciones", []):
            edges_flat.append({
                "source": rel["source"],
                "target": rel["target"],
                "tipo": rel.get("tipo", "relaciona"),
                "peso": float(rel.get("peso", 0.5)),
                "friccion": float(rel.get("friccion", 0.5)),
                "descripcion": rel.get("descripcion", ""),
                "caso_id": caso_id,
            })

        # Edges automáticos: cada nodo → nodo-caso
        for nodo in caso.get("nodos", []):
            edges_flat.append({
                "source": nodo["id"],
                "target": caso_id,
                "tipo": "pertenece",
                "peso": nodo.get("peso_friccion", 0.5),
                "friccion": nodo.get("peso_friccion", 0.5),
                "descripcion": "",
                "caso_id": caso_id,
            })

        # Conexiones entre casos
        for conn in caso.get("conexiones", []):
            edges_flat.append({
                "source": caso_id,
                "target": conn,
                "tipo": "conecta",
                "peso": 0.6,
                "friccion": caso.get("friccion", {}).get("intensidad", 0.5),
                "descripcion": "",
                "caso_id": caso_id,
            })

    return nodos_flat, edges_flat


# ── MERGE CON casos.json EXISTENTE ───────────────────────────────────────────

def merge_caso(casos_data: dict, nuevo_caso: dict, fm: dict) -> dict:
    casos = casos_data.get("casos", [])
    idx = next((i for i, c in enumerate(casos) if c["id"] == nuevo_caso["id"]), None)

    # Pasar relaciones del vault al caso (campo privado _relaciones)
    nuevo_caso["_relaciones"] = fm.get("relaciones", [])

    if idx is not None:
        casos[idx] = nuevo_caso
        print(f"  ✏️  Actualizado: {nuevo_caso['id']}")
    else:
        casos.append(nuevo_caso)
        print(f"  ➕  Agregado: {nuevo_caso['id']}")

    casos_data["casos"] = casos
    return casos_data


# ── MAIN ─────────────────────────────────────────────────────────────────────

def procesar_ficha(path: Path, casos_data: dict, dry_run: bool) -> dict:
    print(f"\n📄 {path.name}")

    fm, body = parse_frontmatter(path)
    errores = validar_ficha(fm, path)

    if errores:
        print(f"  ❌ Errores de validación:")
        for e in errores:
            print(e)
        if fm.get("estado") == "publicable":
            print("  ⛔ Estado 'publicable' con errores — abortando esta ficha.")
            return casos_data
        print("  ⚠️  Continuando en modo borrador...")

    caso = fm_to_caso(fm, body)

    if dry_run:
        print(f"  🔍 [DRY RUN] Se generaría: {caso['id']}")
        print(f"     Nodos: {len(caso['nodos'])}")
        print(f"     Fricción: {caso['friccion']['intensidad']}")
        return casos_data

    return merge_caso(casos_data, caso, fm)


def main():
    parser = argparse.ArgumentParser(description="Export vault fichas → casos.json")
    parser.add_argument("--dry-run", action="store_true", help="Validar sin escribir")
    parser.add_argument("--ficha", type=str, help="Exportar solo esta ficha (ej: C05-michillanca)")
    parser.add_argument("--all", action="store_true", help="Exportar todas las fichas")
    args = parser.parse_args()

    if not CASOS_JSON.exists():
        print(f"❌ No encontré {CASOS_JSON}")
        sys.exit(1)

    with open(CASOS_JSON, encoding="utf-8") as f:
        casos_data = json.load(f)

    if args.ficha:
        paths = list(VAULT_DIR.glob(f"{args.ficha}*.md"))
        if not paths:
            print(f"❌ No encontré ficha: {args.ficha}")
            sys.exit(1)
    elif args.all:
        paths = sorted(VAULT_DIR.glob("*.md"))
        paths = [p for p in paths if not p.name.startswith("_")]
    else:
        parser.print_help()
        sys.exit(0)

    print(f"\n{'='*60}")
    print(f"Export Fichas → casos.json")
    print(f"{'='*60}")
    print(f"Fichas a procesar: {len(paths)}")
    print(f"Modo: {'DRY RUN' if args.dry_run else 'ESCRITURA'}")

    for path in paths:
        try:
            casos_data = procesar_ficha(path, casos_data, args.dry_run)
        except Exception as e:
            print(f"  💥 Error en {path.name}: {e}")

    if not args.dry_run:
        # Guardar casos.json
        with open(CASOS_JSON, "w", encoding="utf-8") as f:
            json.dump(casos_data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ {CASOS_JSON.name} actualizado")

        # Generar grafo aplanado para fieldPhysics + socialField
        nodos, edges = generar_grafo(casos_data)
        with open(NODOS_JSON, "w", encoding="utf-8") as f:
            json.dump(nodos, f, ensure_ascii=False, indent=2)
        with open(EDGES_JSON, "w", encoding="utf-8") as f:
            json.dump(edges, f, ensure_ascii=False, indent=2)
        print(f"✅ grafo-nodos.json: {len(nodos)} nodos")
        print(f"✅ grafo-edges.json: {len(edges)} edges")
    else:
        print(f"\n🔍 DRY RUN completado — no se escribió nada")

    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
