import { Injectable, signal } from '@angular/core';
import init, { WasmGraphEngine } from '../wasm/graph';
import { ConductanceReport, GraphSnapshot } from '../models/graph-engine.model';

@Injectable({ providedIn: 'root' })
export class WasmGraphService {
  private engine: WasmGraphEngine | null = null;
  private initPromise: Promise<void> | null = null;

  readonly snapshot = signal<GraphSnapshot | null>(null);
  readonly error = signal<string | null>(null);

  private ensureReady(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = init({ module_or_path: '/wasm/graph_bg.wasm' }).then(() => {
        this.engine = new WasmGraphEngine(false);
      });
    }
    return this.initPromise;
  }

  async loadFromText(content: string): Promise<void> {
    await this.ensureReady();
    try {
      const json = this.engine!.load_from_text(content);
      this.snapshot.set(JSON.parse(json) as GraphSnapshot);
      this.error.set(null);
    } catch (err) {
      this.error.set(String(err));
    }
  }

  async setDirected(isDirected: boolean): Promise<void> {
    await this.ensureReady();
    try {
      const json = this.engine!.set_directed(isDirected);
      this.snapshot.set(JSON.parse(json) as GraphSnapshot);
      this.error.set(null);
    } catch (err) {
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
}
