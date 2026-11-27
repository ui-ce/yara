import type { PseudocodeLine } from '../practice/components/pseudocode-panel/pseudocode-panel.types';
import type { LegendItem } from '../practice/components/visualization-legend/visualization-legend.types';
import type { GraphExplorerAlgorithm } from '../../core/models/graph-engine.model';
import type { Language } from '../../core/services/language.service';
import { translate } from '../../core/i18n/translations';

export const SAMPLE_COMMUNITIES_GRAPH = `# Two dense clusters connected by a single bridge (low conductance)
A B 1
A C 1
A D 1
B C 1
B D 1
C D 1
D E 1
E F 1
E G 1
E H 1
F G 1
F H 1
G H 1
`;

export const SAMPLE_WEIGHTED_GRAPH = `# Weighted graph ideal for BFS, Dijkstra, Prim, and Kruskal
S A 2
S B 6
A B 3
A C 5
B D 1
C D 2
C T 4
D T 1
A E 1
E T 10
`;

export const SAMPLE_DISCONNECTED_GRAPH = `# Three disconnected components for Components & Kruskal Forest
A B 2
B C 3
C A 4
D E 1
E F 5
G H 2
H I 1
I J 3
`;

export const ALGORITHM_PSEUDOCODE: Record<GraphExplorerAlgorithm, PseudocodeLine[]> = {
  conductance: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'conductance(G, S):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [
        { text: 'volS = ', kind: 'plain' },
        { text: '0', kind: 'number' },
        { text: ', cut = ', kind: 'plain' },
        { text: '0', kind: 'number' },
      ],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: 'u ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'S:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: '(v, w) ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[u]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 5,
      indentLevel: 3,
      tokens: [{ text: 'volS += w', kind: 'plain' }],
    },
    {
      lineNumber: 6,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'v not in S: ', kind: 'plain' },
        { text: 'cut += w', kind: 'plain' },
      ],
    },
    {
      lineNumber: 7,
      indentLevel: 1,
      tokens: [{ text: 'minVol = min(volS, totalVol - volS)', kind: 'plain' }],
    },
    {
      lineNumber: 8,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'cut / minVol', kind: 'plain' },
      ],
    },
  ],
  bfs: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'bfs(G, start, target):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [{ text: 'queue = [start], visited = {start}', kind: 'plain' }],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'while ', kind: 'keyword' },
        { text: 'queue not empty:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [{ text: 'u = queue.popFront()', kind: 'plain' }],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'u == target: ', kind: 'plain' },
        { text: 'return ', kind: 'keyword' },
        { text: 'reconstructPath(u)', kind: 'plain' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 2,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: 'v ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[u]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 7,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'v not in visited:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 8,
      indentLevel: 4,
      tokens: [{ text: 'visited.add(v), parent[v] = u, queue.push(v)', kind: 'plain' }],
    },
    {
      lineNumber: 9,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'visited', kind: 'plain' },
      ],
    },
  ],
  dijkstra: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'dijkstra(G, start, target):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [
        { text: 'dist[start] = ', kind: 'plain' },
        { text: '0', kind: 'number' },
        { text: ', heap = [(', kind: 'plain' },
        { text: '0', kind: 'number' },
        { text: ', start)]', kind: 'plain' },
      ],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'while ', kind: 'keyword' },
        { text: 'heap not empty:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [{ text: '(cost, u) = heap.popMin()', kind: 'plain' }],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'cost > dist[u]: ', kind: 'plain' },
        { text: 'continue', kind: 'keyword' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'u == target: ', kind: 'plain' },
        { text: 'return ', kind: 'keyword' },
        { text: 'reconstructPath(u)', kind: 'plain' },
      ],
    },
    {
      lineNumber: 7,
      indentLevel: 2,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: '(v, w) ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[u]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 8,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'cost + w < dist[v]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 9,
      indentLevel: 4,
      tokens: [{ text: 'dist[v] = cost + w, heap.push((dist[v], v))', kind: 'plain' }],
    },
    {
      lineNumber: 10,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'dist', kind: 'plain' },
      ],
    },
  ],
  dfs_cycle: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'dfsCycle(G, start):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [{ text: 'state[start] = VISITING, stack = [start]', kind: 'plain' }],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'while ', kind: 'keyword' },
        { text: 'stack not empty:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [{ text: 'u = stack.top()', kind: 'plain' }],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: 'v ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[u]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'backEdge(u, v): ', kind: 'plain' },
        { text: 'return ', kind: 'keyword' },
        { text: 'CYCLE', kind: 'plain' },
      ],
    },
    {
      lineNumber: 7,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'state[v] == UNVISITED: stack.push(v)', kind: 'plain' },
      ],
    },
    {
      lineNumber: 8,
      indentLevel: 2,
      tokens: [{ text: 'state[u] = VISITED, stack.pop()', kind: 'plain' }],
    },
    {
      lineNumber: 9,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'NO_CYCLE', kind: 'plain' },
      ],
    },
  ],
  components: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'connectedComponents(G):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [
        { text: 'visited = {}, count = ', kind: 'plain' },
        { text: '0', kind: 'number' },
      ],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: 'start ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'V:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'start in visited: ', kind: 'plain' },
        { text: 'continue', kind: 'keyword' },
      ],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'count += ', kind: 'plain' },
        { text: '1', kind: 'number' },
        { text: ', queue = [start]', kind: 'plain' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 2,
      tokens: [
        { text: 'while ', kind: 'keyword' },
        { text: 'queue not empty:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 7,
      indentLevel: 3,
      tokens: [{ text: 'u = queue.popFront()', kind: 'plain' }],
    },
    {
      lineNumber: 8,
      indentLevel: 3,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: 'unvisited v ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[u]: mark(v, count)', kind: 'plain' },
      ],
    },
    {
      lineNumber: 9,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'count', kind: 'plain' },
      ],
    },
  ],
  prim: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'primMST(G, start):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [{ text: 'inMST = {start}, heap = edges(start)', kind: 'plain' }],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [
        { text: 'while ', kind: 'keyword' },
        { text: 'heap not empty:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 4,
      indentLevel: 2,
      tokens: [{ text: '(u, v, w) = heap.popMin()', kind: 'plain' }],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'v in inMST: ', kind: 'plain' },
        { text: 'continue', kind: 'keyword' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 2,
      tokens: [{ text: 'inMST.add(v), mst.add((u, v, w))', kind: 'plain' }],
    },
    {
      lineNumber: 7,
      indentLevel: 2,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: '(next, w2) ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'adj[v]:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 8,
      indentLevel: 3,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'next not in inMST: heap.push((v, next, w2))', kind: 'plain' },
      ],
    },
    {
      lineNumber: 9,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'mst', kind: 'plain' },
      ],
    },
  ],
  kruskal: [
    {
      lineNumber: 1,
      indentLevel: 0,
      tokens: [
        { text: 'function ', kind: 'keyword' },
        { text: 'kruskalMST(G):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 2,
      indentLevel: 1,
      tokens: [{ text: 'edges = sortByWeight(E), dsu = DSU(V)', kind: 'plain' }],
    },
    {
      lineNumber: 3,
      indentLevel: 1,
      tokens: [{ text: 'mst = []', kind: 'plain' }],
    },
    {
      lineNumber: 4,
      indentLevel: 1,
      tokens: [
        { text: 'for ', kind: 'keyword' },
        { text: '(u, v, w) ', kind: 'plain' },
        { text: 'in ', kind: 'keyword' },
        { text: 'edges:', kind: 'plain' },
      ],
    },
    {
      lineNumber: 5,
      indentLevel: 2,
      tokens: [
        { text: 'if ', kind: 'keyword' },
        { text: 'dsu.union(u, v):', kind: 'plain' },
      ],
    },
    {
      lineNumber: 6,
      indentLevel: 3,
      tokens: [{ text: 'mst.add((u, v, w))', kind: 'plain' }],
    },
    {
      lineNumber: 7,
      indentLevel: 2,
      tokens: [
        { text: 'else', kind: 'keyword' },
        { text: ': reject (creates cycle)', kind: 'plain' },
      ],
    },
    {
      lineNumber: 8,
      indentLevel: 1,
      tokens: [
        { text: 'return ', kind: 'keyword' },
        { text: 'mst', kind: 'plain' },
      ],
    },
  ],
};

export function getLegendForAlgorithm(
  algorithm: GraphExplorerAlgorithm,
  lang: Language,
): LegendItem[] {
  switch (algorithm) {
    case 'conductance':
      return [
        { label: translate('graphExplorer.legend.subset', lang), colorToken: 'viz-sorted' },
        { label: translate('graphExplorer.legend.current', lang), colorToken: 'viz-active' },
        { label: translate('graphExplorer.legend.cut', lang), colorToken: 'viz-swapping' },
        { label: translate('graphExplorer.legend.internal', lang), colorToken: 'viz-explored' },
      ];
    case 'bfs':
      return [
        { label: translate('graphExplorer.legend.current', lang), colorToken: 'viz-active' },
        { label: translate('graphExplorer.legend.open', lang), colorToken: 'viz-comparing' },
        { label: translate('graphExplorer.legend.visited', lang), colorToken: 'viz-explored' },
        { label: translate('graphExplorer.legend.path', lang), colorToken: 'viz-sorted' },
      ];
    case 'dijkstra':
      return [
        { label: translate('graphExplorer.legend.current', lang), colorToken: 'viz-active' },
        { label: translate('graphExplorer.legend.open', lang), colorToken: 'viz-comparing' },
        { label: translate('graphExplorer.legend.relaxed', lang), colorToken: 'viz-updated' },
        { label: translate('graphExplorer.legend.visited', lang), colorToken: 'viz-explored' },
        { label: translate('graphExplorer.legend.path', lang), colorToken: 'viz-sorted' },
      ];
    case 'dfs_cycle':
      return [
        { label: translate('graphExplorer.legend.current', lang), colorToken: 'viz-active' },
        { label: translate('graphExplorer.legend.open', lang), colorToken: 'viz-comparing' },
        { label: translate('graphExplorer.legend.visited', lang), colorToken: 'viz-explored' },
        { label: translate('graphExplorer.legend.cycle', lang), colorToken: 'viz-swapping' },
      ];
    case 'components':
      return [
        { label: translate('graphExplorer.legend.comp0', lang), colorToken: 'viz-active' },
        { label: translate('graphExplorer.legend.comp1', lang), colorToken: 'viz-sorted' },
        { label: translate('graphExplorer.legend.comp2', lang), colorToken: 'viz-comparing' },
        { label: translate('graphExplorer.legend.comp3', lang), colorToken: 'viz-explored' },
      ];
    case 'prim':
      return [
        { label: translate('graphExplorer.legend.mst', lang), colorToken: 'viz-sorted' },
        { label: translate('graphExplorer.legend.frontier', lang), colorToken: 'viz-comparing' },
        { label: translate('graphExplorer.legend.rejected', lang), colorToken: 'viz-swapping' },
      ];
    case 'kruskal':
      return [
        { label: translate('graphExplorer.legend.mst', lang), colorToken: 'viz-sorted' },
        { label: translate('graphExplorer.legend.rejected', lang), colorToken: 'viz-swapping' },
      ];
  }
}
