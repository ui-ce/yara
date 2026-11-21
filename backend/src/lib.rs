pub mod functions;
pub mod model;
pub mod parser;


use wasm_bindgen::prelude::*;
use crate::model::Graph;
use crate::functions::GraphAnalyze;

#[wasm_bindgen]
pub struct WasmGraphEngine {
    graph: Graph,
}

#[wasm_bindgen]
impl WasmGraphEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(is_directed: bool) -> WasmGraphEngine {
        WasmGraphEngine {
            graph: Graph::new(is_directed),
        }
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