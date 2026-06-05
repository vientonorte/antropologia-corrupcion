#!/usr/bin/env python3
"""
Diccionario Maestro Fase 1 — Sanitización Contra-Archivo
NO expone contenido a APIs externas. Procesamiento 100% local.

Genera mapping consistente nombre_real → token a partir del inventario
de Fase 0 y de una lista manual de entidades a proteger.

Uso:
  cd ~/Documents/GitHub/antropologia-corrupcion/sanitization-toolkit
  source venv/bin/activate
  python dictionary_phase_1.py ./inventario.csv ./diccionario_maestro.json
"""
import csv, json, sys, hashlib
from datetime import datetime
from pathlib import Path

# ENTIDADES A PROTEGER · editar antes de correr
# Formato: nombre_real, tipo, token_prefix
# Tipos sugeridos: PERSON, ORG, LOCATION, EVENT, FUENTE_ANONIMA
ENTITIES = [
    # Persona pública / autor
    ('Rodrigo Gaete Gaona', 'PERSON', 'PER'),
    ('Rodrigo Gaete', 'PERSON', 'PER'),
    ('Rö', 'PERSON', 'PER'),

    # Red de coproducción
    ('Andrés Rojas Gaona', 'PERSON', 'PER'),
    ('A.R.G.', 'PERSON', 'PER'),

    # Familia (anonimizar fuerte)
    ('Camila', 'PERSON', 'FAM'),
    # ('[nombre hermano]', 'PERSON', 'FAM'),
    # ('[nombre primo]', 'PERSON', 'FAM'),
    # ('[nombre abuela]', 'PERSON', 'FAM'),
    # ('[nombre abuelo]', 'PERSON', 'FAM'),

    # Profesionales del cuidado
    ('Anakaren', 'PERSON', 'CUID'),
    # ('[nombre psiquiatra]', 'PERSON', 'CUID'),

    # Figuras públicas (verificables, anonimización opcional)
    ('Mónica González', 'PERSON', 'PUB'),
    ('Harald Beyer', 'PERSON', 'PUB'),
    ('Raúl Astudillo', 'PERSON', 'PUB'),
    ('Lucio Jiménez', 'PERSON', 'PUB'),
    ('Juan Pablo Jiménez', 'PERSON', 'PUB'),
    ('Camilo Catrillanca', 'PERSON', 'PUB'),
    ('Macarena Valdés', 'PERSON', 'PUB'),
    ('Rodrigo Cisternas', 'PERSON', 'PUB'),
    ('Ángel Maulén', 'PERSON', 'PUB'),
    ('Vivien Spitzer', 'PERSON', 'PUB'),

    # Fuentes vivas protegidas
    ('La Negra Colorada', 'FUENTE_ANONIMA', 'FNT'),
    # AGREGAR fuentes con pseudónimo o nombre real

    # Organizaciones
    ('CIPER', 'ORG', 'ORG'),
    ('CIPER Chile', 'ORG', 'ORG'),
    ('CEAC Valdivia', 'ORG', 'ORG'),
    ('Centro de Estudios Antropológicos Comunitarios de Valdivia', 'ORG', 'ORG'),
    ('Universidad Austral de Chile', 'ORG', 'ORG'),
    ('UACh', 'ORG', 'ORG'),
    ('ARCOS', 'ORG', 'ORG'),
    ('ARCIS', 'ORG', 'ORG'),
    ('Universidad Privada de Valdivia', 'ORG', 'ORG'),
    ('UPV', 'ORG', 'ORG'),
    ('Liceo Lenka Franulić', 'ORG', 'ORG'),
    ('SURA Investments', 'ORG', 'ORG'),
    ('SURA', 'ORG', 'ORG'),
    ('MODATIMA', 'ORG', 'ORG'),
    ('INDH', 'ORG', 'ORG'),
    ('Weichan Auka Mapu', 'ORG', 'ORG'),
    ('WAM', 'ORG', 'ORG'),
    ('Coordinadora Arauco-Malleco', 'ORG', 'ORG'),
    ('CAM', 'ORG', 'ORG'),
    ('Bosques Arauco', 'ORG', 'ORG'),
    ('Celulosa Arauco', 'ORG', 'ORG'),

    # Ubicaciones sensibles
    ('Antofagasta', 'LOCATION', 'LOC'),
    ('Valdivia', 'LOCATION', 'LOC'),
    ('Temucuicui', 'LOCATION', 'LOC'),
    ('Tranguil', 'LOCATION', 'LOC'),
    ('Panguipulli', 'LOCATION', 'LOC'),
    ('Petorca', 'LOCATION', 'LOC'),
    ('Curanilahue', 'LOCATION', 'LOC'),
    ('Ercilla', 'LOCATION', 'LOC'),
    ('Maipú', 'LOCATION', 'LOC'),
    ('Ñuñoa', 'LOCATION', 'LOC'),

    # Eventos
    ('Estallido social 2019', 'EVENT', 'EVT'),
    ('Acusación constitucional Beyer', 'EVENT', 'EVT'),
]


