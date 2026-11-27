use crate::model::{Graph, State};
use serde::Serialize;
use std::collections::{BinaryHeap, HashMap, HashSet, VecDeque};

#[derive(Serialize, Clone, Debug)]
pub struct NodeStateUpdate {
    pub node: usize,
    pub tag: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct EdgeStateUpdate {
    pub source: usize,
    pub target: usize,
    pub tag: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct TraceMetric {
    pub key: String,
    pub value: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct TraceStep {
    pub step_index: usize,
    pub line: usize,
    pub title_key: String,
    pub message_key: String,
    pub params: HashMap<String, String>,
    pub node_updates: Vec<NodeStateUpdate>,
    pub edge_updates: Vec<EdgeStateUpdate>,
    pub metrics: Vec<TraceMetric>,
}

#[derive(Serialize, Clone, Debug)]
pub struct TraceResult {
    pub algorithm: String,
    pub steps: Vec<TraceStep>,
    pub truncated: bool,
    pub total_steps_recorded: usize,
    pub summary: HashMap<String, String>,
}

#[derive(Serialize, Clone, Debug)]
pub struct GraphStats {
    pub node_count: usize,
    pub edge_count: usize,
    pub average_degree: f64,
    pub is_connected: bool,
    pub component_count: usize,
    pub has_cycle: bool,
}

fn fmt_num(value: f64) -> String {
    if !value.is_finite() {
        return "∞".to_string();
    }
    if (value - value.round()).abs() < 1e-9 {
        format!("{}", value.round() as i64)
    } else {
        format!("{:.4}", value)
            .trim_end_matches('0')
            .trim_end_matches('.')
            .to_string()
    }
}

struct TraceRecorder {
    steps: Vec<TraceStep>,
    max_steps: usize,
    truncated: bool,
}

impl TraceRecorder {
    fn new(max_steps: usize) -> Self {
        Self {
            steps: Vec::new(),
            max_steps: max_steps.max(2),
            truncated: false,
        }
    }

    /// Reserves the last slot for the final summary step.
    fn push(
        &mut self,
        line: usize,
        title_key: &str,
        message_key: &str,
        params: HashMap<String, String>,
        node_updates: Vec<NodeStateUpdate>,
        edge_updates: Vec<EdgeStateUpdate>,
        metrics: Vec<TraceMetric>,
    ) {
        if self.steps.len() + 1 >= self.max_steps {
            self.truncated = true;
            return;
        }
        let step_index = self.steps.len();
        self.steps.push(TraceStep {
            step_index,
            line,
            title_key: title_key.to_string(),
            message_key: message_key.to_string(),
            params,
            node_updates,
            edge_updates,
            metrics,
        });
    }

    fn push_final(
        &mut self,
        line: usize,
        title_key: &str,
        message_key: &str,
        params: HashMap<String, String>,
        node_updates: Vec<NodeStateUpdate>,
        edge_updates: Vec<EdgeStateUpdate>,
        metrics: Vec<TraceMetric>,
    ) {
        let step_index = self.steps.len();
        self.steps.push(TraceStep {
            step_index,
            line,
            title_key: title_key.to_string(),
            message_key: message_key.to_string(),
            params,
            node_updates,
            edge_updates,
            metrics,
        });
    }

    fn finish(self, algorithm: &str, summary: HashMap<String, String>) -> TraceResult {
        let total_steps_recorded = self.steps.len();
        TraceResult {
            algorithm: algorithm.to_string(),
            steps: self.steps,
            truncated: self.truncated,
            total_steps_recorded,
            summary,
        }
    }
}

fn params_from(pairs: &[(&str, String)]) -> HashMap<String, String> {
    pairs
        .iter()
        .map(|(k, v)| ((*k).to_string(), v.clone()))
        .collect()
}

fn metrics_from(pairs: &[(&str, String)]) -> Vec<TraceMetric> {
    pairs
        .iter()
        .map(|(k, v)| TraceMetric {
            key: (*k).to_string(),
            value: v.clone(),
        })
        .collect()
}

/// Safe iterative graph statistics (avoids recursive DFS stack overflow on large Wasm graphs).
pub fn compute_graph_stats(graph: &Graph) -> GraphStats {
    let n = graph.nodes.len();
    let total_adj_entries: usize = graph.adjacency_list.iter().map(|adj| adj.len()).sum();
    let edge_count = if graph.is_directed {
        total_adj_entries
    } else {
        total_adj_entries / 2
    };
    let average_degree = if n == 0 {
        0.0
    } else if graph.is_directed {
        edge_count as f64 / n as f64
    } else {
        (2.0 * edge_count as f64) / n as f64
    };

    if n == 0 {
        return GraphStats {
            node_count: 0,
            edge_count: 0,
            average_degree: 0.0,
            is_connected: false,
            component_count: 0,
            has_cycle: false,
        };
    }

    // Connected components (weakly connected for directed, standard for undirected)
    let mut visited = vec![false; n];
    let mut component_count = 0usize;
    let mut queue = VecDeque::new();

    for start in 0..n {
        if visited[start] {
            continue;
        }
        component_count += 1;
        visited[start] = true;
        queue.push_back(start);
        while let Some(u) = queue.pop_front() {
            for edge in &graph.adjacency_list[u] {
                if !visited[edge.target] {
                    visited[edge.target] = true;
                    queue.push_back(edge.target);
                }
            }
        }
    }

    let has_cycle = detect_cycle_iterative(graph);

    GraphStats {
        node_count: n,
        edge_count,
        average_degree,
        is_connected: component_count == 1,
        component_count,
        has_cycle,
    }
}

fn detect_cycle_iterative(graph: &Graph) -> bool {
    let n = graph.nodes.len();
    if graph.is_directed {
        // Kahn's algorithm: if topological sort visits fewer than n nodes, there is a cycle.
        let mut in_degree = vec![0usize; n];
        for edges in &graph.adjacency_list {
            for edge in edges {
                in_degree[edge.target] += 1;
            }
        }
        let mut queue: VecDeque<usize> = (0..n).filter(|&i| in_degree[i] == 0).collect();
        let mut visited_count = 0usize;
        while let Some(u) = queue.pop_front() {
            visited_count += 1;
            for edge in &graph.adjacency_list[u] {
                in_degree[edge.target] -= 1;
                if in_degree[edge.target] == 0 {
                    queue.push_back(edge.target);
                }
            }
        }
        visited_count < n
    } else {
        let mut visited = vec![false; n];
        let mut stack: Vec<(usize, Option<usize>)> = Vec::new();
        for start in 0..n {
            if visited[start] {
                continue;
            }
            visited[start] = true;
            stack.push((start, None));
            while let Some((u, parent)) = stack.pop() {
                for edge in &graph.adjacency_list[u] {
                    let v = edge.target;
                    if v == u {
                        return true;
                    }
                    if Some(v) == parent {
                        continue;
                    }
                    if visited[v] {
                        return true;
                    }
                    visited[v] = true;
                    stack.push((v, Some(u)));
                }
            }
        }
        false
    }
}

pub fn trace_conductance(graph: &Graph, subset_indices: &[usize], max_steps: usize) -> TraceResult {
    let n = graph.nodes.len();
    let mut sorted_subset: Vec<usize> = subset_indices.iter().copied().filter(|&i| i < n).collect();
    sorted_subset.sort_unstable();
    sorted_subset.dedup();

    let s: HashSet<usize> = sorted_subset.iter().copied().collect();
    let total_vol: f64 = graph
        .adjacency_list
        .iter()
        .flat_map(|edges| edges.iter())
        .map(|e| e.weight)
        .sum();

    let mut rec = TraceRecorder::new(max_steps);

    let init_nodes: Vec<NodeStateUpdate> = sorted_subset
        .iter()
        .map(|&u| NodeStateUpdate {
            node: u,
            tag: "subset".to_string(),
        })
        .collect();

    rec.push(
        2,
        "trace.conductance.init.title",
        "trace.conductance.init.msg",
        params_from(&[
            ("subsetSize", s.len().to_string()),
            ("totalVol", fmt_num(total_vol)),
        ]),
        init_nodes,
        vec![],
        metrics_from(&[
            ("subsetSize", s.len().to_string()),
            ("volS", "0".to_string()),
            ("cutWeight", "0".to_string()),
            ("cutEdges", "0".to_string()),
            ("conductance", "—".to_string()),
        ]),
    );

    let mut vol_s = 0.0;
    let mut cut_weight = 0.0;
    let mut cut_edge_count = 0usize;

    for &u in &sorted_subset {
        let u_label = graph.nodes[u].id.clone();

        rec.push(
            3,
            "trace.conductance.node.title",
            "trace.conductance.node.msg",
            params_from(&[("node", u_label.clone())]),
            vec![NodeStateUpdate {
                node: u,
                tag: "current".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("subsetSize", s.len().to_string()),
                ("volS", fmt_num(vol_s)),
                ("cutWeight", fmt_num(cut_weight)),
                ("cutEdges", cut_edge_count.to_string()),
                ("conductance", "—".to_string()),
            ]),
        );

        for edge in &graph.adjacency_list[u] {
            let v = edge.target;
            let v_label = graph.nodes[v].id.clone();
            vol_s += edge.weight;

            if !s.contains(&v) {
                cut_weight += edge.weight;
                cut_edge_count += 1;
                rec.push(
                    6,
                    "trace.conductance.cutEdge.title",
                    "trace.conductance.cutEdge.msg",
                    params_from(&[
                        ("u", u_label.clone()),
                        ("v", v_label),
                        ("w", fmt_num(edge.weight)),
                    ]),
                    vec![],
                    vec![EdgeStateUpdate {
                        source: u,
                        target: v,
                        tag: "cut".to_string(),
                    }],
                    metrics_from(&[
                        ("subsetSize", s.len().to_string()),
                        ("volS", fmt_num(vol_s)),
                        ("cutWeight", fmt_num(cut_weight)),
                        ("cutEdges", cut_edge_count.to_string()),
                        ("conductance", "—".to_string()),
                    ]),
                );
            } else {
                rec.push(
                    5,
                    "trace.conductance.internalEdge.title",
                    "trace.conductance.internalEdge.msg",
                    params_from(&[
                        ("u", u_label.clone()),
                        ("v", v_label),
                        ("w", fmt_num(edge.weight)),
                    ]),
                    vec![],
                    vec![EdgeStateUpdate {
                        source: u,
                        target: v,
                        tag: "internal".to_string(),
                    }],
                    metrics_from(&[
                        ("subsetSize", s.len().to_string()),
                        ("volS", fmt_num(vol_s)),
                        ("cutWeight", fmt_num(cut_weight)),
                        ("cutEdges", cut_edge_count.to_string()),
                        ("conductance", "—".to_string()),
                    ]),
                );
            }
        }

        rec.push(
            3,
            "trace.conductance.nodeDone.title",
            "trace.conductance.nodeDone.msg",
            params_from(&[("node", u_label), ("volS", fmt_num(vol_s))]),
            vec![NodeStateUpdate {
                node: u,
                tag: "subset".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("subsetSize", s.len().to_string()),
                ("volS", fmt_num(vol_s)),
                ("cutWeight", fmt_num(cut_weight)),
                ("cutEdges", cut_edge_count.to_string()),
                ("conductance", "—".to_string()),
            ]),
        );
    }

    let vol_rest = total_vol - vol_s;
    let min_vol = vol_s.min(vol_rest);
    let conductance = if s.is_empty() || s.len() == n || min_vol == 0.0 {
        0.0
    } else {
        cut_weight / min_vol
    };

    rec.push_final(
        8,
        "trace.conductance.done.title",
        "trace.conductance.done.msg",
        params_from(&[
            ("phi", fmt_num(conductance)),
            ("cut", fmt_num(cut_weight)),
            ("minVol", fmt_num(min_vol)),
        ]),
        vec![],
        vec![],
        metrics_from(&[
            ("subsetSize", s.len().to_string()),
            ("volS", fmt_num(vol_s)),
            ("volRest", fmt_num(vol_rest)),
            ("cutWeight", fmt_num(cut_weight)),
            ("cutEdges", cut_edge_count.to_string()),
            ("conductance", fmt_num(conductance)),
        ]),
    );

    let summary = params_from(&[
        ("conductance", fmt_num(conductance)),
        ("cut_weight", fmt_num(cut_weight)),
        ("cut_edge_count", cut_edge_count.to_string()),
        ("vol_s", fmt_num(vol_s)),
        ("vol_rest", fmt_num(vol_rest)),
        ("total_vol", fmt_num(total_vol)),
        ("subset_size", s.len().to_string()),
    ]);

    rec.finish("conductance", summary)
}

pub fn trace_bfs(
    graph: &Graph,
    start_node: usize,
    target_node: Option<usize>,
    max_steps: usize,
) -> Result<TraceResult, String> {
    let n = graph.nodes.len();
    if n == 0 || start_node >= n {
        return Err("Start node is out of bounds".to_string());
    }
    if let Some(t) = target_node {
        if t >= n {
            return Err("Target node is out of bounds".to_string());
        }
    }

    let mut rec = TraceRecorder::new(max_steps);
    let mut visited = vec![false; n];
    let mut parent: Vec<Option<usize>> = vec![None; n];
    let mut dist: Vec<Option<usize>> = vec![None; n];
    let mut queue = VecDeque::new();

    visited[start_node] = true;
    dist[start_node] = Some(0);
    queue.push_back(start_node);
    let mut visited_count = 1usize;

    let mut init_nodes = vec![NodeStateUpdate {
        node: start_node,
        tag: "open".to_string(),
    }];
    if let Some(t) = target_node {
        if t != start_node {
            init_nodes.push(NodeStateUpdate {
                node: t,
                tag: "target".to_string(),
            });
        }
    }

    rec.push(
        2,
        "trace.bfs.init.title",
        "trace.bfs.init.msg",
        params_from(&[("start", graph.nodes[start_node].id.clone())]),
        init_nodes,
        vec![],
        metrics_from(&[
            ("visited", visited_count.to_string()),
            ("queueSize", queue.len().to_string()),
        ]),
    );

    let mut found_target = false;

    while let Some(u) = queue.pop_front() {
        let u_label = graph.nodes[u].id.clone();

        rec.push(
            4,
            "trace.bfs.visit.title",
            "trace.bfs.visit.msg",
            params_from(&[
                ("node", u_label.clone()),
                ("dist", dist[u].unwrap_or(0).to_string()),
            ]),
            vec![NodeStateUpdate {
                node: u,
                tag: "current".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("current", u_label.clone()),
                ("visited", visited_count.to_string()),
                ("queueSize", queue.len().to_string()),
            ]),
        );

        if target_node == Some(u) {
            found_target = true;
            break;
        }

        for edge in &graph.adjacency_list[u] {
            let v = edge.target;
            let v_label = graph.nodes[v].id.clone();

            if !visited[v] {
                visited[v] = true;
                parent[v] = Some(u);
                dist[v] = Some(dist[u].unwrap_or(0) + 1);
                visited_count += 1;
                queue.push_back(v);

                rec.push(
                    8,
                    "trace.bfs.discover.title",
                    "trace.bfs.discover.msg",
                    params_from(&[
                        ("u", u_label.clone()),
                        ("v", v_label),
                        ("dist", dist[v].unwrap_or(0).to_string()),
                    ]),
                    vec![NodeStateUpdate {
                        node: v,
                        tag: "open".to_string(),
                    }],
                    vec![EdgeStateUpdate {
                        source: u,
                        target: v,
                        tag: "tree".to_string(),
                    }],
                    metrics_from(&[
                        ("current", u_label.clone()),
                        ("visited", visited_count.to_string()),
                        ("queueSize", queue.len().to_string()),
                    ]),
                );
            }
        }

        rec.push(
            3,
            "trace.bfs.closed.title",
            "trace.bfs.closed.msg",
            params_from(&[("node", u_label)]),
            vec![NodeStateUpdate {
                node: u,
                tag: "visited".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("visited", visited_count.to_string()),
                ("queueSize", queue.len().to_string()),
            ]),
        );
    }

    let mut path_nodes = Vec::new();
    let mut path_edges = Vec::new();
    let mut path_len_str = "—".to_string();

    if found_target {
        if let Some(t) = target_node {
            let mut cur = t;
            let mut hops = 0usize;
            path_nodes.push(NodeStateUpdate {
                node: cur,
                tag: "path".to_string(),
            });
            while let Some(p) = parent[cur] {
                path_edges.push(EdgeStateUpdate {
                    source: p,
                    target: cur,
                    tag: "path".to_string(),
                });
                path_nodes.push(NodeStateUpdate {
                    node: p,
                    tag: "path".to_string(),
                });
                cur = p;
                hops += 1;
            }
            path_len_str = hops.to_string();

            rec.push_final(
                5,
                "trace.bfs.found.title",
                "trace.bfs.found.msg",
                params_from(&[
                    ("target", graph.nodes[t].id.clone()),
                    ("hops", path_len_str.clone()),
                ]),
                path_nodes,
                path_edges,
                metrics_from(&[
                    ("visited", visited_count.to_string()),
                    ("pathHops", path_len_str.clone()),
                ]),
            );
        }
    } else {
        rec.push_final(
            9,
            "trace.bfs.done.title",
            "trace.bfs.done.msg",
            params_from(&[("visited", visited_count.to_string())]),
            vec![],
            vec![],
            metrics_from(&[("visited", visited_count.to_string())]),
        );
    }

    let summary = params_from(&[
        ("visited_count", visited_count.to_string()),
        ("found", found_target.to_string()),
        ("path_hops", path_len_str),
    ]);

    Ok(rec.finish("bfs", summary))
}

pub fn trace_dijkstra(
    graph: &Graph,
    start_node: usize,
    target_node: Option<usize>,
    max_steps: usize,
) -> Result<TraceResult, String> {
    let n = graph.nodes.len();
    if n == 0 || start_node >= n {
        return Err("Start node is out of bounds".to_string());
    }
    if let Some(t) = target_node {
        if t >= n {
            return Err("Target node is out of bounds".to_string());
        }
    }

    let mut rec = TraceRecorder::new(max_steps);
    let mut dist = vec![f64::INFINITY; n];
    let mut parent: Vec<Option<usize>> = vec![None; n];
    let mut settled = vec![false; n];
    let mut settled_count = 0usize;

    // `State` already implements reverse ordering in `model.rs`, so `BinaryHeap<State>` is a min-heap.
    let mut heap = BinaryHeap::new();
    dist[start_node] = 0.0;
    heap.push(State {
        cost: 0.0,
        node: start_node,
    });

    let mut init_nodes = vec![NodeStateUpdate {
        node: start_node,
        tag: "open".to_string(),
    }];
    if let Some(t) = target_node {
        if t != start_node {
            init_nodes.push(NodeStateUpdate {
                node: t,
                tag: "target".to_string(),
            });
        }
    }

    rec.push(
        2,
        "trace.dijkstra.init.title",
        "trace.dijkstra.init.msg",
        params_from(&[("start", graph.nodes[start_node].id.clone())]),
        init_nodes,
        vec![],
        metrics_from(&[
            ("settled", "0".to_string()),
            ("heapSize", heap.len().to_string()),
        ]),
    );

    let mut found_target = false;

    while let Some(State {
        cost: current_cost,
        node: u,
    }) = heap.pop()
    {
        if current_cost > dist[u] {
            continue;
        }
        settled[u] = true;
        settled_count += 1;
        let u_label = graph.nodes[u].id.clone();

        rec.push(
            4,
            "trace.dijkstra.pop.title",
            "trace.dijkstra.pop.msg",
            params_from(&[("node", u_label.clone()), ("cost", fmt_num(current_cost))]),
            vec![NodeStateUpdate {
                node: u,
                tag: "current".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("current", u_label.clone()),
                ("currentCost", fmt_num(current_cost)),
                ("settled", settled_count.to_string()),
                ("heapSize", heap.len().to_string()),
            ]),
        );

        if target_node == Some(u) {
            found_target = true;
            break;
        }

        for edge in &graph.adjacency_list[u] {
            let v = edge.target;
            let v_label = graph.nodes[v].id.clone();
            let tentative = current_cost + edge.weight;

            if tentative < dist[v] {
                let prev_dist = fmt_num(dist[v]);
                dist[v] = tentative;
                parent[v] = Some(u);
                heap.push(State {
                    cost: tentative,
                    node: v,
                });

                rec.push(
                    9,
                    "trace.dijkstra.relax.title",
                    "trace.dijkstra.relax.msg",
                    params_from(&[
                        ("u", u_label.clone()),
                        ("v", v_label),
                        ("oldCost", prev_dist),
                        ("newCost", fmt_num(tentative)),
                    ]),
                    vec![NodeStateUpdate {
                        node: v,
                        tag: "open".to_string(),
                    }],
                    vec![EdgeStateUpdate {
                        source: u,
                        target: v,
                        tag: "relaxed".to_string(),
                    }],
                    metrics_from(&[
                        ("current", u_label.clone()),
                        ("settled", settled_count.to_string()),
                        ("heapSize", heap.len().to_string()),
                    ]),
                );
            } else {
                rec.push(
                    7,
                    "trace.dijkstra.skip.title",
                    "trace.dijkstra.skip.msg",
                    params_from(&[
                        ("u", u_label.clone()),
                        ("v", v_label),
                        ("tentative", fmt_num(tentative)),
                        ("best", fmt_num(dist[v])),
                    ]),
                    vec![],
                    vec![EdgeStateUpdate {
                        source: u,
                        target: v,
                        tag: "compare".to_string(),
                    }],
                    metrics_from(&[
                        ("current", u_label.clone()),
                        ("settled", settled_count.to_string()),
                        ("heapSize", heap.len().to_string()),
                    ]),
                );
            }
        }

        rec.push(
            3,
            "trace.dijkstra.settled.title",
            "trace.dijkstra.settled.msg",
            params_from(&[("node", u_label), ("cost", fmt_num(current_cost))]),
            vec![NodeStateUpdate {
                node: u,
                tag: "visited".to_string(),
            }],
            vec![],
            metrics_from(&[
                ("settled", settled_count.to_string()),
                ("heapSize", heap.len().to_string()),
            ]),
        );
    }

    let target_cost_str = target_node
        .map(|t| fmt_num(dist[t]))
        .unwrap_or_else(|| "—".to_string());

    if found_target {
        if let Some(t) = target_node {
            let mut cur = t;
            let mut path_nodes = vec![NodeStateUpdate {
                node: cur,
                tag: "path".to_string(),
            }];
            let mut path_edges = Vec::new();
            while let Some(p) = parent[cur] {
                path_edges.push(EdgeStateUpdate {
                    source: p,
                    target: cur,
                    tag: "path".to_string(),
                });
                path_nodes.push(NodeStateUpdate {
                    node: p,
                    tag: "path".to_string(),
                });
                cur = p;
            }

            rec.push_final(
                6,
                "trace.dijkstra.found.title",
                "trace.dijkstra.found.msg",
                params_from(&[
                    ("target", graph.nodes[t].id.clone()),
                    ("cost", target_cost_str.clone()),
                ]),
                path_nodes,
                path_edges,
                metrics_from(&[
                    ("settled", settled_count.to_string()),
                    ("targetCost", target_cost_str.clone()),
                ]),
            );
        }
    } else {
        rec.push_final(
            10,
            "trace.dijkstra.done.title",
            "trace.dijkstra.done.msg",
            params_from(&[("settled", settled_count.to_string())]),
            vec![],
            vec![],
            metrics_from(&[("settled", settled_count.to_string())]),
        );
    }

    let summary = params_from(&[
        ("settled_count", settled_count.to_string()),
        ("found", found_target.to_string()),
        ("target_cost", target_cost_str),
    ]);

    Ok(rec.finish("dijkstra", summary))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::functions::GraphAnalyze;

    fn sample_weighted_graph() -> Graph {
        let mut g = Graph::new(false);
        for id in ["A", "B", "C", "D"] {
            g.add_node(id);
        }
        g.add_edge("A".into(), "B".into(), 1.0);
        g.add_edge("B".into(), "C".into(), 2.0);
        g.add_edge("A".into(), "C".into(), 10.0);
        g.add_edge("C".into(), "D".into(), 1.0);
        g
    }

    #[test]
    fn test_trace_conductance_exact_and_truncated() {
        let g = sample_weighted_graph();
        let res = trace_conductance(&g, &[0, 1], 500);
        assert_eq!(res.algorithm, "conductance");
        assert!(!res.truncated);
        assert_eq!(res.summary.get("cut_edge_count").unwrap(), "2");

        let small = trace_conductance(&g, &[0, 1], 3);
        assert!(small.truncated);
        assert_eq!(small.steps.len(), 3);
        assert_eq!(small.summary.get("cut_edge_count").unwrap(), "2");
    }

    #[test]
    fn test_trace_bfs_path() {
        let g = sample_weighted_graph();
        let res = trace_bfs(&g, 0, Some(3), 500).unwrap();
        assert_eq!(res.summary.get("found").unwrap(), "true");
        assert_eq!(res.summary.get("path_hops").unwrap(), "2");
    }

    #[test]
    fn test_trace_dijkstra_shortest_weighted_path() {
        let g = sample_weighted_graph();
        let res = trace_dijkstra(&g, 0, Some(3), 500).unwrap();
        assert_eq!(res.summary.get("found").unwrap(), "true");
        // A -> B (1) -> C (2) -> D (1) = 4, cheaper than A -> C (10) -> D (1) = 11
        assert_eq!(res.summary.get("target_cost").unwrap(), "4");
    }

    #[test]
    fn test_graph_stats_undirected() {
        let g = sample_weighted_graph();
        let stats = compute_graph_stats(&g);
        assert_eq!(stats.node_count, 4);
        assert_eq!(stats.edge_count, 4);
        assert!((stats.average_degree - 2.0).abs() < 1e-9);
        assert!(stats.is_connected);
        assert_eq!(stats.component_count, 1);
        assert!(stats.has_cycle);
    }
}
