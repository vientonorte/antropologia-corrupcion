/**
 * forceSimulation.ts
 * Port TypeScript de la clase ForceSimulation de graph.js.
 * Fruchterman-Reingold adaptado — zero-DOM, zero-dependency.
 */

import type { GraphNode, GraphLink } from '../types/casos';

export class ForceSimulation {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
  alpha: number;
  alphaDecay: number;
  alphaMin: number;
  velocityDecay: number;
  gravityStrength: number;

  constructor(nodes: GraphNode[], links: GraphLink[], width: number, height: number) {
    this.nodes = nodes;
    this.links = links;
    this.width = width;
    this.height = height;
    this.alpha = 1;
    this.alphaDecay = 0.0228;
    this.alphaMin = 0.001;
    this.velocityDecay = 0.4;
    this.gravityStrength = 0.06;
  }

  /** Avanza la simulación un tick. Devuelve false cuando converge. */
  tick(): boolean {
    if (this.alpha < this.alphaMin) return false;
    this.alpha *= 1 - this.alphaDecay;

    const k = Math.min(
      Math.sqrt((this.width * this.height) / (this.nodes.length || 1)),
      180
    );

    // Fuerza repulsiva entre nodos (Coulomb)
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const ni = this.nodes[i];
        const nj = this.nodes[j];
        const dx = nj.x - ni.x;
        const dy = nj.y - ni.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (k * k) / dist * this.alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        ni.vx -= fx;
        ni.vy -= fy;
        nj.vx += fx;
        nj.vy += fy;
      }
    }

    // Fuerza atractiva sobre aristas (resortes de Hooke)
    for (const link of this.links) {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = k * 1.5;
      const force = ((dist - targetDist) / dist) * this.alpha * (link.weight || 0.5);
      const fx = dx * force;
      const fy = dy * force;
      link.source.vx += fx;
      link.source.vy += fy;
      link.target.vx -= fx;
      link.target.vy -= fy;
    }

    // Gravedad hacia el centro
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (const n of this.nodes) {
      n.vx += (cx - n.x) * this.gravityStrength * this.alpha;
      n.vy += (cy - n.y) * this.gravityStrength * this.alpha;
    }

    // Integrar velocidades
    for (const n of this.nodes) {
      n.vx *= 1 - this.velocityDecay;
      n.vy *= 1 - this.velocityDecay;
      n.x = Math.max(20, Math.min(this.width - 20, n.x + n.vx));
      n.y = Math.max(20, Math.min(this.height - 20, n.y + n.vy));
    }

    return true;
  }

  /** Precalienta la simulación corriendo N ticks sin render */
  warmup(ticks = 100): void {
    for (let i = 0; i < ticks; i++) {
      if (!this.tick()) break;
    }
  }

  /** Reinicia alpha para re-animar */
  reheat(alpha = 0.3): void {
    this.alpha = alpha;
  }

  /** Fija un nodo en posición (drag) */
  fixNode(node: GraphNode, x: number, y: number): void {
    node.x = x;
    node.y = y;
    node.vx = 0;
    node.vy = 0;
  }
}
