use graph::functions::GraphAnalyze;
use graph::model::Graph;
use std::collections::HashSet;
use std::io::{self, Write};
use text_io::read;

fn main() {
    println!("=============================================");
    println!("🚀 Welcome to Graph Analyzer Engine (Rust) 🚀");
    println!("=============================================");
    print!("Is your graph Directed? (y/n): ");
    io::stdout().flush().unwrap();

    let is_dir_str: String = read!();
    let is_directed = is_dir_str.trim().to_lowercase() == "y";

    let mut my_graph = Graph::new(is_directed);
    let graph_type = if is_directed {
        "Directed"
    } else {
        "Undirected"
    };
    println!("✅ {} Graph initialized successfully!\n", graph_type);

    loop {
        println!("\n========== MAIN MENU ==========");
        println!("1. Add Node");
        println!("2. Add Edge");
        println!("3. Load Graph from File (e.g., SNAP datasets)");
        println!("4. Show Graph Stats (Nodes, Edges, Avg Degree)");
        println!("5. Check if Graph is Connected");
        println!("6. Count Connected Components");
        println!("7. Check for Cycles");
        println!("8. Find Shortest Path (Dijkstra/BFS)");
        println!("9. Calculate Conductance (رسانایی)");
        println!("10. Find Minimum Spanning Tree (Kruskal)");
        println!("0. Exit");
        println!("===============================");

        print!("Select an option (0-10): ");
        io::stdout().flush().unwrap();

        let choice_str: String = read!();
        let choice = match choice_str.trim().parse::<u32>() {
            Ok(num) => num,
            Err(_) => {
                println!("❌ Invalid input. Please enter a number.");
                continue;
            }
        };

        match choice {
            1 => {
                print!("Enter Node ID (String): ");
                io::stdout().flush().unwrap();
                let id: String = read!();
                my_graph.add_node(&id);
                println!("✅ Node '{}' added successfully.", id);
            }
            2 => {
                print!("Enter Source Node ID: ");
                io::stdout().flush().unwrap();
                let source: String = read!();

                print!("Enter Target Node ID: ");
                io::stdout().flush().unwrap();
                let target: String = read!();

                print!("Enter Edge Weight (default is 1.0): ");
                io::stdout().flush().unwrap();
                let weight_str: String = read!();
                let weight = weight_str.trim().parse::<f64>().unwrap_or(1.0);

                my_graph.add_edge(source, target, weight);
                println!("✅ Edge added successfully.");
            }
            3 => {
                print!("Enter file path (e.g., data/p2p-Gnutella08.txt): ");
                io::stdout().flush().unwrap();
                let path: String = read!();
                println!("⏳ Loading graph, please wait...");
                match Graph::load_from_file(&path) {
                    Ok(loaded_graph) => {
                        my_graph = loaded_graph;
                        println!("✅ Graph loaded successfully from '{}'", path);
                        println!(
                            "📊 Nodes: {}, Edges: {}",
                            my_graph.node_count(),
                            my_graph.edge_count()
                        );
                    }
                    Err(e) => println!("❌ Error loading file: {}", e),
                }
            }
            4 => {
                println!("📊 Nodes: {}", my_graph.node_count());
                println!("📊 Edges: {}", my_graph.edge_count());
                println!("📊 Average Degree: {:.2}", my_graph.average_degree());
            }
            5 => {
                if my_graph.node_count() == 0 {
                    println!("⚠️ Graph is empty!");
                } else {
                    print!("Enter starting Node index (usize): ");
                    io::stdout().flush().unwrap();
                    let start_node: usize = read!();
                    let connected = my_graph.is_connected(start_node);
                    println!("🔗 Is Connected? {}", connected);
                }
            }
            6 => {
                if my_graph.node_count() == 0 {
                    println!("⚠️ Graph is empty!");
                } else {
                    let count = my_graph.count_components();
                    println!("🏝️ Number of Connected Components: {}", count);
                }
            }
            7 => {
                if my_graph.node_count() == 0 {
                    println!("⚠️ Graph is empty!");
                } else {
                    print!("Enter starting Node index (usize) for cycle check: ");
                    io::stdout().flush().unwrap();
                    let start_node: usize = read!();
                    let has_cycle = my_graph.have_cycle(start_node);
                    println!("🔄 Has Cycle? {}", has_cycle);
                }
            }
            8 => {
                print!("Enter starting Node index (usize): ");
                io::stdout().flush().unwrap();
                let start_node: usize = read!();

                print!("Enter target Node index (usize): ");
                io::stdout().flush().unwrap();
                let target_node: usize = read!();

                match my_graph.shortest_path(start_node, target_node) {
                    Some(path) => println!("🗺️ Shortest Path: {:?}", path),
                    None => println!(
                        "⚠️ No path found between {} and {}.",
                        start_node, target_node
                    ),
                }
            }
            9 => {
                if my_graph.node_count() == 0 {
                    println!("⚠️ Graph is empty! Please load a graph first.");
                } else {
                    print!("How many nodes in your subset (Set S)? ");
                    io::stdout().flush().unwrap();
                    let count_str: String = read!();
                    let count = count_str.trim().parse::<usize>().unwrap_or(0);

                    let mut s = HashSet::new();

                    print!(
                        "Do you want to auto-select the first {} nodes? (y/n): ",
                        count
                    );
                    io::stdout().flush().unwrap();
                    let auto_select: String = read!();

                    if auto_select.trim().to_lowercase() == "y" {
                        for i in 0..count.min(my_graph.node_count()) {
                            s.insert(i);
                        }
                        println!("✅ Auto-selected first {} nodes.", s.len());
                    } else {
                        for i in 0..count {
                            print!("Enter Node Index {}/{}: ", i + 1, count);
                            io::stdout().flush().unwrap();
                            let node_idx: usize = read!();
                            s.insert(node_idx);
                        }
                    }

                    if !s.is_empty() {
                        let conductance = my_graph.calculate_conductance(&s);
                        println!("🧮 Conductance of the given set: {:.6}", conductance);
                        if conductance < 0.3 {
                            println!(
                                "💡 This is a strong cluster! (Low conductance means few edges leave the set)"
                            );
                        } else {
                            println!(
                                "💡 This is a weak cluster. (High conductance means many edges leave the set)"
                            );
                        }
                    }
                }
            }
            10 => {
                if my_graph.node_count() == 0 {
                    println!("⚠️ Graph is empty!");
                } else {
                    println!("⏳ Calculating Minimum Spanning Tree using Kruskal...");
                    let start_time = std::time::Instant::now();
                    let mst = my_graph.kruskal();
                    let duration = start_time.elapsed();

                    let total_mst_weight: f64 = mst.iter().map(|e| e.weight).sum();
                    println!("✅ MST generated in {:?}", duration);
                    println!("🌳 MST Edge Count: {}", mst.len());
                    println!("⚖️ MST Total Weight: {}", total_mst_weight);
                }
            }
            0 => {
                println!("Exiting the Graph Analyzer. Goodbye! 👋");
                break;
            }
            _ => println!("❌ Invalid choice. Please try again."),
        }
    }
}
