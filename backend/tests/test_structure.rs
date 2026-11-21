use graph::functions::GraphAnalyze;
use graph::model::Graph;
#[test]
fn test_new_graph() {
    let g = Graph::new(false);
    assert_eq!(g.node_count(), 0);
    assert_eq!(g.edge_count(), 0);
}

#[test]
fn test_add_node_success() {
    let mut g = Graph::new(false);
    let id = "A".to_string();
    let index = g.add_node(&id);

    assert_eq!(index, 0);
    assert_eq!(g.node_count(), 1);
    assert_eq!(g.find_node(&id), Some(0));
}

#[test]
fn test_add_node_duplicate() {
    let mut g = Graph::new(false);
    let id = "A".to_string();

    let index1 = g.add_node(&id);
    let index2 = g.add_node(&id);

    assert_eq!(index1, index2);
    assert_eq!(
        g.node_count(),
        1,
        "Duplicate node should not increase node count"
    );
}

#[test]
fn test_find_node_not_found() {
    let mut g = Graph::new(false);
    let id = "Missing".to_string();
    assert_eq!(g.find_node(&id), None);
}

#[test]
fn test_add_edge_success() {
    let mut g = Graph::new(false);
    let id1 = "A".to_string();
    let id2 = "B".to_string();

    g.add_node(&id1);
    g.add_node(&id2);
    g.add_edge(id1.clone(), id2.clone(), 2.5);

    assert_eq!(g.edge_count(), 1);
}

#[test]
fn test_add_edge_invalid_nodes() {
    let mut g = Graph::new(false);
    g.add_edge("A".to_string(), "B".to_string(), 1.0);
    assert_eq!(g.edge_count(), 0);
}

#[test]
fn test_average_degree() {
    let mut g = Graph::new(false);
    let id1 = "A".to_string();
    let id2 = "B".to_string();
    let id3 = "C".to_string();

    g.add_node(&id1);
    g.add_node(&id2);
    g.add_node(&id3);

    g.add_edge(id1.clone(), id2.clone(), 1.0);
    g.add_edge(id2.clone(), id3.clone(), 1.0);
    g.add_edge(id3.clone(), id1.clone(), 1.0);

    assert!((g.average_degree() - 1.0).abs() < 1e-5);
}
