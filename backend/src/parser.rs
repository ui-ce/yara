use std::{
    collections::{HashMap, HashSet},
    fs,
    io::{Error, ErrorKind},
};

use crate::model::{Edge, Graph, Node};

#[derive(Debug, Clone)]
pub struct ParsedGraph {
    pub nodes: Vec<String>,
    pub raw_edges: Vec<(usize, usize, f64)>,
    pub is_weighted: bool,
    pub suggested_directed: bool,
}

impl ParsedGraph {
    pub fn to_graph(&self, is_directed: bool) -> Graph {
        let mut nodes = Vec::with_capacity(self.nodes.len());
        let mut node_indice = HashMap::with_capacity(self.nodes.len());

        for (idx, name) in self.nodes.iter().enumerate() {
            nodes.push(Node { id: name.clone() });
            node_indice.insert(name.clone(), idx);
        }

        let mut adjacency_list = vec![Vec::new(); self.nodes.len()];
        let mut seen: HashSet<(usize, usize)> = HashSet::new();

        for &(u, v, weight) in &self.raw_edges {
            if is_directed {
                if seen.insert((u, v)) {
                    adjacency_list[u].push(Edge { target: v, weight });
                }
            } else {
                let key = (u.min(v), u.max(v));
                if seen.insert(key) {
                    adjacency_list[u].push(Edge { target: v, weight });
                    if u != v {
                        adjacency_list[v].push(Edge { target: u, weight });
                    }
                }
            }
        }

        Graph {
            nodes,
            node_indice,
            adjacency_list,
            is_directed,
        }
    }
}

fn is_header_pair(a: &str, b: &str) -> bool {
    let headers = [
        "source", "target", "from", "to", "src", "dst", "u", "v", "node1", "node2",
    ];
    headers.contains(&a.to_lowercase().as_str()) && headers.contains(&b.to_lowercase().as_str())
}

pub fn parse_from_str(content: &str) -> Result<ParsedGraph, String> {
    let mut nodes: Vec<String> = Vec::new();
    let mut node_map: HashMap<String, usize> = HashMap::new();
    let mut raw_edges: Vec<(usize, usize, f64)> = Vec::new();
    let mut is_weighted = false;
    let mut first_data_line = true;

    let mut get_or_insert = |name: &str| -> usize {
        if let Some(&idx) = node_map.get(name) {
            idx
        } else {
            let idx = nodes.len();
            nodes.push(name.to_string());
            node_map.insert(name.to_string(), idx);
            idx
        }
    };

    for raw_line in content.lines() {
        let line = raw_line.trim();
        if line.is_empty()
            || line.starts_with('#')
            || line.starts_with('%')
            || line.starts_with("//")
        {
            continue;
        }

        let parts: Vec<&str> = line
            .split(|c: char| c.is_whitespace() || c == ',' || c == ';')
            .filter(|s| !s.is_empty())
            .collect();

        if parts.len() < 2 {
            continue;
        }

        if first_data_line {
            first_data_line = false;
            let third_is_text = parts.len() >= 3 && parts[2].parse::<f64>().is_err();
            if third_is_text || is_header_pair(parts[0], parts[1]) {
                continue;
            }
        }

        let weight = if parts.len() >= 3 {
            match parts[2].parse::<f64>() {
                Ok(w) => {
                    is_weighted = true;
                    w
                }
                Err(_) => continue,
            }
        } else {
            1.0
        };

        let u = get_or_insert(parts[0]);
        let v = get_or_insert(parts[1]);
        raw_edges.push((u, v, weight));
    }

    if raw_edges.is_empty() {
        return Err("No valid edges found in input".to_string());
    }

    let mut edge_map: HashMap<(usize, usize), f64> = HashMap::new();
    for &(u, v, w) in &raw_edges {
        if u != v {
            edge_map.insert((u, v), w);
        }
    }

    let mut symmetric_count = 0usize;
    let mut has_diff_reverse_weight = false;

    for (&(u, v), &w) in &edge_map {
        if let Some(&rev_w) = edge_map.get(&(v, u)) {
            if (w - rev_w).abs() < 1e-9 {
                symmetric_count += 1;
            } else {
                has_diff_reverse_weight = true;
            }
        }
    }

    let suggested_directed =
        has_diff_reverse_weight || (symmetric_count > 0 && symmetric_count < edge_map.len());

    Ok(ParsedGraph {
        nodes,
        raw_edges,
        is_weighted,
        suggested_directed,
    })
}

pub fn parser(path: String) -> Result<Graph, Error> {
    let content = fs::read_to_string(path)?;
    let parsed = parse_from_str(&content).map_err(|msg| Error::new(ErrorKind::InvalidData, msg))?;
    Ok(parsed.to_graph(parsed.suggested_directed))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parser_valid_file() {
        assert!(parser("graph2.txt".to_string()).is_ok());
    }

    #[test]
    fn test_csv_with_header_and_weights() {
        let input = "\
# sample graph
source, target, weight
Tehran, Isfahan, 450.5
Isfahan, Shiraz, 480
";
        let parsed = parse_from_str(input).unwrap();
        assert_eq!(parsed.nodes, vec!["Tehran", "Isfahan", "Shiraz"]);
        assert_eq!(parsed.raw_edges.len(), 2);
        assert!(parsed.is_weighted);
        assert!(!parsed.suggested_directed);
    }

    #[test]
    fn test_undirected_deduplication() {
        let input = "A B\nB A\nB C\n";
        let parsed = parse_from_str(input).unwrap();
        let graph = parsed.to_graph(false);

        assert_eq!(graph.adjacency_list[0].len(), 1);
        assert_eq!(graph.adjacency_list[1].len(), 2);
    }

    #[test]
    fn test_directed_detection_by_asymmetric_weights() {
        let input = "A B 10\nB A 20\n";
        let parsed = parse_from_str(input).unwrap();
        assert!(parsed.suggested_directed);
    }
}
