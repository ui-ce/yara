use graph::functions::GraphAnalyze;
use graph::model::Graph;
use std::collections::HashSet;

fn build_weighted_graph() -> Graph {
    let mut g = Graph::new(false);
    for i in 0..4 {
        g.add_node(&i.to_string());
    }

    g.add_edge("0".to_string(), "1".to_string(), 1.0);
    g.add_edge("0".to_string(), "2".to_string(), 4.0);
    g.add_edge("1".to_string(), "2".to_string(), 2.0);
    g.add_edge("2".to_string(), "3".to_string(), 1.0);
    g
}

#[test]
fn test_dijkstra_normal() {
    let g = build_weighted_graph();
    let result = g.dijkstra(0);

    assert_eq!(result[0], (0, 0.0));
    assert_eq!(result[1], (1, 1.0));
    assert_eq!(result[2], (2, 3.0));
    assert_eq!(result[3], (3, 4.0));
}

#[test]
fn test_dijkstra_unreachable() {
    let mut g = build_weighted_graph();
    g.add_node("4");

    let result = g.dijkstra(0);
    assert_eq!(result[4].1, f64::INFINITY);
}

#[test]
fn test_conductance_empty_set() {
    let g = build_weighted_graph();
    let s = HashSet::new();

    assert_eq!(g.calculate_conductance(&s), 0.0);
}

#[test]
fn test_conductance_full_set() {
    let g = build_weighted_graph();
    let mut s = HashSet::new();
    for i in 0..g.node_count() {
        s.insert(i);
    }

    assert_eq!(g.calculate_conductance(&s), 0.0);
}

#[test]
fn test_conductance_bridge_case() {
    let mut g = Graph::new(false);
    for i in 0..4 {
        g.add_node(&i.to_string());
    }

    g.add_edge("0".to_string(), "1".to_string(), 1.0);

    g.add_edge("2".to_string(), "3".to_string(), 1.0);

    g.add_edge("1".to_string(), "2".to_string(), 1.0);

    let mut s = HashSet::new();
    s.insert(0);
    s.insert(1);

    let cond = g.calculate_conductance(&s);
    assert!((cond - (1.0 / 3.0)).abs() < 1e-5);
}
#[test]
fn test_prim_mst_simple() {
    let mut g = Graph::new(false);

    g.add_node("A");
    g.add_node("B");
    g.add_node("C");
    g.add_node("D");

    g.add_edge("A".to_string(), "B".to_string(), 1.0);
    g.add_edge("B".to_string(), "C".to_string(), 2.0);
    g.add_edge("C".to_string(), "D".to_string(), 3.0);
    g.add_edge("A".to_string(), "C".to_string(), 4.0);

    let mst = g.prim(0);

    let mut total_weight = 0.0;
    for edge in &mst {
        total_weight += edge.weight;
    }
    println!("{:#?}", mst);
    assert_eq!(mst.len(), 3);

    assert!((total_weight - 6.0).abs() < 1e-5);
}
