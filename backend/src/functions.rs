use crate::model::*;
use std::collections::{BinaryHeap, HashMap, HashSet, VecDeque};
pub trait GraphAnalyze
where
    Self: Sized,
{
    fn new(is_directed: bool) -> Self;
    fn is_connected(&self, start_node: usize) -> bool;
    fn add_node(&mut self, id: &str) -> NodeIndex;
    fn find_node(&mut self, id: &str) -> Option<NodeIndex>;
    fn add_edge(&mut self, source_id: String, target_id: String, weight: f64);
    fn load_from_file(file_path: &str) -> Result<Self, std::io::Error>;
    fn node_count(&self) -> usize;
    fn edge_count(&self) -> usize;
    fn average_degree(&self) -> f64;
    fn have_cycle(&self, start_node: usize) -> bool;
    fn dfs_cycle(&self, current: usize, visited: &mut Vec<bool>, parent: Option<usize>) -> bool;
    fn shortest_path(&self, start_node: usize, target_node: usize) -> Option<Vec<usize>>;
    fn count_components(&self) -> usize;
    fn bfs_get_visited(&self, start_node: usize) -> Vec<bool>;
    fn dijkstra(&self, start_node: usize) -> Vec<(usize, f64)>;
    fn calculate_conductance(&self, s: &HashSet<usize>) -> f64;
    fn prim(&self, start_node: usize) -> Vec<PrimEdge>;
    fn find(parent: &[usize], node: usize) -> usize;
    fn union(parent: &mut Vec<usize>, u: usize, v: usize);
    fn kruskal(&self) -> Vec<PrimEdge>;
}

impl GraphAnalyze for Graph {
    fn new(is_directed: bool) -> Self {
        Graph {
            nodes: Vec::new(),
            node_indice: HashMap::new(),
            adjacency_list: Vec::new(),
            is_directed,
        }
    }

    fn add_node(&mut self, id: &str) -> NodeIndex {
        if let Some(&index) = self.node_indice.get(id) {
            return index;
        }
        let index = self.nodes.len();
        self.nodes.push(Node { id: id.to_string() });
        self.node_indice.insert(id.to_string(), index);
        self.adjacency_list.push(Vec::new());

        index
    }

    fn find_node(&mut self, id: &str) -> Option<NodeIndex> {
        self.node_indice.get(id).copied()
    }

    fn add_edge(&mut self, source_id: String, target_id: String, weight: f64) {
        let source_option = self.find_node(&source_id);
        let target_option = self.find_node(&target_id);

        if let (Some(s_id), Some(t_id)) = (source_option, target_option) {
            self.adjacency_list[s_id].push(Edge {
                target: t_id,
                weight,
            });

            if !self.is_directed && s_id != t_id {
                self.adjacency_list[t_id].push(Edge {
                    target: s_id,
                    weight,
                });
            }
        } else {
            println!(
                "Error: Could not find nodes '{}' or '{}' (or both).",
                source_id, target_id
            );
        }
    }

    fn load_from_file(file_path: &str) -> Result<Self, std::io::Error> {
        use std::fs::File;
        use std::io::{BufRead, BufReader};

        let mut new_graph = Graph::new(false);
        let file = File::open(file_path)?;
        let reader = BufReader::new(file);

        for line in reader.lines() {
            let text = line?;

            if text.trim().is_empty() || text.starts_with('#') || text.starts_with('%') {
                continue;
            }

            let parts: Vec<&str> = text.split_whitespace().collect();

            if parts.len() >= 2 {
                let source_id = parts[0].to_string();
                let target_id = parts[1].to_string();

                let weight = if parts.len() == 3 {
                    parts[2].parse::<f64>().unwrap_or(1.0)
                } else {
                    1.0
                };

                new_graph.add_node(&source_id);
                new_graph.add_node(&target_id);
                new_graph.add_edge(source_id, target_id, weight);
            }
        }
        Ok(new_graph)
    }

    fn node_count(&self) -> usize {
        self.nodes.len()
    }

    fn edge_count(&self) -> usize {
        let mut total_edges = 0;
        for edge_of_nodes in &self.adjacency_list {
            total_edges += edge_of_nodes.len();
        }

        if !self.is_directed {
            total_edges / 2
        } else {
            total_edges
        }
    }

    fn average_degree(&self) -> f64 {
        let nodes = self.node_count() as f64;
        let edges = self.edge_count() as f64;

        edges / nodes
    }

    fn have_cycle(&self, start_node: usize) -> bool {
        let mut visited = vec![false; self.nodes.len()];
        self.dfs_cycle(start_node, &mut visited, None)
    }

    fn dfs_cycle(&self, current: usize, visited: &mut Vec<bool>, parent: Option<usize>) -> bool {
        visited[current] = true;
        for edge in &self.adjacency_list[current] {
            let neighbor = edge.target;
            if Some(neighbor) == parent {
                continue;
            }
            if visited[neighbor] {
                return true;
            }
            if self.dfs_cycle(neighbor, visited, Some(current)) {
                return true;
            }
        }
        false
    }

