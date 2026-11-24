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
