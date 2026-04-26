/**
 * ContraArchivo.tsx
 * Página del grafo de fricción epistemológica.
 * React maneja estado y controles; el rendering del grafo es imperativo (SVG).
 */

import { useState, useEffect, useCallback } from 'react';
import { GraphCanvas } from '../components/graph/GraphCanvas';
import { NodePanel } from '../components/panels/NodePanel';
import { Toolbar } from '../components/graph/Toolbar';
import { buildGraph } from '../engines/frictionEngine';
import type { GraphNode, GraphLink, LayerType, FrictionType } from '../types/casos';
import type { CasosJSON } from '../types/casos';

// Tooltip de hover (preview ligero)
function HoverPreview({ node }: { node: GraphNode | null }) {
  if (!node) return null;
  return (
    <div className="ca-preview" role="status" aria-live="polite" aria-label="Vista previa del caso">
      <strong>{node.titulo}</strong>
      <span className="ca-preview__meta">
        {node.anio} · {node.tipo} · {Math.round(node.intensidad * 100)}% fricción
      </span>
      {node.tension && <em className="ca-preview__tension">{node.tension}</em>}
    </div>
  );
}

export default function ContraArchivo() {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const [activeLayer, setActiveLayer] = useState<LayerType>('all');
  const [activeFrictionType, setActiveFrictionType] = useState<FrictionType | 'all'>('all');
  const [fieldVisible, setFieldVisible] = useState(true);

  // Cargar datos
  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? '/';
    fetch(`${base}data/casos.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CasosJSON>;
      })
      .then((json) => {
        const data = buildGraph(json.casos, window.innerWidth * 0.65, window.innerHeight * 0.8);
        setGraphData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleClosePanel = useCallback(() => setSelectedNode(null), []);

  if (loading) {
    return (
      <main className="ca-loading" id="main" tabIndex={-1}>
        <div className="ca-empty-state">
          <span className="ca-empty-state__icon" aria-hidden="true">⊕</span>
          <p>Cargando grafo de fricción…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ca-loading" id="main" tabIndex={-1}>
        <div className="ca-empty-state" role="alert">
          <span className="ca-empty-state__icon" aria-hidden="true">∅</span>
          <p>El grafo no pudo iniciar.<br />
            <small style={{ opacity: 0.6 }}>{error}</small></p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="ca-graph-main"
      id="main"
      tabIndex={-1}
      aria-label="Grafo de fricción epistemológica — Contra-Archivo"
    >
      {/* Skip link para el grafo */}
      <a href="#ca-graph-canvas" className="vn-skip-link">
        Ir al grafo interactivo
      </a>

      <Toolbar
        activeLayer={activeLayer}
        activeFrictionType={activeFrictionType}
        fieldVisible={fieldVisible}
        onLayerChange={setActiveLayer}
        onFrictionChange={setActiveFrictionType}
        onFieldToggle={setFieldVisible}
      />

      <div className="ca-graph-area">
        <div id="ca-graph-canvas">
          {graphData && (
            <GraphCanvas
              nodes={graphData.nodes}
              links={graphData.links}
              activeLayer={activeLayer}
              activeFrictionType={activeFrictionType}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoveredNode}
            />
          )}

          <HoverPreview node={hoveredNode} />
        </div>

        <NodePanel node={selectedNode} onClose={handleClosePanel} />
      </div>

      {/* Stats */}
      {graphData && (
        <footer className="ca-graph-stats" aria-label="Estadísticas del grafo">
          <span>{graphData.nodes.length} casos</span>
          <span aria-hidden="true">·</span>
          <span>{graphData.links.length} conexiones</span>
          <span aria-hidden="true">·</span>
          <span>
            {graphData.nodes.filter((n) => n.sinResolver).length} sin resolver
          </span>
        </footer>
      )}
    </main>
  );
}
