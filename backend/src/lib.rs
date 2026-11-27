pub mod functions;
pub mod model;
pub mod parser;
pub mod trace;

use crate::functions::GraphAnalyze;
use crate::model::Graph;
use crate::parser::{parse_from_str, ParsedGraph};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct EdgeDto {
    source: usize,
    target: usize,
    weight: f64,
}

#[derive(Serialize)]
struct GraphSnapshot {
    nodes: Vec<String>,
    edges: Vec<EdgeDto>,
    is_directed: bool,
    is_weighted: bool,
    suggested_directed: bool,
}

#[derive(Serialize)]
struct ConductanceReport {
    conductance: f64,
    cut_weight: f64,
    cut_edge_count: usize,
    vol_s: f64,
    vol_rest: f64,
    total_vol: f64,
    subset_size: usize,
}

#[wasm_bindgen]
pub struct WasmGraphEngine {
    graph: Graph,
    parsed_data: Option<ParsedGraph>,
}

#[wasm_bindgen]
impl WasmGraphEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(is_directed: bool) -> WasmGraphEngine {
        WasmGraphEngine {
            graph: Graph::new(is_directed),
            parsed_data: None,
        }
    }

    pub fn load_from_text(&mut self, content: &str) -> Result<String, String> {
        let parsed = parse_from_str(content)?;
        self.graph = parsed.to_graph(parsed.suggested_directed);
        self.parsed_data = Some(parsed);
        self.get_snapshot()
    }

    pub fn set_directed(&mut self, is_directed: bool) -> Result<String, String> {
        if let Some(ref parsed) = self.parsed_data {
            self.graph = parsed.to_graph(is_directed);
        } else {
            self.graph.is_directed = is_directed;
        }
        self.get_snapshot()
    }

    pub fn get_snapshot(&self) -> Result<String, String> {
        let nodes: Vec<String> = self.graph.nodes.iter().map(|n| n.id.clone()).collect();
        let mut edges = Vec::new();

        for (u, neighbors) in self.graph.adjacency_list.iter().enumerate() {
            for edge in neighbors {
                if !self.graph.is_directed && u > edge.target {
                    continue;
                }
                edges.push(EdgeDto {
                    source: u,
                    target: edge.target,
                    weight: edge.weight,
                });
            }
        }

        let (is_weighted, suggested_directed) = match &self.parsed_data {
            Some(p) => (p.is_weighted, p.suggested_directed),
            None => (false, self.graph.is_directed),
        };

        let snapshot = GraphSnapshot {
            nodes,
            edges,
            is_directed: self.graph.is_directed,
            is_weighted,
            suggested_directed,
        };

        serde_json::to_string(&snapshot).map_err(|e| e.to_string())
    }

    pub fn add_node(&mut self, id: &str) {
        self.graph.add_node(id);
    }

    pub fn add_edge(&mut self, source: String, target: String, weight: f64) {
        self.graph.add_edge(source, target, weight);
    }

    pub fn get_conductance(&self, subset_indices: &[usize]) -> f64 {
        let node_count = self.graph.nodes.len();
        let subset: std::collections::HashSet<usize> = subset_indices
            .iter()
            .copied()
            .filter(|&i| i < node_count)
            .collect();
        self.graph.calculate_conductance(&subset)
    }

    pub fn get_conductance_details(&self, subset_indices: &[usize]) -> Result<String, String> {
        let node_count = self.graph.nodes.len();
        let s: std::collections::HashSet<usize> = subset_indices
            .iter()
            .copied()
            .filter(|&i| i < node_count)
            .collect();

        let total_vol: f64 = self
            .graph
            .adjacency_list
            .iter()
            .flat_map(|edges| edges.iter())
            .map(|e| e.weight)
            .sum();

        let mut cut_weight = 0.0;
        let mut cut_edge_count = 0;
        let mut vol_s = 0.0;

        for &node in &s {
            for edge in &self.graph.adjacency_list[node] {
                vol_s += edge.weight;
                if !s.contains(&edge.target) {
                    cut_weight += edge.weight;
                    cut_edge_count += 1;
                }
            }
        }

        let vol_rest = total_vol - vol_s;
        let min_vol = vol_s.min(vol_rest);
        let conductance = if s.is_empty() || s.len() == node_count || min_vol == 0.0 {
            0.0
        } else {
            cut_weight / min_vol
        };

        let report = ConductanceReport {
            conductance,
            cut_weight,
            cut_edge_count,
            vol_s,
            vol_rest,
            total_vol,
            subset_size: s.len(),
        };

        serde_json::to_string(&report).map_err(|e| e.to_string())
    }

    pub fn get_graph_stats(&self) -> Result<String, String> {
        let stats = trace::compute_graph_stats(&self.graph);
        serde_json::to_string(&stats).map_err(|e| e.to_string())
    }

    pub fn trace_conductance(
        &self,
        subset_indices: &[usize],
        max_steps: usize,
    ) -> Result<String, String> {
        let result = trace::trace_conductance(&self.graph, subset_indices, max_steps);
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }

    pub fn trace_bfs(
        &self,
        start_node: usize,
        target_node: i32,
        max_steps: usize,
    ) -> Result<String, String> {
        let target = if target_node < 0 {
            None
        } else {
            Some(target_node as usize)
        };
        let result = trace::trace_bfs(&self.graph, start_node, target, max_steps)?;
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }

    pub fn trace_dijkstra(
        &self,
        start_node: usize,
        target_node: i32,
        max_steps: usize,
    ) -> Result<String, String> {
        let target = if target_node < 0 {
            None
        } else {
            Some(target_node as usize)
        };
        let result = trace::trace_dijkstra(&self.graph, start_node, target, max_steps)?;
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }
    pub fn trace_dfs_cycle(&self, start_node: usize, max_steps: usize) -> Result<String, String> {
        let result = trace::trace_dfs_cycle(&self.graph, start_node, max_steps)?;
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }

    pub fn trace_components(&self, max_steps: usize) -> Result<String, String> {
        let result = trace::trace_components(&self.graph, max_steps);
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }

    pub fn trace_prim(&self, start_node: usize, max_steps: usize) -> Result<String, String> {
        let result = trace::trace_prim(&self.graph, start_node, max_steps)?;
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }

    pub fn trace_kruskal(&self, max_steps: usize) -> Result<String, String> {
        let result = trace::trace_kruskal(&self.graph, max_steps);
        serde_json::to_string(&result).map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wasm_load_and_toggle_direction() {
        let mut engine = WasmGraphEngine::new(false);
        let input = "A,B,5\nB,C,10\n";

        let json_undirected = engine.load_from_text(input).unwrap();
        assert!(json_undirected.contains("\"is_weighted\":true"));
        assert!(json_undirected.contains("\"is_directed\":false"));

        let json_directed = engine.set_directed(true).unwrap();
        assert!(json_directed.contains("\"is_directed\":true"));
    }

    #[test]
    fn test_wasm_conductance_details() {
        let mut engine = WasmGraphEngine::new(false);
        let input = "0 1\n1 2\n2 3\n";
        engine.load_from_text(input).unwrap();

        let json = engine.get_conductance_details(&[0, 1]).unwrap();
        assert!(json.contains("\"cut_edge_count\":1"));
        assert!(json.contains("\"vol_s\":3.0"));
        assert!(json.contains("\"subset_size\":2"));
    }
}