def generate_token(entity_name, entity_type, prefix, counter):
    """Genera token estable: PREFIX-NNN."""
    return f'{prefix}-{counter:03d}'


def build_dictionary(entities):
    """Construye dos diccionarios: real→token y token→real."""
    real_to_token = {}
    token_to_real = {}
    type_counters = {}

    for name, etype, prefix in entities:
        type_counters[prefix] = type_counters.get(prefix, 0) + 1
        token = generate_token(name, etype, prefix, type_counters[prefix])
        real_to_token[name] = {
            'token': token,
            'type': etype,
            'occurrences': 0,
            'sha256': hashlib.sha256(name.encode('utf-8')).hexdigest()[:16],
        }
        token_to_real[token] = {
            'real': name,
            'type': etype,
            'sha256': hashlib.sha256(name.encode('utf-8')).hexdigest()[:16],
        }
    return real_to_token, token_to_real


def count_occurrences_in_inventory(real_to_token, inventory_csv):
    """Lee inventory.csv (campo path solamente, no contenido) y proyecta
    cuántos archivos pueden contener cada entidad. No abre archivos.
    """
    path = Path(inventory_csv).expanduser().resolve()
    if not path.exists():
        print(f'Inventario no encontrado en {path}. Continuando sin proyección.')
        return real_to_token
    # No expone contenido — solo cuenta filas con name_known > 0
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    total_files_with_pii = sum(1 for r in rows if int(r.get('name_known', 0)) > 0)
    for name in real_to_token:
        real_to_token[name]['occurrences'] = -1  # placeholder, calcular en Fase 2
    return real_to_token


def write_dictionary(real_to_token, token_to_real, output):
    payload = {
        'metadata': {
            'version': 'V1',
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'total_entities': len(real_to_token),
            'manejo': 'CONFIDENCIAL · cifrar antes de almacenar fuera de Mac local',
        },
        'real_to_token': real_to_token,
        'token_to_real': token_to_real,
    }
    with open(output, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def main(inventory_csv, output_json):
    real_to_token, token_to_real = build_dictionary(ENTITIES)
    real_to_token = count_occurrences_in_inventory(real_to_token, inventory_csv)
    write_dictionary(real_to_token, token_to_real, output_json)

    # Resumen sin exponer nombres
    print(f'\nDICCIONARIO MAESTRO GENERADO')
    print(f'  Total entidades: {len(real_to_token)}')
    by_type = {}
    for entry in real_to_token.values():
        by_type[entry['type']] = by_type.get(entry['type'], 0) + 1
    for k, v in sorted(by_type.items()):
        print(f'  {k}: {v}')
    print(f'\nOutput: {output_json}')
    print('\nIMPORTANTE · pasos siguientes obligatorios:')
    print('1. Cifrar diccionario_maestro.json con GPG inmediatamente:')
    print('     gpg -c --cipher-algo AES256 diccionario_maestro.json')
    print('     rm diccionario_maestro.json   # eliminar versión sin cifrar')
    print('2. Hacer backup del .gpg en disco externo cifrado, NO en iCloud.')
    print('3. Generar fragmentos Shamir 2-de-3 cuando estés listo:')
    print('     ssss-split -t 2 -n 3 < diccionario_maestro.json.gpg')
    print('     (instalar con: brew install ssss)')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Uso: python dictionary_phase_1.py <inventario.csv> <output.json>')
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
