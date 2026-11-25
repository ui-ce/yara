pub mod functions;
pub mod model;
pub mod parser;

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
        let subset: std::collections::HashSet<usize> = subset_indices.iter().copied().collect();
        self.graph.calculate_conductance(&subset)
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
}
