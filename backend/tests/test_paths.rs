use graph::functions::GraphAnalyze;
use graph::model::Graph;

fn build_simple_graph() -> Graph {
    let mut g = Graph::new(false);
    for i in 0..4 {
        g.add_node(&i.to_string());
    }
    g.add_edge("0".to_string(), "1".to_string(), 1.0);
    g.add_edge("1".to_string(), "2".to_string(), 1.0);
    g.add_edge("2".to_string(), "3".to_string(), 1.0);
    g
}

#[test]
fn test_is_connected_true() {
    let g = build_simple_graph();
    assert!(g.is_connected(0));
}

#[test]
fn test_is_connected_false() {
    let mut g = build_simple_graph();
    g.add_node("4");
    assert!(!g.is_connected(0));
}

#[test]
fn test_is_connected_empty_graph() {
    let g = Graph::new(false);
    assert!(!g.is_connected(0));
}

#[test]
fn test_have_cycle_false() {
    let g = build_simple_graph();
    assert!(!g.have_cycle(0));
}

#[test]
fn test_have_cycle_true() {
    let mut g = build_simple_graph();
    g.add_edge("3".to_string(), "0".to_string(), 1.0);
    assert!(g.have_cycle(0));
}

#[test]
fn test_shortest_path_exists() {
    let g = build_simple_graph();
    let path = g.shortest_path(0, 3);
    assert_eq!(path, Some(vec![0, 1, 2, 3]));
}

#[test]
fn test_shortest_path_same_node() {
    let g = build_simple_graph();
    let path = g.shortest_path(2, 2);
    assert_eq!(path, Some(vec![2]));
}

#[test]
fn test_shortest_path_unreachable() {
    let mut g = build_simple_graph();
    g.add_node("4");
    let path = g.shortest_path(0, 4);
    assert_eq!(path, None);
}

#[test]
fn test_count_components() {
    let mut g = Graph::new(false);
    g.add_node("0");
    g.add_node("1");
    g.add_node("2");
    g.add_node("3");

    g.add_edge("0".to_string(), "1".to_string(), 1.0);
    g.add_edge("2".to_string(), "3".to_string(), 1.0);

    assert_eq!(g.count_components(), 2);
}
