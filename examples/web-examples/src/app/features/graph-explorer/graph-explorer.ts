import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import cytoscape, { Core } from 'cytoscape';
import { SolarChartLinear, SolarDownloadLinear } from '@solar-icons/angular';

import { AlgoHeader } from '../../layout/header/header';
import type { BreadcrumbItem } from '../../layout/header/header-breadcrumb.type';
import { AlgoDrawer } from '../../design-system/drawer/drawer';
import { AlgoDrawerIconButton } from '../../design-system/drawer-icon-button/drawer-icon-button';
import { AlgoButton } from '../../design-system/button/button';
import { AlgoSegmentedButton } from '../../design-system/segmented-button/segmented-button';
import { AlgoSpeedButton } from '../../design-system/speed-button/speed-button';
import { NavigationControls } from '../practice/components/navigation-controls/navigation-controls';
import { PseudocodeSection } from '../practice/components/pseudocode-section/pseudocode-section';
import { VisualizationLegend } from '../practice/components/visualization-legend/visualization-legend';
import type { PseudocodeLine } from '../practice/components/pseudocode-panel/pseudocode-panel.types';
import type { LegendItem } from '../practice/components/visualization-legend/visualization-legend.types';

import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { translate } from '../../core/i18n/translations';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { WasmGraphService } from '../../core/services/wasm-graph.service';
import type {
  GraphExplorerAlgorithm,
  GraphSnapshot,
  TraceResult,
  TraceStep,
} from '../../core/models/graph-engine.model';
import {
  ALGORITHM_PSEUDOCODE,
  SAMPLE_COMMUNITIES_GRAPH,
  SAMPLE_WEIGHTED_GRAPH,
  getLegendForAlgorithm,
} from './graph-explorer.data';

const ALGORITHMS: readonly GraphExplorerAlgorithm[] = ['conductance', 'bfs', 'dijkstra'];
const FULL_RENDER_NODE_LIMIT = 300;
const PREVIEW_NODE_LIMIT = 120;
const PREVIEW_EDGE_LIMIT = 350;
const TRACE_MAX_STEPS = 500;
const NODE_TAGS = ['subset', 'current', 'open', 'visited', 'target', 'path'] as const;
const EDGE_TAGS = ['cut', 'internal', 'tree', 'relaxed', 'compare', 'path'] as const;

type DrawerSection = 'data' | 'stats' | null;
type CanvasPickMode = 'start' | 'target';

@Component({
  selector: 'app-graph-explorer',
  standalone: true,
  imports: [
    CommonModule,
    AlgoHeader,
    AlgoDrawer,
    AlgoDrawerIconButton,
    AlgoButton,
    AlgoSegmentedButton,
    AlgoSpeedButton,
    NavigationControls,
    PseudocodeSection,
    VisualizationLegend,
    SolarChartLinear,
    SolarDownloadLinear,
    TranslatePipe,
  ],
  templateUrl: './graph-explorer.html',
  styleUrl: './graph-explorer.scss',
})
export class GraphExplorerPage implements OnInit, OnDestroy {
  @ViewChild('cyContainer', { static: false }) cyContainer?: ElementRef<HTMLDivElement>;

  protected readonly wasm = inject(WasmGraphService);
  protected readonly themeService = inject(ThemeService);
  protected readonly languageService = inject(LanguageService);

  private cy: Core | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private needsInitialFit = false;
  private edgeLookup = new Map<string, string[]>();
  private playTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly activeDrawerSection = signal<DrawerSection>('data');
  protected readonly selectedAlgorithmIndex = signal<number>(0);
  protected readonly selectedNodes = signal<Set<number>>(new Set());
  protected readonly startNode = signal<number>(0);
  protected readonly targetNode = signal<number | null>(null);
  protected readonly canvasPickMode = signal<CanvasPickMode>('start');

  protected readonly traceResult = signal<TraceResult | null>(null);
  protected readonly currentStepIndex = signal<number>(0);
  protected readonly isPlaying = signal<boolean>(false);
  protected readonly speed = signal<number>(1);
  protected readonly lastComputeMs = signal<number | null>(null);
  protected readonly isLargeGraph = signal<boolean>(false);
  protected readonly previewNodeCount = signal<number>(0);

  protected readonly activeAlgorithm = computed<GraphExplorerAlgorithm>(
    () => ALGORITHMS[this.selectedAlgorithmIndex()] ?? 'conductance',
  );

