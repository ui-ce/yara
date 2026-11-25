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
