import type { TranslationDictionary } from './translations.type';

export const GRAPH_EXPLORER_TRANSLATIONS: TranslationDictionary = {
  'graphExplorer.title': { fa: 'کاوشگر و تریس گراف (Rust/Wasm)', en: 'Graph Explorer & Tracer' },
  'graphExplorer.algo.conductance': { fa: 'رسانایی', en: 'Conductance' },
  'graphExplorer.algo.bfs': { fa: 'BFS / کوتاه‌ترین مسیر', en: 'BFS / Shortest Path' },
  'graphExplorer.algo.dijkstra': { fa: 'دایکسترا', en: 'Dijkstra' },

  'graphExplorer.drawer.data': { fa: 'ورودی و گراف‌های نمونه', en: 'Graph Input & Samples' },
  'graphExplorer.drawer.stats': { fa: 'آمار ساختاری گراف', en: 'Graph Statistics' },

  'graphExplorer.upload.label': {
    fa: 'آپلود فایل گراف (.txt / .csv / .edgelist)',
    en: 'Upload Graph File (.txt / .csv / .edgelist)',
  },
  'graphExplorer.upload.button': { fa: 'انتخاب فایل از سیستم', en: 'Choose Graph File' },
  'graphExplorer.samples.title': {
    fa: 'گراف‌های آماده برای تست سریع',
    en: 'Built-in Sample Graphs',
  },
  'graphExplorer.samples.communities': {
    fa: 'دو خوشه با پل باریک (رسانایی کم)',
    en: 'Two Clusters + Bridge (Low Conductance)',
  },
  'graphExplorer.samples.weighted': {
    fa: 'گراف وزن‌دار آموزشی (دایکسترا)',
    en: 'Weighted Graph (Dijkstra / BFS)',
  },
  'graphExplorer.options.directed': { fa: 'گراف جهت‌دار', en: 'Directed graph' },

  'graphExplorer.stats.nodes': { fa: 'تعداد رئوس (|V|)', en: 'Nodes (|V|)' },
  'graphExplorer.stats.edges': { fa: 'تعداد یال‌ها (|E|)', en: 'Edges (|E|)' },
  'graphExplorer.stats.avgDegree': { fa: 'درجه میانگین', en: 'Average Degree' },
  'graphExplorer.stats.components': { fa: 'مؤلفه‌های همبندی', en: 'Connected Components' },
  'graphExplorer.stats.connected': { fa: 'همبند است؟', en: 'Is Connected' },
  'graphExplorer.stats.hasCycle': { fa: 'دارای دور است؟', en: 'Has Cycle' },
  'graphExplorer.stats.yes': { fa: 'بله', en: 'Yes' },
  'graphExplorer.stats.no': { fa: 'خیر', en: 'No' },

  'graphExplorer.conductance.hint': {
    fa: 'روی رئوس کلیک کنید تا زیرمجموعه S ساخته شود، سپس «اجرای تریس» را بزنید.',
    en: 'Click nodes to toggle membership in subset S, then press Run Trace.',
  },
  'graphExplorer.conductance.firstHalf': { fa: 'نیمه اول', en: 'First Half' },
  'graphExplorer.conductance.random25': { fa: '۲۵٪ تصادفی', en: 'Random 25%' },
  'graphExplorer.conductance.clear': { fa: 'پاک کردن S', en: 'Clear S' },

  'graphExplorer.traversal.start': { fa: 'مبدأ:', en: 'Start:' },
  'graphExplorer.traversal.target': { fa: 'مقصد:', en: 'Target:' },
  'graphExplorer.traversal.none': { fa: 'همه رئوس (بدون مقصد)', en: 'All nodes (no target)' },
  'graphExplorer.traversal.clickStart': {
    fa: 'کلیک روی بوم = انتخاب مبدأ',
    en: 'Canvas click = Start',
  },
  'graphExplorer.traversal.clickTarget': {
    fa: 'کلیک روی بوم = انتخاب مقصد',
    en: 'Canvas click = Target',
  },

  'graphExplorer.action.runTrace': { fa: 'اجرای تریس', en: 'Run Trace' },
  'graphExplorer.playback.step': { fa: 'گام', en: 'Step' },
  'graphExplorer.playback.speed': { fa: 'سرعت:', en: 'Speed:' },
  'graphExplorer.playback.truncated': {
    fa: 'به دلیل بزرگی گراف، ۵۰۰ گام اول ضبط شده است (نتیجه نهایی دقیق است).',
    en: 'Truncated to first 500 steps for responsiveness (final summary is exact).',
  },
  'graphExplorer.playback.readyTitle': { fa: 'آماده اجرای گام‌به‌گام', en: 'Ready to Trace' },
  'graphExplorer.playback.readyDesc': {
    fa: 'پارامترها را انتخاب کنید و دکمه «اجرای تریس» یا «پخش» را بزنید.',
    en: 'Select parameters and press Run Trace or Play to step through the Rust engine.',
  },
  'graphExplorer.largeGraphNotice': {
    fa: 'پیش‌نمایش زیرگراف فعال ({{shown}} از {{total}} راس) — محاسبات Rust روی کل گراف انجام می‌شود.',
    en: 'Active subgraph preview ({{shown}} of {{total}} nodes) — Rust runs exact calculations on the full graph.',
  },

  // Live metrics labels
  'graphExplorer.metric.subsetSize': { fa: '|S|', en: '|S|' },
  'graphExplorer.metric.volS': { fa: 'vol(S)', en: 'vol(S)' },
  'graphExplorer.metric.volRest': { fa: 'vol(V\\S)', en: 'vol(V\\S)' },
  'graphExplorer.metric.cutWeight': { fa: 'وزن برش', en: 'Cut Weight' },
  'graphExplorer.metric.cutEdges': { fa: 'یال‌های برش', en: 'Cut Edges' },
  'graphExplorer.metric.conductance': { fa: 'رسانایی φ(S)', en: 'Conductance φ(S)' },
  'graphExplorer.metric.visited': { fa: 'بازدیدشده', en: 'Visited' },
  'graphExplorer.metric.queueSize': { fa: 'اندازه صف', en: 'Queue' },
  'graphExplorer.metric.current': { fa: 'راس فعلی', en: 'Current' },
  'graphExplorer.metric.pathHops': { fa: 'طول مسیر', en: 'Path Hops' },
  'graphExplorer.metric.settled': { fa: 'نهایی‌شده', en: 'Settled' },
  'graphExplorer.metric.heapSize': { fa: 'اندازه Heap', en: 'Heap' },
  'graphExplorer.metric.currentCost': { fa: 'هزینه فعلی', en: 'Cost' },
  'graphExplorer.metric.targetCost': { fa: 'هزینه مقصد', en: 'Target Cost' },

  // Legend items
  'graphExplorer.legend.default': { fa: 'عادی', en: 'Default' },
  'graphExplorer.legend.subset': { fa: 'عضو S / نهایی', en: 'In S / Final' },
  'graphExplorer.legend.current': { fa: 'راس فعلی', en: 'Current' },
  'graphExplorer.legend.cut': { fa: 'یال برش (Cut)', en: 'Cut Edge' },
  'graphExplorer.legend.internal': { fa: 'یال داخلی S', en: 'Internal Edge' },
  'graphExplorer.legend.open': { fa: 'در صف / کاندید', en: 'Open / Frontier' },
  'graphExplorer.legend.visited': { fa: 'بازدیدشده', en: 'Visited' },
  'graphExplorer.legend.target': { fa: 'مقصد', en: 'Target' },
  'graphExplorer.legend.path': { fa: 'کوتاه‌ترین مسیر', en: 'Shortest Path' },
  'graphExplorer.legend.relaxed': { fa: 'آپدیت هزینه (Relax)', en: 'Relaxed Edge' },
  'graphExplorer.legend.compare': { fa: 'بررسی بدون تغییر', en: 'Checked (Skipped)' },

  // Trace step messages — Conductance
  'trace.conductance.init.title': { fa: 'مقداردهی اولیه رسانایی', en: 'Initialize Conductance' },
  'trace.conductance.init.msg': {
    fa: 'زیرمجموعه S با {{subsetSize}} راس انتخاب شد. حجم کل گراف برابر {{totalVol}} است.',
    en: 'Subset S selected with {{subsetSize}} nodes. Total graph volume is {{totalVol}}.',
  },
  'trace.conductance.node.title': { fa: 'بررسی راس عضو S', en: 'Inspect Node in S' },
  'trace.conductance.node.msg': {
    fa: 'راس {{node}} از زیرمجموعه S برای پیمایش یال‌های مجاور انتخاب شد.',
    en: 'Inspecting incident edges of node {{node}} in subset S.',
  },
  'trace.conductance.cutEdge.title': { fa: 'یافتن یال برش (Cut Edge)', en: 'Cut Edge Found' },
  'trace.conductance.cutEdge.msg': {
    fa: 'یال ({{u}}, {{v}}) با وزن {{w}} از S خارج می‌شود؛ به حجم S و وزن برش اضافه شد.',
    en: 'Edge ({{u}}, {{v}}) with weight {{w}} crosses out of S; added to vol(S) and cut weight.',
  },
  'trace.conductance.internalEdge.title': { fa: 'یال داخلی زیرمجموعه S', en: 'Internal Edge in S' },
  'trace.conductance.internalEdge.msg': {
    fa: 'یال ({{u}}, {{v}}) با وزن {{w}} داخل S می‌ماند؛ فقط به vol(S) اضافه شد.',
    en: 'Edge ({{u}}, {{v}}) with weight {{w}} stays inside S; added only to vol(S).',
  },
  'trace.conductance.nodeDone.title': { fa: 'پایان بررسی راس', en: 'Finished Node' },
  'trace.conductance.nodeDone.msg': {
    fa: 'تمام همسایگان راس {{node}} بررسی شدند. vol(S) تا اینجا = {{volS}}.',
    en: 'Finished edges of {{node}}. Cumulative vol(S) = {{volS}}.',
  },
  'trace.conductance.done.title': { fa: 'محاسبه نهایی φ(S)', en: 'Final Conductance φ(S)' },
  'trace.conductance.done.msg': {
    fa: 'رسانایی برابر φ(S) = {{cut}} / {{minVol}} = {{phi}} محاسبه شد.',
    en: 'Computed φ(S) = {{cut}} / {{minVol}} = {{phi}}.',
  },

  // Trace step messages — BFS
  'trace.bfs.init.title': { fa: 'شروع BFS', en: 'Start BFS' },
  'trace.bfs.init.msg': {
    fa: 'راس مبدأ {{start}} با فاصله ۰ در صف قرار گرفت.',
    en: 'Enqueued start node {{start}} at distance 0.',
  },
  'trace.bfs.visit.title': { fa: 'برداشتن از صف', en: 'Dequeue Node' },
  'trace.bfs.visit.msg': {
    fa: 'راس {{node}} در فاصله {{dist}} از مبدأ برای بررسی همسایگان برداشته شد.',
    en: 'Dequeued node {{node}} at distance {{dist}} to explore neighbors.',
  },
  'trace.bfs.discover.title': { fa: 'کشف همسایه جدید', en: 'Discover Neighbor' },
  'trace.bfs.discover.msg': {
    fa: 'راس {{v}} از طریق {{u}} با فاصله {{dist}} کشف و به صف اضافه شد.',
    en: 'Discovered {{v}} from {{u}} at distance {{dist}} and added to queue.',
  },
  'trace.bfs.closed.title': { fa: 'تکمیل بررسی راس', en: 'Node Explored' },
  'trace.bfs.closed.msg': {
    fa: 'همه همسایگان راس {{node}} بررسی شدند.',
    en: 'All neighbors of node {{node}} have been explored.',
  },
  'trace.bfs.found.title': { fa: 'کوتاه‌ترین مسیر پیدا شد!', en: 'Shortest Path Found!' },
  'trace.bfs.found.msg': {
    fa: 'به مقصد {{target}} رسیدیم. طول کوتاه‌ترین مسیر: {{hops}} یال.',
    en: 'Reached target {{target}}. Shortest path length: {{hops}} hops.',
  },
  'trace.bfs.done.title': { fa: 'پایان BFS', en: 'BFS Complete' },
  'trace.bfs.done.msg': {
    fa: 'پیمایش BFS پایان یافت. مجموع رئوس دسترس‌پذیر: {{visited}}.',
    en: 'BFS finished. Total reachable nodes visited: {{visited}}.',
  },

  // Trace step messages — Dijkstra
  'trace.dijkstra.init.title': { fa: 'شروع دایکسترا', en: 'Start Dijkstra' },
  'trace.dijkstra.init.msg': {
    fa: 'فاصله مبدأ {{start}} برابر ۰ تنظیم و وارد صف اولویت (Min-Heap) شد.',
    en: 'Set dist[{{start}}] = 0 and pushed to the priority queue (Min-Heap).',
  },
  'trace.dijkstra.pop.title': { fa: 'انتخاب کم‌هزینه‌ترین راس', en: 'Extract Minimum Node' },
  'trace.dijkstra.pop.msg': {
    fa: 'راس {{node}} با کمترین هزینه قطعی ({{cost}}) از Heap برداشته شد.',
    en: 'Popped node {{node}} with minimum settled cost {{cost}}.',
  },
  'trace.dijkstra.relax.title': { fa: 'به‌روزرسانی مسیر (Relax)', en: 'Relax Edge' },
  'trace.dijkstra.relax.msg': {
    fa: 'مسیر به {{v}} از طریق {{u}} ارزان‌تر شد: {{oldCost}} ← {{newCost}}.',
    en: 'Shorter path to {{v}} via {{u}}: {{oldCost}} -> {{newCost}}.',
  },
  'trace.dijkstra.skip.title': { fa: 'بدون بهبود هزینه', en: 'No Improvement' },
  'trace.dijkstra.skip.msg': {
    fa: 'مسیر از {{u}} به {{v}} با هزینه {{tentative}} بهتر از بهترین مقدار فعلی ({{best}}) نیست.',
    en: 'Path {{u}} -> {{v}} ({{tentative}}) does not beat current best ({{best}}).',
  },
  'trace.dijkstra.settled.title': { fa: 'قطعی شدن راس', en: 'Node Settled' },
  'trace.dijkstra.settled.msg': {
    fa: 'کوتاه‌ترین فاصله به {{node}} برابر {{cost}} قطعی شد.',
    en: 'Shortest distance to {{node}} finalized at {{cost}}.',
  },
  'trace.dijkstra.found.title': {
    fa: 'کوتاه‌ترین مسیر وزن‌دار پیدا شد!',
    en: 'Shortest Weighted Path Found!',
  },
  'trace.dijkstra.found.msg': {
    fa: 'به مقصد {{target}} با مجموع هزینه {{cost}} رسیدیم.',
    en: 'Reached target {{target}} with total weight {{cost}}.',
  },
  'trace.dijkstra.done.title': { fa: 'پایان دایکسترا', en: 'Dijkstra Complete' },
  'trace.dijkstra.done.msg': {
    fa: 'الگوریتم پایان یافت. تعداد رئوس قطعی‌شده: {{settled}}.',
    en: 'Dijkstra finished. Total settled nodes: {{settled}}.',
  },
};
