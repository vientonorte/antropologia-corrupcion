/**
 * useForceGraph.ts
 * Hook React que orquesta ForceSimulation + rendering SVG/Canvas.
 * React nunca toca el canvas directamente — todo pasa por refs imperativos.
 */

import { useRef, useCallback, useEffect } from 'react';
import { ForceSimulation } from '../engines/forceSimulation';
import type { GraphNode, GraphLink, LayerType, FrictionType } from '../types/casos';

const FRICTION_COLORS: Record<string, string> = {
  politica: '#c8a96e',
  semantica: '#4a7fa5',
  tecnica: '#7a9e6e',
};

function nodeRadius(node: GraphNode): number {
  return 6 + node.intensidad * 14;
}

function nodeColor(node: GraphNode): string {
  return FRICTION_COLORS[node.tipo] ?? '#888';
}

interface UseForceGraphOptions {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

export function useForceGraph(svgRef: React.RefObject<SVGSVGElement | null>, opts: UseForceGraphOptions) {
  const simRef = useRef<ForceSimulation | null>(null);
  const rafRef = useRef<number | null>(null);
  const hoveredRef = useRef<GraphNode | null>(null);
  const activeLayerRef = useRef<LayerType>('all');
  const activeFrictionRef = useRef<FrictionType | 'all'>('all');

  // ── Rendering ────────────────────────────────────────────
  const render = useCallback(() => {
    const svg = svgRef.current;
    const sim = simRef.current;
    if (!svg || !sim) return;

    const activeLayer = activeLayerRef.current;
    const activeFriction = activeFrictionRef.current;

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const ns = 'http://www.w3.org/2000/svg';

    // Draw links
    for (const link of sim.links) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(link.source.x));
      line.setAttribute('y1', String(link.source.y));
      line.setAttribute('x2', String(link.target.x));
      line.setAttribute('y2', String(link.target.y));

      const dimSrc = link.source._dimmed;
      const dimTgt = link.target._dimmed;
      const dimmed = dimSrc || dimTgt;

      line.setAttribute('stroke', dimmed ? 'rgba(255,255,255,0.04)' : `rgba(200,169,110,${link.weight * 0.4})`);
      line.setAttribute('stroke-width', dimmed ? '0.5' : String(link.weight * 2.5));
      svg.appendChild(line);
    }

    // Draw nodes
    for (const node of sim.nodes) {
      const dimByLayer =
        activeLayer !== 'all' && !node[activeLayer as keyof GraphNode];
      const dimByFriction =
        activeFriction !== 'all' && node.tipo !== activeFriction;
      const dimmed = dimByLayer || dimByFriction;
      const isHovered = hoveredRef.current?.id === node.id;

      const r = nodeRadius(node);
      const color = nodeColor(node);

      // Glow ring for high intensity
      if (node.intensidad > 0.7 && !dimmed) {
        const glow = document.createElementNS(ns, 'circle');
        glow.setAttribute('cx', String(node.x));
        glow.setAttribute('cy', String(node.y));
        glow.setAttribute('r', String(r + 4));
        glow.setAttribute('fill', `${color}22`);
        glow.setAttribute('stroke', `${color}44`);
        glow.setAttribute('stroke-width', '1');
        svg.appendChild(glow);
      }

      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', String(node.x));
      circle.setAttribute('cy', String(node.y));
      circle.setAttribute('r', String(isHovered ? r + 3 : r));
      circle.setAttribute('fill', dimmed ? 'rgba(80,80,80,0.3)' : color);
      circle.setAttribute('fill-opacity', dimmed ? '0.25' : '0.9');
      circle.setAttribute('stroke', isHovered ? '#fff' : dimmed ? 'transparent' : `${color}cc`);
      circle.setAttribute('stroke-width', isHovered ? '2' : '1');
      circle.setAttribute('data-id', node.id);
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `Caso: ${node.titulo}`);
      svg.appendChild(circle);

      // Label (solo visible nodes / hover)
      if (!dimmed || isHovered) {
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', String(node.x));
        label.setAttribute('y', String(node.y + r + 14));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', isHovered ? '11' : '9');
        label.setAttribute('fill', dimmed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)');
        label.setAttribute('font-family', 'var(--font-mono, monospace)');
        label.setAttribute('pointer-events', 'none');
        label.textContent = node.titulo.slice(0, 22) + (node.titulo.length > 22 ? '…' : '');
        svg.appendChild(label);
      }
    }
  }, [svgRef]);

  // ── Animation loop ────────────────────────────────────────
  const startLoop = useCallback(() => {
    const loop = () => {
      const sim = simRef.current;
      if (!sim) return;
      sim.tick();
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [render]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── Init simulation ───────────────────────────────────────
  const init = useCallback(() => {
    stopLoop();
    if (!opts.nodes.length) return;

    const sim = new ForceSimulation(
      opts.nodes.map((n) => ({ ...n })),
      opts.links,
      opts.width,
      opts.height
    );
    sim.warmup(80);
    simRef.current = sim;
    startLoop();
  }, [opts.nodes, opts.links, opts.width, opts.height, startLoop, stopLoop]);

  // ── Mouse / touch interaction ─────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const svg = svgRef.current;
      const sim = simRef.current;
      if (!svg || !sim) return;

      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: GraphNode | null = null;
      for (const node of sim.nodes) {
        const r = nodeRadius(node) + 4;
        const dx = node.x - mx;
        const dy = node.y - my;
        if (dx * dx + dy * dy < r * r) {
          found = node;
          break;
        }
      }

      hoveredRef.current = found;
      opts.onNodeHover?.(found);
    },
    [svgRef, opts]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const svg = svgRef.current;
      const sim = simRef.current;
      if (!svg || !sim) return;

      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of sim.nodes) {
        const r = nodeRadius(node) + 4;
        const dx = node.x - mx;
        const dy = node.y - my;
        if (dx * dx + dy * dy < r * r) {
          opts.onNodeClick?.(node);
          return;
        }
      }
    },
    [svgRef, opts]
  );

  // ── Public API ────────────────────────────────────────────
  const setActiveLayer = useCallback((layer: LayerType) => {
    activeLayerRef.current = layer;
  }, []);

  const setFrictionType = useCallback((tipo: FrictionType | 'all') => {
    activeFrictionRef.current = tipo;
  }, []);

  const reheat = useCallback(() => {
    simRef.current?.reheat(0.3);
  }, []);

  return { init, stopLoop, setActiveLayer, setFrictionType, reheat, handleMouseMove, handleClick };
}