  protected readonly currentStep = computed<TraceStep | null>(() => {
    const trace = this.traceResult();
    if (!trace || trace.steps.length === 0) return null;
    const idx = Math.min(Math.max(this.currentStepIndex(), 0), trace.steps.length - 1);
    return trace.steps[idx];
  });

  protected readonly totalSteps = computed<number>(() => this.traceResult()?.steps.length ?? 0);

  protected readonly pseudocodeLines = computed<PseudocodeLine[]>(
    () => ALGORITHM_PSEUDOCODE[this.activeAlgorithm()],
  );

  protected readonly activeLineNumber = computed<number | null>(
    () => this.currentStep()?.line ?? null,
  );

  protected readonly legendItems = computed<LegendItem[]>(() =>
    getLegendForAlgorithm(this.activeAlgorithm(), this.languageService.currentLanguage()),
  );

  protected readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const lang = this.languageService.currentLanguage();
    return [
      { label: translate('practice.breadcrumb.home', lang), route: '/' },
      { label: translate('practice.breadcrumb.algorithms', lang), route: '/home' },
      { label: translate('graphExplorer.title', lang), route: '' },
    ];
  });

  protected readonly algorithmTabs = computed<string[]>(() => {
    const lang = this.languageService.currentLanguage();
    return [
      translate('graphExplorer.algo.conductance', lang),
      translate('graphExplorer.algo.bfs', lang),
      translate('graphExplorer.algo.dijkstra', lang),
    ];
  });

  protected readonly drawerPanelTitle = computed<string>(() => {
    const lang = this.languageService.currentLanguage();
    const section = this.activeDrawerSection();
    if (section === 'data') return translate('graphExplorer.drawer.data', lang);
    if (section === 'stats') return translate('graphExplorer.drawer.stats', lang);
    return '';
  });

  protected readonly explanationTitle = computed<string>(() => {
    const lang = this.languageService.currentLanguage();
    const step = this.currentStep();
    if (!step) return translate('graphExplorer.playback.readyTitle', lang);
    return this.interpolate(translate(step.title_key, lang), step.params);
  });

  protected readonly explanationDescription = computed<string>(() => {
    const lang = this.languageService.currentLanguage();
    const step = this.currentStep();
    if (!step) return translate('graphExplorer.playback.readyDesc', lang);
    return this.interpolate(translate(step.message_key, lang), step.params);
  });

  protected readonly activeMetrics = computed<{ label: string; value: string }[]>(() => {
    const lang = this.languageService.currentLanguage();
    const step = this.currentStep();
    if (!step) return [];
    return step.metrics.map((m) => ({
      label: translate(`graphExplorer.metric.${m.key}`, lang),
      value: m.value,
    }));
  });

  constructor() {
    effect(() => {
      this.themeService.themeMode();
      untracked(() => {
        if (this.cy) {
          this.cy.style(this.buildCytoscapeStyle());
        }
      });
    });
  }

  async ngOnInit(): Promise<void> {
    const existing = this.wasm.snapshot();
    if (existing) {
      const large = existing.nodes.length > FULL_RENDER_NODE_LIMIT;
      this.handleSnapshotChanged(existing, !large);
      if (this.activeAlgorithm() === 'conductance' && this.selectedNodes().size === 0) {
        this.selectFirstHalf(false);
      }
      this.runTrace();
    } else {
      await this.loadSample('communities');
    }
  }

  ngOnDestroy(): void {
    this.stopPlayback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.cy?.destroy();
    this.cy = null;
  }

  protected toggleDrawerSection(section: Exclude<DrawerSection, null>): void {
    this.activeDrawerSection.set(this.activeDrawerSection() === section ? null : section);
    setTimeout(() => {
      this.cy?.resize();
      this.cy?.fit(undefined, 32);
    }, 220);
  }

  protected closeDrawer(): void {
    this.activeDrawerSection.set(null);
    setTimeout(() => {
      this.cy?.resize();
      this.cy?.fit(undefined, 32);
    }, 220);
  }

  protected async loadSample(kind: 'communities' | 'weighted'): Promise<void> {
    this.stopPlayback();
    const text = kind === 'communities' ? SAMPLE_COMMUNITIES_GRAPH : SAMPLE_WEIGHTED_GRAPH;
    await this.wasm.loadFromText(text);
    const snap = this.wasm.snapshot();
    if (!snap) return;

    if (kind === 'communities') {
      this.selectedAlgorithmIndex.set(0);
      this.selectedNodes.set(new Set([0, 1, 2, 3].filter((i) => i < snap.nodes.length)));
    } else {
      this.selectedAlgorithmIndex.set(2);
      this.startNode.set(0);
      this.targetNode.set(snap.nodes.length > 1 ? snap.nodes.length - 1 : null);
    }

    const large = snap.nodes.length > FULL_RENDER_NODE_LIMIT;
    this.handleSnapshotChanged(snap, !large);
    this.runTrace();
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.stopPlayback();
    const text = await file.text();
    await this.wasm.loadFromText(text);
    input.value = '';

    const snap = this.wasm.snapshot();
    if (!snap) return;

    const large = snap.nodes.length > FULL_RENDER_NODE_LIMIT;
    this.handleSnapshotChanged(snap, !large);
    if (this.activeAlgorithm() === 'conductance') {
      this.selectFirstHalf(false);
    }
    this.runTrace();
  }

  protected async onDirectedToggle(event: Event): Promise<void> {
    const checked = (event.target as HTMLInputElement).checked;
    this.stopPlayback();
    await this.wasm.setDirected(checked);
    const snap = this.wasm.snapshot();
    if (!snap) return;

    const large = snap.nodes.length > FULL_RENDER_NODE_LIMIT;
    this.handleSnapshotChanged(snap, !large);
    this.runTrace();
  }

  protected onAlgorithmTabChange(index: number): void {
    this.stopPlayback();
    this.selectedAlgorithmIndex.set(index);
    const snap = this.wasm.snapshot();
    if (snap && index === 0 && this.selectedNodes().size === 0) {
      this.selectFirstHalf(false);
    }
    this.runTrace();
  }

  protected selectFirstHalf(autoTrace = true): void {
    const snap = this.wasm.snapshot();
    if (!snap) return;
    const half = Math.max(1, Math.floor(snap.nodes.length / 2));
    const next = new Set<number>();
    for (let i = 0; i < half; i++) next.add(i);
    this.selectedNodes.set(next);
    if (autoTrace) this.runTrace();
  }

  protected selectRandomQuarter(): void {
    const snap = this.wasm.snapshot();
    if (!snap) return;
    const count = Math.max(1, Math.floor(snap.nodes.length * 0.25));
    const next = new Set<number>();
    while (next.size < count && next.size < snap.nodes.length) {
      next.add(Math.floor(Math.random() * snap.nodes.length));
    }
    this.selectedNodes.set(next);
    this.runTrace();
  }

  protected clearSelection(): void {
    this.stopPlayback();
    this.selectedNodes.set(new Set());
    this.traceResult.set(null);
    this.currentStepIndex.set(0);
    this.clearCanvasHighlights();
  }

  protected onStartNodeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isNaN(value)) {
      this.startNode.set(value);
      this.runTrace();
    }
  }

  protected onTargetNodeChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.targetNode.set(raw === '' ? null : Number(raw));
    this.runTrace();
  }

  protected setCanvasPickMode(mode: CanvasPickMode): void {
    this.canvasPickMode.set(mode);
  }

  protected runTrace(): void {
    this.stopPlayback();
    const snap = this.wasm.snapshot();
    if (!snap || snap.nodes.length === 0) return;

    const algo = this.activeAlgorithm();
    let output: { result: TraceResult; timeMs: number } | null = null;

    if (algo === 'conductance') {
      const indices = Array.from(this.selectedNodes());
      if (indices.length === 0) {
        this.traceResult.set(null);
        this.currentStepIndex.set(0);
        this.clearCanvasHighlights();
        return;
      }
      output = this.wasm.traceConductance(indices, TRACE_MAX_STEPS);
    } else if (algo === 'bfs') {
      output = this.wasm.traceBfs(this.startNode(), this.targetNode(), TRACE_MAX_STEPS);
    } else {
      output = this.wasm.traceDijkstra(this.startNode(), this.targetNode(), TRACE_MAX_STEPS);
    }

    if (!output) return;
    this.traceResult.set(output.result);
    this.lastComputeMs.set(output.timeMs);
    this.currentStepIndex.set(0);

    if (this.isLargeGraph() || !this.cy) {
      this.renderWhenReady(snap, output.result);
    } else {
      this.applyTraceStep(0);
    }
  }

  protected onPrevious(): void {
    this.stopPlayback();
    const idx = this.currentStepIndex();
    if (idx > 0) {
      this.currentStepIndex.set(idx - 1);
      this.applyTraceStep(idx - 1);
    }
  }

  protected onNext(): void {
    this.stopPlayback();
    const total = this.totalSteps();
    const idx = this.currentStepIndex();
    if (idx + 1 < total) {
      this.currentStepIndex.set(idx + 1);
      this.applyTraceStep(idx + 1);
    }
  }

  protected onAgain(): void {
    this.stopPlayback();
    if (this.totalSteps() === 0) {
      this.runTrace();
      return;
    }
    this.currentStepIndex.set(0);
    this.applyTraceStep(0);
  }

  protected onPlayToggle(): void {
    if (this.isPlaying()) {
      this.stopPlayback();
      return;
    }
    if (this.totalSteps() === 0) {
      this.runTrace();
    }
    if (this.totalSteps() === 0) return;

    if (this.currentStepIndex() >= this.totalSteps() - 1) {
      this.currentStepIndex.set(0);
      this.applyTraceStep(0);
    }

    this.isPlaying.set(true);
    this.schedulePlaybackTick();
  }

  protected onSpeedChange(nextSpeed: number): void {
    this.speed.set(nextSpeed);
    if (this.isPlaying()) {
      this.schedulePlaybackTick();
    }
  }

  protected onScrub(event: Event): void {
    this.stopPlayback();
    const idx = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(idx)) {
      this.currentStepIndex.set(idx);
      this.applyTraceStep(idx);
    }
  }

  protected formatLargeGraphNotice(): string {
    const lang = this.languageService.currentLanguage();
    const total = this.wasm.snapshot()?.nodes.length ?? 0;
    return this.interpolate(translate('graphExplorer.largeGraphNotice', lang), {
      shown: String(this.previewNodeCount()),
      total: String(total),
    });
  }

  private schedulePlaybackTick(): void {
    if (this.playTimer !== null) {
      clearInterval(this.playTimer);
    }
    const intervalMs = Math.max(120, Math.round(750 / this.speed()));
    this.playTimer = setInterval(() => {
      const idx = this.currentStepIndex();
      if (idx + 1 >= this.totalSteps()) {
        this.stopPlayback();
        return;
      }
      this.currentStepIndex.set(idx + 1);
      this.applyTraceStep(idx + 1);
    }, intervalMs);
  }

  private stopPlayback(): void {
    if (this.playTimer !== null) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    this.isPlaying.set(false);
  }

  private handleSnapshotChanged(snap: GraphSnapshot, renderNow = true): void {
    this.stopPlayback();
    this.traceResult.set(null);
    this.currentStepIndex.set(0);
    this.lastComputeMs.set(null);

    if (this.startNode() >= snap.nodes.length) {
      this.startNode.set(0);
    }
    if (this.targetNode() !== null && this.targetNode()! >= snap.nodes.length) {
      this.targetNode.set(snap.nodes.length > 1 ? snap.nodes.length - 1 : null);
    }

    const cleanedSelection = new Set<number>();
    this.selectedNodes().forEach((idx) => {
      if (idx < snap.nodes.length) cleanedSelection.add(idx);
    });
    this.selectedNodes.set(cleanedSelection);

    this.isLargeGraph.set(snap.nodes.length > FULL_RENDER_NODE_LIMIT);

    if (renderNow) {
      this.renderWhenReady(snap, null);
    }
  }

  private renderWhenReady(snap: GraphSnapshot, trace: TraceResult | null): void {
    const run = () => {
      this.renderCytoscape(snap, trace);
      if (this.traceResult()) {
        this.applyTraceStep(this.currentStepIndex());
      } else {
        this.highlightStaticSelection();
      }
    };

    if (this.cyContainer) {
      run();
    } else {
      setTimeout(run, 0);
    }
  }

  private edgeKey(u: number, v: number, isDirected: boolean): string {
    if (isDirected) return `e_${u}_${v}`;
    return u <= v ? `e_${u}_${v}` : `e_${v}_${u}`;
  }

  private selectPreviewNodes(snap: GraphSnapshot, trace: TraceResult | null): Set<number> {
    const chosen = new Set<number>();

    // 1. Prioritize nodes and edges animated in steps 1..N (so cut edges & active traversals are visible)
    if (trace && trace.steps.length > 0) {
      for (let i = 1; i < trace.steps.length && chosen.size < PREVIEW_NODE_LIMIT; i++) {
        const step = trace.steps[i];
        for (const u of step.node_updates) {
          if (chosen.size >= PREVIEW_NODE_LIMIT) break;
          chosen.add(u.node);
        }
        for (const e of step.edge_updates) {
          if (chosen.size < PREVIEW_NODE_LIMIT) chosen.add(e.source);
          if (chosen.size < PREVIEW_NODE_LIMIT) chosen.add(e.target);
        }
      }

      // Fallback to step 0 updates if we still have room
      if (chosen.size < PREVIEW_NODE_LIMIT) {
        const initStep = trace.steps[0];
        for (const u of initStep.node_updates) {
          if (chosen.size >= PREVIEW_NODE_LIMIT) break;
          chosen.add(u.node);
        }
      }
    }

    // 2. Fill remaining slots with BFS neighborhood so the preview stays connected
    if (chosen.size < PREVIEW_NODE_LIMIT) {
      const adj = new Map<number, number[]>();
      for (const e of snap.edges) {
        let listU = adj.get(e.source);
        if (!listU) {
          listU = [];
          adj.set(e.source, listU);
        }
        listU.push(e.target);

        if (!snap.is_directed) {
          let listV = adj.get(e.target);
          if (!listV) {
            listV = [];
            adj.set(e.target, listV);
          }
          listV.push(e.source);
        }
      }

      const seed =
        chosen.size > 0
          ? chosen.values().next().value!
          : this.activeAlgorithm() === 'conductance' && this.selectedNodes().size > 0
            ? this.selectedNodes().values().next().value!
            : this.startNode();

      const queue: number[] = [seed];
      chosen.add(seed);

      let head = 0;
      while (head < queue.length && chosen.size < PREVIEW_NODE_LIMIT) {
        const u = queue[head++];
        const neighbors = adj.get(u);
        if (!neighbors) continue;
        for (const v of neighbors) {
          if (!chosen.has(v)) {
            chosen.add(v);
            queue.push(v);
            if (chosen.size >= PREVIEW_NODE_LIMIT) break;
          }
        }
      }
    }

    // 3. Final fallback if the component is smaller than the preview cap
    for (let i = 0; i < snap.nodes.length && chosen.size < PREVIEW_NODE_LIMIT; i++) {
      chosen.add(i);
    }

    return chosen;
  }

  private renderCytoscape(snap: GraphSnapshot, trace: TraceResult | null = null): void {
    if (!this.cyContainer) return;

    const container = this.cyContainer.nativeElement;
    this.resizeObserver?.disconnect();
    this.cy?.destroy();
    this.edgeLookup.clear();

    const isPreview = snap.nodes.length > FULL_RENDER_NODE_LIMIT;
    const visibleNodes = isPreview ? this.selectPreviewNodes(snap, trace) : null;

    const nodeElements: cytoscape.ElementDefinition[] = [];
    if (visibleNodes) {
      this.previewNodeCount.set(visibleNodes.size);
      visibleNodes.forEach((idx) => {
        if (idx < snap.nodes.length) {
          nodeElements.push({ data: { id: String(idx), label: snap.nodes[idx] } });
        }
      });
    } else {
      this.previewNodeCount.set(snap.nodes.length);
      snap.nodes.forEach((label, idx) => {
        nodeElements.push({ data: { id: String(idx), label } });
      });
    }

    // Collect edge keys touched by the trace so they are never dropped by PREVIEW_EDGE_LIMIT
    const traceEdgeKeys = new Set<string>();
    if (isPreview && trace) {
      for (const step of trace.steps) {
        for (const e of step.edge_updates) {
          traceEdgeKeys.add(this.edgeKey(e.source, e.target, snap.is_directed));
        }
      }
    }

    const priorityEdges: { idx: number; e: GraphSnapshot['edges'][number] }[] = [];
    const regularEdges: { idx: number; e: GraphSnapshot['edges'][number] }[] = [];

    for (let idx = 0; idx < snap.edges.length; idx++) {
      const e = snap.edges[idx];
      if (visibleNodes && (!visibleNodes.has(e.source) || !visibleNodes.has(e.target))) {
        continue;
      }
      const key = this.edgeKey(e.source, e.target, snap.is_directed);
      if (isPreview && traceEdgeKeys.has(key)) {
        priorityEdges.push({ idx, e });
      } else {
        regularEdges.push({ idx, e });
      }
    }

    const chosenEdges = isPreview
      ? [...priorityEdges, ...regularEdges].slice(0, PREVIEW_EDGE_LIMIT)
      : regularEdges;

    const edgeElements: cytoscape.ElementDefinition[] = chosenEdges.map(({ idx, e }) => {
      const edgeId = `edge_${idx}`;
      const key = this.edgeKey(e.source, e.target, snap.is_directed);
      const list = this.edgeLookup.get(key) ?? [];
      list.push(edgeId);
      this.edgeLookup.set(key, list);

      return {
        data: {
          id: edgeId,
          source: String(e.source),
          target: String(e.target),
          label: snap.is_weighted ? String(e.weight) : '',
        },
      };
    });

    this.needsInitialFit = true;

    this.cy = cytoscape({
      container,
      elements: [...nodeElements, ...edgeElements],
      style: this.buildCytoscapeStyle(),
      layout: {
        name: 'cose',
        animate: false,
        padding: 32,
      } as cytoscape.LayoutOptions,
    });

    this.cy.one('layoutstop', () => {
      this.cy?.resize();
      this.cy?.fit(undefined, 32);
    });

    this.cy.on('tap', 'node', (evt) => {
      const idx = Number(evt.target.id());
      if (Number.isNaN(idx)) return;
      this.onCanvasNodeTapped(idx);
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && this.cy) {
          this.cy.resize();
          if (this.needsInitialFit) {
            this.needsInitialFit = false;
            this.cy.fit(undefined, 32);
          }
        }
      });
      this.resizeObserver.observe(container);
    }

    requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && this.cy) {
        this.needsInitialFit = false;
        this.cy.resize();
        this.cy.fit(undefined, 32);
      }
    });
  }

  private onCanvasNodeTapped(nodeIdx: number): void {
    const algo = this.activeAlgorithm();
    if (algo === 'conductance') {
      const next = new Set(this.selectedNodes());
      if (next.has(nodeIdx)) {
        next.delete(nodeIdx);
      } else {
        next.add(nodeIdx);
      }
      this.selectedNodes.set(next);
      this.runTrace();
    } else {
      if (this.canvasPickMode() === 'start') {
        this.startNode.set(nodeIdx);
      } else {
        this.targetNode.set(this.targetNode() === nodeIdx ? null : nodeIdx);
      }
      this.runTrace();
    }
  }

  private clearCanvasHighlights(): void {
    if (!this.cy) return;
    this.cy.batch(() => {
      NODE_TAGS.forEach((t) => this.cy!.nodes().removeClass(`tag-${t}`));
      EDGE_TAGS.forEach((t) => this.cy!.edges().removeClass(`tag-${t}`));
    });
  }

  private highlightStaticSelection(): void {
    if (!this.cy) return;
    this.clearCanvasHighlights();
    const algo = this.activeAlgorithm();
    this.cy.batch(() => {
      if (algo === 'conductance') {
        this.selectedNodes().forEach((idx) => {
          this.cy!.$id(String(idx)).addClass('tag-subset');
        });
      } else {
        this.cy!.$id(String(this.startNode())).addClass('tag-open');
        const target = this.targetNode();
        if (target !== null) {
          this.cy!.$id(String(target)).addClass('tag-target');
        }
      }
    });
  }

  private applyTraceStep(stepIndex: number): void {
    const trace = this.traceResult();
    const snap = this.wasm.snapshot();
    if (!this.cy || !trace || !snap) return;

    const nodeTags = new Map<number, string>();
    const edgeTags = new Map<string, string>();

    const end = Math.min(stepIndex, trace.steps.length - 1);
    for (let i = 0; i <= end; i++) {
      const step = trace.steps[i];
      for (const u of step.node_updates) {
        nodeTags.set(u.node, u.tag);
      }
      for (const e of step.edge_updates) {
        const key = this.edgeKey(e.source, e.target, snap.is_directed);
        edgeTags.set(key, e.tag);
      }
    }

    this.cy.batch(() => {
      NODE_TAGS.forEach((t) => this.cy!.nodes().removeClass(`tag-${t}`));
      EDGE_TAGS.forEach((t) => this.cy!.edges().removeClass(`tag-${t}`));

      nodeTags.forEach((tag, nodeIdx) => {
        this.cy!.$id(String(nodeIdx)).addClass(`tag-${tag}`);
      });

      edgeTags.forEach((tag, key) => {
        const edgeIds = this.edgeLookup.get(key) ?? [];
        for (const id of edgeIds) {
          this.cy!.$id(id).addClass(`tag-${tag}`);
        }
      });
    });
  }

  private buildCytoscapeStyle(): cytoscape.StylesheetJson {
    const isDark = this.themeService.themeMode() === 'dark';
    const isDirected = this.wasm.snapshot()?.is_directed ?? false;

    const palette = isDark
      ? {
          nodeBg: '#2C2E33',
          nodeBorder: '#525864',
          nodeText: '#FFFFFF',
          edgeLine: '#525864',
          edgeText: '#CACFD8',
          edgeLabelBg: '#101114',
          subset: '#28BE2A',
          current: '#3B82F6',
          open: '#FF9142',
          visited: '#8A63D2',
          target: '#FFC857',
          path: '#28BE2A',
          cut: '#DA1E28',
          relaxed: '#FFC857',
          compare: '#FF9142',
        }
      : {
          nodeBg: '#9CA3AF',
          nodeBorder: '#5C5F65',
          nodeText: '#111017',
          edgeLine: '#6B6E74',
          edgeText: '#16151F',
          edgeLabelBg: '#EBEDEF',
          subset: '#24A148',
          current: '#3167D8',
          open: '#D17635',
          visited: '#7C4FDB',
          target: '#E0A400',
          path: '#24A148',
          cut: '#DA1E28',
          relaxed: '#E0A400',
          compare: '#D17635',
        };

    return [
      {
        selector: 'node',
        style: {
          'background-color': palette.nodeBg,
          'border-width': 2,
          'border-color': palette.nodeBorder,
          label: 'data(label)',
          color: palette.nodeText,
          'font-size': 12,
          'font-weight': 600,
          'text-valign': 'center',
          'text-halign': 'center',
          width: 34,
          height: 34,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': palette.edgeLine,
          'target-arrow-color': palette.edgeLine,
          'target-arrow-shape': isDirected ? 'triangle' : 'none',
          'curve-style': 'bezier',
          label: 'data(label)',
          color: palette.edgeText,
          'font-size': 11,
          'text-background-color': palette.edgeLabelBg,
          'text-background-opacity': 0.85,
          'text-background-padding': '2px',
        },
      },
      {
        selector: 'node.tag-subset',
        style: {
          'background-color': palette.subset,
          'border-color': '#FFFFFF',
          color: '#FFFFFF',
        },
      },
      {
        selector: 'node.tag-current',
        style: {
          'background-color': palette.current,
          'border-color': '#FFFFFF',
          'border-width': 3,
          color: '#FFFFFF',
        },
      },
      {
        selector: 'node.tag-open',
        style: {
          'background-color': palette.open,
          'border-color': '#FFFFFF',
          color: '#FFFFFF',
        },
      },
      {
        selector: 'node.tag-visited',
        style: {
          'background-color': palette.visited,
          'border-color': '#FFFFFF',
          color: '#FFFFFF',
        },
      },
      {
        selector: 'node.tag-target',
        style: {
          'border-color': palette.target,
          'border-width': 3,
        },
      },
      {
        selector: 'node.tag-path',
        style: {
          'background-color': palette.path,
          'border-color': '#FFFFFF',
          'border-width': 3,
          color: '#FFFFFF',
        },
      },
      {
        selector: 'edge.tag-cut',
        style: {
          'line-color': palette.cut,
          'target-arrow-color': palette.cut,
          'line-style': 'dashed',
          width: 3.5,
        },
      },
      {
        selector: 'edge.tag-internal, edge.tag-tree',
        style: {
          'line-color': palette.visited,
          'target-arrow-color': palette.visited,
          width: 3,
        },
      },
      {
        selector: 'edge.tag-relaxed',
        style: {
          'line-color': palette.relaxed,
          'target-arrow-color': palette.relaxed,
          width: 3.5,
        },
      },
      {
        selector: 'edge.tag-compare',
        style: {
          'line-color': palette.compare,
          'target-arrow-color': palette.compare,
          'line-style': 'dotted',
          width: 2.5,
        },
      },
      {
        selector: 'edge.tag-path',
        style: {
          'line-color': palette.path,
          'target-arrow-color': palette.path,
          width: 4,
        },
      },
    ];
  }

  private interpolate(template: string, params: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => params[key] ?? '');
  }
}
