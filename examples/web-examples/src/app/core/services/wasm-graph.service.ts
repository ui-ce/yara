import { Injectable, signal } from '@angular/core';
import init, { WasmGraphEngine } from '../wasm/graph';
import { GraphSnapshot } from '../models/graph-engine.model';

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
}
