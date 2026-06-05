'use client';

import { useEffect, useRef, useState } from 'react';
import type { GraphNode, GraphEdge } from '@/app/api/corpus/graph-data/route';

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CASO_COLORS: Record<number, string> = {
  1: '#3b82f6', // blue
  2: '#10b981', // emerald
  3: '#f59e0b', // amber
  4: '#8b5cf6', // violet
};

const ESTADO_RADIUS: Record<string, number> = {
  pendiente: 6,
  open: 8,
  axial: 10,
  selective: 12,
  verificado: 14,
};

function runSimulation(nodes: SimNode[], edges: GraphEdge[], width: number, height: number): () => void {
  const cx = width / 2;
  const cy = height / 2;
  let frame: number;

  function tick() {
    // Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1500 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodes.find((n) => n.id === edge.source);
      const b = nodes.find((n) => n.id === edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = 80 * (1 / edge.weight);
      const force = (dist - target) * 0.05;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Gravity toward center
    for (const node of nodes) {
      node.vx += (cx - node.x) * 0.002;
      node.vy += (cy - node.y) * 0.002;

      // Damping
      node.vx *= 0.85;
      node.vy *= 0.85;

      node.x += node.vx;
      node.y += node.vy;

      // Boundary
      const r = ESTADO_RADIUS[node.estadoCodificacion] ?? 8;
      node.x = Math.max(r + 4, Math.min(width - r - 4, node.x));
      node.y = Math.max(r + 4, Math.min(height - r - 4, node.y));
    }

    frame = requestAnimationFrame(tick);
  }

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function ForceGraph({ nodes: rawNodes, edges }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

  // Initialize positions
  useEffect(() => {
    const w = svgRef.current?.clientWidth ?? 800;
    const h = svgRef.current?.clientHeight ?? 500;
    setDims({ w, h });

    const initialized: SimNode[] = rawNodes.map((n, i) => ({
      ...n,
      x: w / 2 + Math.cos((i / rawNodes.length) * Math.PI * 2) * 120,
      y: h / 2 + Math.sin((i / rawNodes.length) * Math.PI * 2) * 120,
      vx: 0,
      vy: 0,
    }));
    setSimNodes(initialized);
  }, [rawNodes]);

  // Run physics simulation
  useEffect(() => {
    if (simNodes.length === 0) return;

    // Snapshot so the simulation mutates in place without triggering re-renders on every tick
    const nodesSnapshot = simNodes;

    let ticks = 0;
    const MAX_TICKS = 300;
    const stop = runSimulation(nodesSnapshot, edges, dims.w, dims.h);

    const interval = setInterval(() => {
      ticks++;
      // Force a re-render every 10 ticks to show animation
      setSimNodes([...nodesSnapshot]);
      if (ticks >= MAX_TICKS) {
        clearInterval(interval);
        stop();
      }
    }, 16);

    return () => {
      clearInterval(interval);
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simNodes.length, edges, dims]);

  const hovered = hoveredId ? simNodes.find((n) => n.id === hoveredId) : null;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        aria-label="Grafo de correlaciones del corpus"
        role="img"
      >
        {/* Edges */}
        {edges.map((e) => {
          const a = simNodes.find((n) => n.id === e.source);
          const b = simNodes.find((n) => n.id === e.target);
          if (!a || !b) return null;
          const isHighlighted = hoveredId === e.source || hoveredId === e.target;
          return (
            <line
              key={`${e.source}-${e.target}`}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              stroke={isHighlighted ? '#6366f1' : '#d1d5db'}
              strokeWidth={isHighlighted ? e.weight * 1.5 : e.weight * 0.8}
              strokeOpacity={isHighlighted ? 0.8 : 0.4}
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const r = ESTADO_RADIUS[node.estadoCodificacion] ?? 8;
          const color = CASO_COLORS[node.casoId] ?? '#6b7280';
          const isHovered = hoveredId === node.id;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
              aria-label={`${node.label} — ${node.estadoCodificacion}`}
            >
              <circle
                r={isHovered ? r + 3 : r}
                fill={color}
                fillOpacity={isHovered ? 1 : 0.8}
                stroke="#fff"
                strokeWidth={isHovered ? 2 : 1}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs shadow-lg max-w-xs pointer-events-none"
          aria-live="polite"
        >
          <p className="font-semibold text-gray-900 dark:text-white truncate">{hovered.label}</p>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{hovered.regimenVerdad} · {hovered.fuenteTipo}</p>
          <p className="text-gray-500 dark:text-gray-400">{hovered.estadoCodificacion}</p>
          {hovered.tags.length > 0 && (
            <p className="text-gray-400 dark:text-gray-500 mt-1 truncate">
              {hovered.tags.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs space-y-1.5">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Casos</p>
        {Object.entries(CASO_COLORS).map(([id, color]) => (
          <div key={id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-600 dark:text-gray-400">Caso {id}</span>
          </div>
        ))}
        <p className="font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">Tamaño = estado GT</p>
        <p className="text-gray-500 dark:text-gray-500">pequeño → open · grande → verificado</p>
      </div>
    </div>
  );
}
