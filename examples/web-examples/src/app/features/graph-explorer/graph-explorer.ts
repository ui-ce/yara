import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import { WasmGraphService } from '../../core/services/wasm-graph.service';
import { EdgeDto, GraphSnapshot } from '../../core/models/graph-engine.model';

const MAX_RENDER_NODES = 250;
const MAX_RENDER_EDGES = 800;

const SAMPLE_GRAPH = `# Sample weighted graph
source, target, weight
Tehran, Isfahan, 450
Isfahan, Shiraz, 480
Tehran, Mashhad, 900
Mashhad, Shiraz, 1200
`;

interface GraphViewData {
  snap: GraphSnapshot;
  isTruncated: boolean;
  visibleNodes: string[];
  visibleEdges: EdgeDto[];
}

@Component({
  selector: 'app-graph-explorer',
  standalone: true,
  templateUrl: './graph-explorer.html',
  styleUrl: './graph-explorer.scss',
})
export class GraphExplorerPage implements OnDestroy {
  readonly graphService = inject(WasmGraphService);
  private readonly cyContainer = viewChild<ElementRef<HTMLDivElement>>('cyContainer');
  private cy: Core | null = null;

  readonly fileName = signal<string | null>(null);
  readonly parseTimeMs = signal<number | null>(null);
  readonly isLoading = signal(false);

  readonly viewData = computed<GraphViewData | null>(() => {
    const snap = this.graphService.snapshot();
    if (!snap) return null;

    const isTruncated =
      snap.nodes.length > MAX_RENDER_NODES || snap.edges.length > MAX_RENDER_EDGES;
    const nodeLimit = Math.min(snap.nodes.length, MAX_RENDER_NODES);
    const visibleNodes = snap.nodes.slice(0, nodeLimit);
    const visibleEdges = snap.edges
      .filter((e) => e.source < nodeLimit && e.target < nodeLimit)
      .slice(0, MAX_RENDER_EDGES);

    return { snap, isTruncated, visibleNodes, visibleEdges };
  });

  constructor() {
    effect(() => {
      const data = this.viewData();
      const container = this.cyContainer()?.nativeElement;
      if (data && container) {
        this.renderGraph(container, data);
      }
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isLoading.set(true);
    this.fileName.set(file.name);
    try {
      const text = await file.text();
      const start = performance.now();
      await this.graphService.loadFromText(text);
      this.parseTimeMs.set(Math.round(performance.now() - start));
    } finally {
      this.isLoading.set(false);
      input.value = '';
    }
  }

  async loadSample(): Promise<void> {
    this.isLoading.set(true);
    this.fileName.set('گراف نمونه');
    try {
      const start = performance.now();
      await this.graphService.loadFromText(SAMPLE_GRAPH);
      this.parseTimeMs.set(Math.round(performance.now() - start));
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleDirection(): Promise<void> {
    const snap = this.graphService.snapshot();
    if (!snap) return;

    const start = performance.now();
    await this.graphService.setDirected(!snap.is_directed);
    this.parseTimeMs.set(Math.round(performance.now() - start));
  }

  private renderGraph(container: HTMLDivElement, data: GraphViewData): void {
    this.cy?.destroy();

    const { snap, visibleNodes, visibleEdges } = data;
    const isSmallGraph = visibleNodes.length <= 80;
    const showNodeLabels = visibleNodes.length <= 120;
    const showEdgeWeights = snap.is_weighted && visibleEdges.length <= 150;

    const elements: ElementDefinition[] = [
      ...visibleNodes.map((label, idx) => ({
        data: { id: String(idx), label },
      })),
      ...visibleEdges.map((e, idx) => ({
        data: {
          id: `e-${idx}`,
          source: String(e.source),
          target: String(e.target),
          weight: e.weight,
        },
      })),
    ];

    this.cy = cytoscape({
      container,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            width: isSmallGraph ? 38 : 16,
            height: isSmallGraph ? 38 : 16,
            label: showNodeLabels ? 'data(label)' : '',
            'background-color': '#6366f1',
            'border-width': 2,
            'border-color': '#a5b4fc',
            color: '#f8fafc',
            'text-valign': 'top',
            'text-margin-y': -8,
            'font-size': isSmallGraph ? '13px' : '9px',
            'text-outline-color': '#0b0d14',
            'text-outline-width': 2,
          },
        },
        {
          selector: 'node:selected',
          style: {
            label: 'data(label)',
            'background-color': '#a855f7',
            'border-color': '#f8fafc',
          },
        },
        {
          selector: 'edge',
          style: {
            width: isSmallGraph ? 2.5 : 1,
            'line-color': '#475569',
            'curve-style': visibleEdges.length > 200 ? 'straight' : 'bezier',
            'target-arrow-color': '#818cf8',
            'target-arrow-shape': snap.is_directed ? 'triangle' : 'none',
            'arrow-scale': isSmallGraph ? 1.1 : 0.7,
            label: showEdgeWeights ? 'data(weight)' : '',
            color: '#cbd5e1',
            'font-size': '11px',
            'text-background-color': '#0f121d',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
          },
        },
      ],
      layout: isSmallGraph
        ? {
            name: 'cose',
            animate: false,
            padding: 40,
            nodeRepulsion: () => 12000,
            idealEdgeLength: () => 130,
          }
        : {
            name: 'concentric',
            animate: false,
            padding: 30,
            minNodeSpacing: 24,
          },
    });
  }

  ngOnDestroy(): void {
    this.cy?.destroy();
  }
}
