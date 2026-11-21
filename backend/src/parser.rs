use std::{
    collections::HashMap,
    fs::File,
    io::{BufRead, BufReader, Error},
};

use crate::model::{Edge, Graph};
pub fn parser(path: String) -> Result<Graph, Error> {
    let file = File::open(path)?;
    let buf = BufReader::new(file);

    let mut indexes = Vec::new();

    for line in buf.lines() {
        let line = line?;

        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();

        let source = match parts[0].parse() {
            Ok(numb) => numb,
            Err(_) => continue,
        };

        let target = match parts[1].parse() {
            Ok(numb) => numb,
            Err(_) => continue,
        };

        indexes.push((source, target));
    }
    let max_id = indexes
        .iter()
        .flat_map(|&(source, target)| [source, target])
        .max()
        .unwrap_or(0);

    let mut list = vec![Vec::new(); max_id + 1];

    for (source, target) in indexes {
        let edge = Edge {
            target,
            weight: 1.0,
        };
        list[source].push(edge);
    }

    let graph = Graph {
        nodes: Vec::new(),
        node_indice: HashMap::new(),
        adjacency_list: list,
        is_directed: false,
    };
    Ok(graph)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parser_valid_file() {
        assert!(parser("graph2.txt".to_string()).is_ok());
    }
}
