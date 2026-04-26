/**
 * GraphCanvas.tsx
 * Componente React que contiene el SVG del grafo de fricción.
 * El rendering SVG es 100% imperativo (useForceGraph hook).
 * React solo gestiona el ciclo de vida del canvas.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useForceGraph } from '../../hooks/useForceGraph';
import type { GraphNode, GraphLink, LayerType, FrictionType } from '../../types/casos';

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  activeLayer: LayerType;
  activeFrictionType: FrictionType | 'all';
  onNodeClick: (node: GraphNode) => void;
  onNodeHover: (node: GraphNode | null) => void;
}

export function GraphCanvas({ nodes, links, activeLayer, activeFrictionType, onNodeClick, onNodeHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useStateRef(800);
  const [height, setHeight] = useStateRef(600);

  const { init, stopLoop, setActiveLayer, setFrictionType, handleMouseMove, handleClick, reheat } =
    useForceGraph(svgRef as React.RefObject<SVGSVGElement | null>, {
      nodes,
      links,
      width: width.current,
      height: height.current,
      onNodeClick,
      onNodeHover,
    });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width || 800);
        setHeight(entry.contentRect.height || 600);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [setWidth, setHeight]);

  // Init on mount / nodes change
  useEffect(() => {
    if (nodes.length > 0) init();
    return () => stopLoop();
  }, [nodes, links, init, stopLoop]);

  // Sync filters
  useEffect(() => { setActiveLayer(activeLayer); }, [activeLayer, setActiveLayer]);
  useEffect(() => { setFrictionType(activeFrictionType); }, [activeFrictionType, setFrictionType]);

  // Event listeners
  const svgEl = svgRef.current;
  useEffect(() => {
    if (!svgEl) return;
    svgEl.addEventListener('mousemove', handleMouseMove);
    svgEl.addEventListener('click', handleClick);
    return () => {
      svgEl.removeEventListener('mousemove', handleMouseMove);
      svgEl.removeEventListener('click', handleClick);
    };
  }, [svgEl, handleMouseMove, handleClick]);

  // Keyboard: Enter on focused SVG reheats
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === 'Enter') reheat(); },
    [reheat]
  );

  return (
    <div
      ref={containerRef}
      className="ca-graph-canvas"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg
        ref={svgRef}
        width={width.current}
        height={height.current}
        viewBox={`0 0 ${width.current} ${height.current}`}
        aria-label="Grafo interactivo de casos — Enter para reanimar, click para explorar"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* Legend */}
      <aside className="ca-legend" aria-label="Leyenda del grafo">
        <span className="ca-legend__title">Capas</span>
        <div className="ca-legend__item">
          <div className="ca-legend__dot" style={{ background: '#c8a96e' }} />
          <span>Política</span>
        </div>
        <div className="ca-legend__item">
          <div className="ca-legend__dot" style={{ background: '#4a7fa5' }} />
          <span>Semántica</span>
        </div>
        <div className="ca-legend__item">
          <div className="ca-legend__dot" style={{ background: '#7a9e6e' }} />
          <span>Técnica</span>
        </div>
        <div className="ca-legend__item" style={{ marginTop: '0.5rem' }}>
          <div className="ca-legend__line" />
          <span>Conexión</span>
        </div>
      </aside>
    </div>
  );
}

/** Helper: ref que también actualiza para triggering effects */
function useStateRef<T>(initial: T): [React.RefObject<T>, (v: T) => void] {
  const ref = useRef<T>(initial);
  const set = useCallback((v: T) => { ref.current = v; }, []);
  return [ref, set];
}