    fn is_connected(&self, start_node: usize) -> bool {
        if self.node_count() == 0 {
            return false;
        }
        let visited = self.bfs_get_visited(start_node);
        !visited.contains(&false)
    }

    fn shortest_path(&self, start_node: usize, target_node: usize) -> Option<Vec<usize>> {
        if self.node_count() == 0 {
            return None;
        }

        if start_node == target_node {
            return Some(vec![start_node]);
        }

        let mut queue = VecDeque::new();
        let mut visited = vec![false; self.node_count()];
        let mut parent: Vec<Option<usize>> = vec![None; self.node_count()];

        visited[start_node] = true;
        queue.push_back(start_node);

        while let Some(current_node) = queue.pop_front() {
            for edge in &self.adjacency_list[current_node] {
                let neighbor = edge.target;
                if !visited[neighbor] {
                    visited[neighbor] = true;
                    parent[neighbor] = Some(current_node);
                    queue.push_back(neighbor);
                }
            }
        }
        if !visited[target_node] {
            return None;
        }

        let mut path = Vec::new();
        let mut current = target_node;
        path.push(current);

        while let Some(p) = parent[current] {
            path.push(p);
            current = p;
        }
        path.reverse();
        Some(path)
    }

    fn count_components(&self) -> usize {
        let mut counter = 0;
        let mut visited = vec![false; self.node_count()];
        let mut queue = VecDeque::new();

        for node in 0..self.node_count() {
            if !visited[node] {
                counter += 1;
                visited[node] = true;
                queue.push_back(node);
                while let Some(current_node) = queue.pop_front() {
                    for edge in &self.adjacency_list[current_node] {
                        let neighbor = edge.target;
                        if !visited[neighbor] {
                            visited[neighbor] = true;
                            queue.push_back(neighbor);
                        }
                    }
                }
            }
        }
        counter
    }

    fn bfs_get_visited(&self, start_node: usize) -> Vec<bool> {
        let mut queue = VecDeque::new();
        let mut visited = vec![false; self.node_count()];

        visited[start_node] = true;
        queue.push_back(start_node);

        while let Some(current_node) = queue.pop_front() {
            for edge in &self.adjacency_list[current_node] {
                let neighbor = edge.target;
                if !visited[neighbor] {
                    visited[neighbor] = true;
                    queue.push_back(neighbor);
                }
            }
        }
        visited
    }
    fn dijkstra(&self, start_node: usize) -> Vec<(usize, f64)> {
        let mut cost_list = vec![f64::INFINITY; self.node_count()];
        cost_list[start_node] = 0.0;
        let mut queue = std::collections::BinaryHeap::new();

        queue.push(std::cmp::Reverse(State {
            cost: 0.0,
            node: start_node,
        }));

        while let Some(std::cmp::Reverse(State {
            cost: current_cost,
            node: current_node,
        })) = queue.pop()
        {
            if current_cost > cost_list[current_node] {
                continue;
            }

            for edge in &self.adjacency_list[current_node] {
                let new_cost = edge.weight + current_cost;
                if new_cost < cost_list[edge.target] {
                    cost_list[edge.target] = new_cost;
                    queue.push(std::cmp::Reverse(State {
                        cost: new_cost,
                        node: edge.target,
                    }));
                }
            }
        }
        cost_list.into_iter().enumerate().collect()
    }
    fn calculate_conductance(&self, s: &HashSet<usize>) -> f64 {
        if s.is_empty() || s.len() == self.nodes.len() {
            return 0.0;
        }

        let mut cut_size = 0.0;
        let mut vol_s = 0.0;
        let mut total_vol = 0.0;

        for node_edges in &self.adjacency_list {
            for edge in node_edges {
                total_vol += edge.weight
            }
        }

        for &node in s {
            for edge in &self.adjacency_list[node] {
                vol_s += edge.weight;
                if !s.contains(&edge.target) {
                    cut_size += edge.weight;
                }
            }
        }

        let vol_rest = total_vol - vol_s;

        let min_vol = vol_s.min(vol_rest);

        if min_vol == 0.0 {
            return 0.0;
        }
        cut_size / min_vol
    }

