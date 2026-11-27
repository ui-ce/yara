import { Injectable, signal } from '@angular/core';
import init, { WasmGraphEngine } from '../wasm/graph';
import {
  ConductanceReport,
  GraphSnapshot,
  GraphStats,
  TraceResult,
} from '../models/graph-engine.model';

@Injectable({ providedIn: 'root' })
export class WasmGraphService {
  private engine: WasmGraphEngine | null = null;
  private initPromise: Promise<void> | null = null;

  readonly snapshot = signal<GraphSnapshot | null>(null);
  readonly stats = signal<GraphStats | null>(null);
  readonly error = signal<string | null>(null);

  private ensureReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = init({ module_or_path: '/wasm/graph_bg.wasm' })
        .then(() => {
          this.engine = new WasmGraphEngine(false);
        })
        .catch((err) => {
          this.initPromise = null;
          throw err;
        });
    }
    return this.initPromise;
  }

  private refreshStats(): void {
    if (!this.engine) {
      this.stats.set(null);
      return;
    }
    try {
      const statsJson = this.engine.get_graph_stats();
      this.stats.set(JSON.parse(statsJson) as GraphStats);
    } catch {
      this.stats.set(null);
    }
  }

  async loadFromText(content: string): Promise<void> {
    try {
      await this.ensureReady();
      const json = this.engine!.load_from_text(content);
      this.snapshot.set(JSON.parse(json) as GraphSnapshot);
      this.refreshStats();
      this.error.set(null);
    } catch (err) {
      console.error('WASM loadFromText failed:', err);
      this.error.set(String(err));
    }
  }

  async setDirected(isDirected: boolean): Promise<void> {
    try {
      await this.ensureReady();
      const json = this.engine!.set_directed(isDirected);
      this.snapshot.set(JSON.parse(json) as GraphSnapshot);
      this.refreshStats();
      this.error.set(null);
    } catch (err) {
      console.error('WASM setDirected failed:', err);
      this.error.set(String(err));
    }
  }

  getConductanceDetails(indices: number[]): { report: ConductanceReport; timeMs: number } | null {
    if (!this.engine) return null;
    try {
      const start = performance.now();
      const json = this.engine.get_conductance_details(new Uint32Array(indices));
      const timeMs = performance.now() - start;
      return {
        report: JSON.parse(json) as ConductanceReport,
        timeMs,
      };
    } catch (err) {
      console.error('Conductance calculation failed:', err);
      return null;
    }
  }

  traceConductance(
    indices: number[],
    maxSteps = 500,
  ): { result: TraceResult; timeMs: number } | null {
    if (!this.engine) return null;
    try {
      const start = performance.now();
      const json = this.engine.trace_conductance(new Uint32Array(indices), maxSteps);
      const timeMs = performance.now() - start;
      return { result: JSON.parse(json) as TraceResult, timeMs };
    } catch (err) {
      this.error.set(String(err));
      return null;
    }
  }

  traceBfs(
    startNode: number,
    targetNode: number | null,
    maxSteps = 500,
  ): { result: TraceResult; timeMs: number } | null {
    if (!this.engine) return null;
    try {
      const start = performance.now();
      const json = this.engine.trace_bfs(startNode, targetNode ?? -1, maxSteps);
      const timeMs = performance.now() - start;
      return { result: JSON.parse(json) as TraceResult, timeMs };
    } catch (err) {
      this.error.set(String(err));
      return null;
    }
  }

  traceDijkstra(
    startNode: number,
    targetNode: number | null,
    maxSteps = 500,
  ): { result: TraceResult; timeMs: number } | null {
    if (!this.engine) return null;
    try {
      const start = performance.now();
      const json = this.engine.trace_dijkstra(startNode, targetNode ?? -1, maxSteps);
      const timeMs = performance.now() - start;
      return { result: JSON.parse(json) as TraceResult, timeMs };
    } catch (err) {
      this.error.set(String(err));
      return null;
    }
  }
}
