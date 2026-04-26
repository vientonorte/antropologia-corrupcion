/**
 * NodePanel.tsx
 * Panel lateral de detalle de nodo — reemplaza NodeRenderer.js.
 * Expone las 3 capas de verdad sin resolver la contradicción.
 */

import type { GraphNode } from '../../types/casos';

const LAYER_CONFIG = {
  etica: {
    label: 'Capa Ética',
    sublabel: 'Testimonio situado · Cuidado · Contexto vivido',
    icon: '◎',
    color: '#c8a96e',
  },
  institucional: {
    label: 'Capa Institucional',
    sublabel: 'Registro oficial · Clasificación · Distorsión normativa',
    icon: '▣',
    color: '#4a7fa5',
  },
  material: {
    label: 'Capa Material',
    sublabel: 'Territorio · Evidencia · Densidad histórica',
    icon: '◈',
    color: '#7a9e6e',
  },
} as const;

const FRICTION_TYPE_LABELS: Record<string, string> = {
  politica: 'Fricción política — ¿Quién tiene autoridad para definir?',
  semantica: 'Fricción semántica — El mismo término, mundos distintos',
  tecnica: 'Fricción técnica — ¿Qué cuentan los datos y para quién?',
};

interface Props {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodePanel({ node, onClose }: Props) {
  if (!node) return null;

  const intensityPct = Math.round(node.intensidad * 100);
  const frictionLabel = FRICTION_TYPE_LABELS[node.tipo] ?? node.tipo;

  return (
    <aside
      className="ca-panel ca-panel--open"
      aria-label="Detalle del caso — capas de fricción"
      role="complementary"
    >
      <button
        id="ca-panel-close"
        className="ca-panel__close"
        onClick={onClose}
        aria-label="Cerrar panel de detalle"
        type="button"
      >
        ×
      </button>

      {/* Header */}
      <header className="ca-panel__header">
        <div className="ca-panel__eyebrow">
          <span className="ca-panel__anio">{node.anio}</span>
          <span className="ca-panel__estado ca-panel__estado--abierta">{node.estado.toUpperCase()}</span>
        </div>
        <h2 className="ca-panel__title">{node.titulo}</h2>

        {/* Intensidad */}
        <div className="ca-panel__intensity" aria-label={`Intensidad de fricción: ${intensityPct}%`}>
          <div className="ca-panel__intensity-bar">
            <div
              className="ca-panel__intensity-fill"
              style={{ width: `${intensityPct}%`, background: `hsl(${30 - node.intensidad * 30}, 80%, 55%)` }}
            />
          </div>
          <span className="ca-panel__intensity-label">Fricción {intensityPct}%</span>
        </div>

        <p className="ca-panel__friction-type">{frictionLabel}</p>

        {node.tension && (
          <blockquote className="ca-panel__tension">
            &ldquo;{node.tension}&rdquo;
          </blockquote>
        )}
      </header>

      {/* Tags */}
      {node.tags.length > 0 && (
        <div className="ca-panel__tags">
          {node.tags.map((tag) => (
            <span key={tag} className="ca-panel__tag">{tag}</span>
          ))}
        </div>
      )}

      {/* 3 capas */}
      {(['etica', 'institucional', 'material'] as const).map((layerKey) => {
        const cfg = LAYER_CONFIG[layerKey];
        const layer = node[layerKey];
        if (!layer) return null;

        return (
          <section
            key={layerKey}
            className={`ca-layer ca-layer--${layerKey}`}
            aria-label={cfg.label}
            style={{ borderColor: cfg.color }}
          >
            <header className="ca-layer__header">
              <span className="ca-layer__icon" aria-hidden="true">{cfg.icon}</span>
              <div>
                <h3 className="ca-layer__title" style={{ color: cfg.color }}>{cfg.label}</h3>
                <p className="ca-layer__sublabel">{cfg.sublabel}</p>
              </div>
            </header>

            <h4 className="ca-layer__caso-title">{layer.titulo}</h4>
            <p className="ca-layer__desc">{layer.descripcion}</p>

            {layer.voces && layer.voces.length > 0 && (
              <div className="ca-layer__voces">
                <span className="ca-layer__voces-label">Voces</span>
                <ul>
                  {layer.voces.map((v, i) => (
                    <li key={i}>&ldquo;{v}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            {layer.keywords.length > 0 && (
              <div className="ca-layer__keywords">
                {layer.keywords.map((kw) => (
                  <span key={kw} className="ca-layer__kw" style={{ borderColor: cfg.color }}>{kw}</span>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Marcadores de fricción */}
      {node.marcadores.length > 0 && (
        <section className="ca-panel__markers" aria-label="Marcadores de fricción">
          <h3 className="ca-panel__markers-title">Tensiones detectadas</h3>
          <ul>
            {node.marcadores.slice(0, 5).map((m, i) => (
              <li key={i} className="ca-panel__marker">{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Audit */}
      <details className="ca-panel__audit">
        <summary>Auditoría del motor de fricción</summary>
        <dl>
          <dt>Fuente</dt>
          <dd>{node.audit.source === 'json' ? 'Declarada en JSON' : 'Calculada por engine'}</dd>
          <dt>Intensidad calculada</dt>
          <dd>{(node.audit.calculatedIntensity * 100).toFixed(1)}%</dd>
          {node.audit.source === 'json' && (
            <>
              <dt>Intensidad declarada</dt>
              <dd>{((node.audit.explicitIntensity ?? 0) * 100).toFixed(1)}%</dd>
              <dt>Delta</dt>
              <dd>{(node.audit.deltaFromCalculated * 100).toFixed(1)}%</dd>
            </>
          )}
        </dl>
      </details>
    </aside>
  );
}