    fn prim(&self, start_node: usize) -> Vec<PrimEdge> {
        let mut visited = vec![false; self.nodes.len()];
        let mut min_heap = BinaryHeap::new();
        let mut mst = Vec::new();

        visited[start_node] = true;
        for edge in &self.adjacency_list[start_node] {
            let pedge = PrimEdge {
                source: start_node,
                target: edge.target,
                weight: edge.weight,
            };
            min_heap.push(pedge);
        }
        while let Some(edge) = min_heap.pop() {
            if visited[edge.target] {
                continue;
            }
            visited[edge.target] = true;
            mst.push(edge);

            for next_edge in &self.adjacency_list[edge.target] {
                if !visited[next_edge.target] {
                    min_heap.push(PrimEdge {
                        source: edge.target,
                        target: next_edge.target,
                        weight: next_edge.weight,
                    });
                }
            }
        }
        mst
    }
    fn find(parent: &[usize], mut node: usize) -> usize {
        while parent[node] != node {
            node = parent[node];
        }
        node
    }
    fn union(parent: &mut Vec<usize>, u: usize, v: usize) {
        let first_p = Self::find(parent, u);
        let second_p = Self::find(parent, v);

        if first_p != second_p {
            parent[second_p] = first_p;
        }
    }
    fn kruskal(&self) -> Vec<PrimEdge> {
        let mut all_edges = Vec::new();
        for (u, node_edges) in self.adjacency_list.iter().enumerate() {
            for edge in node_edges {
                all_edges.push(PrimEdge {
                    source: u,
                    target: edge.target,
                    weight: edge.weight,
                });
            }
        }
        all_edges.sort_by(|a, b| a.weight.partial_cmp(&b.weight).unwrap());
        let mut mst = Vec::new();
        let mut parent: Vec<usize> = (0..self.nodes.len()).collect();
        for edge in all_edges {
            let root_source = Self::find(&parent, edge.source);
            let root_target = Self::find(&parent, edge.target);

            if root_source != root_target {
                Self::union(&mut parent, edge.source, edge.target);
                mst.push(edge);
            }
        }
        mst
    }
}

#[test]
fn test_dijkstra_with_file() {
    let new_graph = Graph::load_from_file("graph.txt").expect("Can not open the file");
    let distance = new_graph.dijkstra(0);
    assert!(!distance.is_empty())
}

#[test]
fn test_conductance_simple() {
    use std::collections::{HashMap, HashSet};

    let graph = Graph {
        nodes: vec![
            Node {
                id: "0".to_string(),
            },
            Node {
                id: "1".to_string(),
            },
            Node {
                id: "2".to_string(),
            },
            Node {
                id: "3".to_string(),
            },
        ],
        node_indice: HashMap::from([
            ("0".to_string(), 0),
            ("1".to_string(), 1),
            ("2".to_string(), 2),
            ("3".to_string(), 3),
        ]),
        adjacency_list: vec![
            vec![Edge {
                target: 1,
                weight: 1.0,
            }],
            vec![
                Edge {
                    target: 0,
                    weight: 1.0,
                },
                Edge {
                    target: 2,
                    weight: 1.0,
                },
            ],
            vec![
                Edge {
                    target: 1,
                    weight: 1.0,
                },
                Edge {
                    target: 3,
                    weight: 1.0,
                },
            ],
            vec![Edge {
                target: 2,
                weight: 1.0,
            }],
        ],
        is_directed: false,
    };

    let mut s: HashSet<usize> = HashSet::new();
    s.insert(0);
    s.insert(1);

    let result = graph.calculate_conductance(&s);

    assert!((result - 1.0 / 3.0).abs() < 1e-5);
}
#[test]
fn test_kruskal_mst_simple() {
    let mut graph = Graph::new(false);

    graph.add_node("A");
    graph.add_node("B");
    graph.add_node("C");
    graph.add_node("D");

    graph.add_edge("A".to_string(), "B".to_string(), 1.0);
    graph.add_edge("B".to_string(), "C".to_string(), 2.0);
    graph.add_edge("C".to_string(), "D".to_string(), 3.0);

    graph.add_edge("A".to_string(), "C".to_string(), 4.0);
    graph.add_edge("B".to_string(), "D".to_string(), 5.0);

    let mst = graph.kruskal();

    println!("MST Edge Count: {}", mst.len());

    let total_weight: f64 = mst.iter().map(|e| e.weight).sum();
    assert_eq!(total_weight, 6.0);
}
#[test]
fn test_p2p_gnutella_graph() {
    let file_path = "p2p-Gnutella08.txt";

    println!("Loading Gnutella graph from {}...", file_path);

    let graph =
        Graph::load_from_file(file_path).expect("Failed to load the file! Check the file path.");

    println!("--- Gnutella Graph Statistics ---");
    println!("Total Nodes: {}", graph.node_count());
    println!("Total Edges: {}", graph.edge_count());
    println!("Average Degree: {:.2}", graph.average_degree());
    println!("Connected Components: {}", graph.count_components());

    let start_time = std::time::Instant::now();
    let mst = graph.kruskal();
    let duration = start_time.elapsed();

    let total_mst_weight: f64 = mst.iter().map(|e| e.weight).sum();
    println!("--- MST Results ---");
    println!("MST Edge Count: {}", mst.len());
    println!("MST Total Weight: {}", total_mst_weight);
    println!("Kruskal Execution Time: {:?}", duration);
}
