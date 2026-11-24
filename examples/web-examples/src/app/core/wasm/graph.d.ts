/* tslint:disable */
/* eslint-disable */

export class WasmGraphEngine {
    free(): void;
    [Symbol.dispose](): void;
    add_edge(source: string, target: string, weight: number): void;
    add_node(id: string): void;
    get_conductance(subset_indices: Uint32Array | number[]): number;
    get_snapshot(): string;
    load_from_text(content: string): string;
    constructor(is_directed: boolean);
    set_directed(is_directed: boolean): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmgraphengine_free: (a: number, b: number) => void;
    readonly wasmgraphengine_add_edge: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly wasmgraphengine_add_node: (a: number, b: number, c: number) => void;
    readonly wasmgraphengine_get_conductance: (a: number, b: number, c: number) => number;
    readonly wasmgraphengine_get_snapshot: (a: number) => [number, number, number, number];
    readonly wasmgraphengine_load_from_text: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmgraphengine_new: (a: number) => number;
    readonly wasmgraphengine_set_directed: (a: number, b: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
