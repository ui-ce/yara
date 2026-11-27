export interface EdgeDto {
  source: number;
  target: number;
  weight: number;
}

export interface GraphSnapshot {
  nodes: string[];
  edges: EdgeDto[];
  is_directed: boolean;
  is_weighted: boolean;
  suggested_directed: boolean;
}

export interface ConductanceReport {
  conductance: number;
  cut_weight: number;
  cut_edge_count: number;
  vol_s: number;
  vol_rest: number;
  total_vol: number;
  subset_size: number;
}

export interface GraphStats {
  node_count: number;
  edge_count: number;
  average_degree: number;
  is_connected: boolean;
  component_count: number;
  has_cycle: boolean;
}

export interface NodeStateUpdate {
  node: number;
  tag: string;
}

export interface EdgeStateUpdate {
  source: number;
  target: number;
  tag: string;
}

export interface TraceMetric {
  key: string;
  value: string;
}

export interface TraceStep {
  step_index: number;
  line: number;
  title_key: string;
  message_key: string;
  params: Record<string, string>;
  node_updates: NodeStateUpdate[];
  edge_updates: EdgeStateUpdate[];
  metrics: TraceMetric[];
}

export interface TraceResult {
  algorithm: string;
  steps: TraceStep[];
  truncated: boolean;
  total_steps_recorded: number;
  summary: Record<string, string>;
}

export type GraphExplorerAlgorithm =
  | 'conductance'
  | 'bfs'
  | 'dijkstra'
  | 'dfs_cycle'
  | 'components'
  | 'prim'
  | 'kruskal';
