use std::collections::HashMap;
pub type NodeIndex = usize;

#[derive(Debug, Clone)]
pub struct Node {
    pub id: String,
}

#[derive(Debug, Clone)]
pub struct Edge {
    pub target: NodeIndex,
    pub weight: f64,
}

#[derive(Debug, Clone)]
pub struct Graph {
    pub nodes: Vec<Node>,
    pub node_indice: HashMap<String, NodeIndex>,
    pub adjacency_list: Vec<Vec<Edge>>,
    pub is_directed: bool,
}

#[derive(Copy, Clone, PartialEq)]
pub struct State {
    pub cost: f64,
    pub node: usize,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct PrimEdge {
    pub source: usize,
    pub target: usize,
    pub weight: f64,
}

impl Eq for State {}

impl Eq for PrimEdge {}

impl Ord for State {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        other
            .cost
            .partial_cmp(&self.cost)
            .unwrap_or(std::cmp::Ordering::Equal)
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for PrimEdge {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        other
            .weight
            .partial_cmp(&self.weight)
            .unwrap_or(std::cmp::Ordering::Equal)
    }
}

impl PartialOrd for PrimEdge {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}
