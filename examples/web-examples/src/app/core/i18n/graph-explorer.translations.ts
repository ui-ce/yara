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
  'graphExplorer.algo.dfs_cycle': { fa: 'تشخیص دور (DFS)', en: 'DFS Cycle' },
  'graphExplorer.algo.components': { fa: 'مؤلفه‌های همبندی', en: 'Components' },
  'graphExplorer.algo.prim': { fa: 'پریم (MST)', en: 'Prim MST' },
  'graphExplorer.algo.kruskal': { fa: 'کروسکال (MST)', en: 'Kruskal MST' },

  'graphExplorer.samples.disconnected': {
    fa: 'گراف ناهمبند (۳ مؤلفه مجزا)',
    en: 'Disconnected Graph (3 Components)',
  },
  'graphExplorer.startOnly.hint': {
    fa: 'راس شروع را انتخاب کنید (یا روی بوم کلیک کنید) و تریس را ببینید.',
    en: 'Select a start node (or click any node on canvas) to trace.',
  },
  'graphExplorer.globalAlgo.hint': {
    fa: 'این الگوریتم به‌صورت خودکار روی کل گراف اجرا می‌شود.',
    en: 'This algorithm runs globally across the entire graph.',
  },

  // New live metrics
  'graphExplorer.metric.stackDepth': { fa: 'عمق پشته', en: 'Stack Depth' },
  'graphExplorer.metric.cycleStatus': { fa: 'وضعیت دور', en: 'Cycle' },
  'graphExplorer.metric.components': { fa: 'تعداد مؤلفه', en: 'Components' },
  'graphExplorer.metric.currentCompSize': { fa: 'اندازه مؤلفه فعلی', en: 'Comp. Size' },
  'graphExplorer.metric.mstEdges': { fa: 'یال‌های MST', en: 'MST Edges' },
  'graphExplorer.metric.totalWeight': { fa: 'مجموع وزن', en: 'Total Weight' },
  'graphExplorer.metric.rejectedEdges': { fa: 'یال‌های ردشده', en: 'Rejected' },

  // New legend items
  'graphExplorer.legend.cycle': { fa: 'دور یافت‌شده', en: 'Cycle Detected' },
  'graphExplorer.legend.mst': { fa: 'عضو درخت MST', en: 'In MST' },
  'graphExplorer.legend.rejected': { fa: 'ردشده (ایجاد دور)', en: 'Rejected (Cycle)' },
  'graphExplorer.legend.frontier': { fa: 'یال کاندید (Heap)', en: 'Candidate Edge' },
  'graphExplorer.legend.comp0': { fa: 'مؤلفه ۱', en: 'Component 1' },
  'graphExplorer.legend.comp1': { fa: 'مؤلفه ۲', en: 'Component 2' },
  'graphExplorer.legend.comp2': { fa: 'مؤلفه ۳', en: 'Component 3' },
  'graphExplorer.legend.comp3': { fa: 'مؤلفه ۴+', en: 'Component 4+' },

  // Trace messages — DFS Cycle
  'trace.dfsCycle.init.title': { fa: 'شروع تشخیص دور (DFS)', en: 'Start DFS Cycle Check' },
  'trace.dfsCycle.init.msg': {
    fa: 'پیمایش DFS از راس {{start}} آغاز شد و در پشته قرار گرفت.',
    en: 'Started DFS from node {{start}} and marked it as visiting.',
  },
  'trace.dfsCycle.discover.title': { fa: 'پیشروی عمقی', en: 'Descend to Neighbor' },
  'trace.dfsCycle.discover.msg': {
    fa: 'از {{u}} به همسایه دیده‌نشده {{v}} رفتیم و وارد پشته شد.',
    en: 'Moved from {{u}} to unvisited neighbor {{v}} and pushed onto stack.',
  },
  'trace.dfsCycle.backtrack.title': { fa: 'عقب‌گرد (Backtrack)', en: 'Backtrack' },
  'trace.dfsCycle.backtrack.msg': {
    fa: 'همه همسایگان {{node}} بررسی شدند؛ از پشته خارج و تکمیل شد.',
    en: 'Finished all neighbors of {{node}}; popped from stack and marked visited.',
  },
  'trace.dfsCycle.found.title': { fa: 'دور شناسایی شد!', en: 'Cycle Detected!' },
  'trace.dfsCycle.found.msg': {
    fa: 'یال بازگشتی ({{u}}, {{v}}) به یک راس فعال روی مسیر رسید و دور تشکیل داد.',
    en: 'Back-edge ({{u}}, {{v}}) closes a cycle along the active recursion path.',
  },
  'trace.dfsCycle.none.title': { fa: 'دوری یافت نشد', en: 'No Cycle Found' },
  'trace.dfsCycle.none.msg': {
    fa: 'پیمایش {{visited}} راس دسترس‌پذیر بدون برخورد به دور پایان یافت.',
    en: 'Explored {{visited}} reachable nodes with no cycles detected.',
  },

  // Trace messages — Connected Components
  'trace.components.init.title': { fa: 'شروع یافتن مؤلفه‌ها', en: 'Start Connected Components' },
  'trace.components.init.msg': {
    fa: 'آماده پیمایش {{totalNodes}} راس برای تفکیک مؤلفه‌های همبندی.',
    en: 'Ready to scan {{totalNodes}} nodes and partition connected components.',
  },
  'trace.components.new.title': { fa: 'کشف مؤلفه جدید #{{comp}}', en: 'New Component #{{comp}}' },
  'trace.components.new.msg': {
    fa: 'راس دیده‌نشده {{node}} به‌عنوان شروع مؤلفه شماره {{comp}} انتخاب شد.',
    en: 'Unvisited node {{node}} starts connected component #{{comp}}.',
  },
  'trace.components.expand.title': {
    fa: 'گسترش مؤلفه #{{comp}}',
    en: 'Expand Component #{{comp}}',
  },
  'trace.components.expand.msg': {
    fa: 'راس {{v}} از طریق {{u}} به مؤلفه شماره {{comp}} اضافه شد.',
    en: 'Reached {{v}} from {{u}} and assigned it to component #{{comp}}.',
  },
  'trace.components.done.title': { fa: 'پایان تفکیک مؤلفه‌ها', en: 'Components Complete' },
  'trace.components.done.msg': {
    fa: 'کل گراف به {{components}} مؤلفه همبندی ({{visited}} راس) تقسیم شد.',
    en: 'Partitioned all {{visited}} nodes into {{components}} connected component(s).',
  },

  // Trace messages — Prim MST
  'trace.prim.init.title': { fa: 'شروع الگوریتم پریم', en: 'Start Prim MST' },
  'trace.prim.init.msg': {
    fa: 'راس {{start}} وارد درخت MST شد و {{heapSize}} یال مجاورش به Min-Heap اضافه شدند.',
    en: 'Added {{start}} to the MST and pushed {{heapSize}} incident edges to the Min-Heap.',
  },
  'trace.prim.accept.title': { fa: 'افزودن یال به MST', en: 'Accept MST Edge' },
  'trace.prim.accept.msg': {
    fa: 'کم‌وزن‌ترین یال ({{u}}, {{v}}) با وزن {{w}} به MST اضافه شد. مجموع وزن: {{totalWeight}}.',
    en: 'Added minimum frontier edge ({{u}}, {{v}}) of weight {{w}}. Total weight: {{totalWeight}}.',
  },
  'trace.prim.skip.title': { fa: 'رد کردن یال داخلی', en: 'Skip Stale Edge' },
  'trace.prim.skip.msg': {
    fa: 'یال ({{u}}, {{v}}) با وزن {{w}} رد شد چون راس {{v}} قبلاً عضو MST است.',
    en: 'Skipped edge ({{u}}, {{v}}) of weight {{w}} because {{v}} is already in the MST.',
  },
  'trace.prim.done.title': { fa: 'ساخت MST کامل شد', en: 'Prim MST Complete' },
  'trace.prim.done.msg': {
    fa: 'درخت پوشای کمینه با {{mstEdges}} یال و مجموع وزن {{totalWeight}} ساخته شد.',
    en: 'Built MST with {{mstEdges}} edges and total weight {{totalWeight}}.',
  },

  // Trace messages — Kruskal MST
  'trace.kruskal.init.title': { fa: 'مرتب‌سازی یال‌ها (کروسکال)', en: 'Sort Edges (Kruskal)' },
  'trace.kruskal.init.msg': {
    fa: '{{edgeCount}} یال بر اساس وزن مرتب شدند و ساختار Union-Find مقداردهی شد.',
    en: 'Sorted {{edgeCount}} edges by weight and initialized Disjoint Set Union (DSU).',
  },
  'trace.kruskal.accept.title': { fa: 'ادغام دو مؤلفه در MST', en: 'Union & Accept Edge' },
  'trace.kruskal.accept.msg': {
    fa: 'یال ({{u}}, {{v}}) با وزن {{w}} دور نمی‌سازد؛ به MST اضافه شد (مجموع: {{totalWeight}}).',
    en: 'Edge ({{u}}, {{v}}) of weight {{w}} joins two sets; added to MST (total: {{totalWeight}}).',
  },
  'trace.kruskal.reject.title': { fa: 'رد یال (ایجاد دور)', en: 'Reject Edge (Cycle)' },
  'trace.kruskal.reject.msg': {
    fa: 'یال ({{u}}, {{v}}) با وزن {{w}} رد شد چون هر دو سر آن در یک مجموعه هستند.',
    en: 'Rejected ({{u}}, {{v}}) of weight {{w}} because both endpoints are already connected.',
  },
  'trace.kruskal.done.title': { fa: 'پایان الگوریتم کروسکال', en: 'Kruskal MST Complete' },
  'trace.kruskal.done.msg': {
    fa: 'جنگل/درخت پوشای کمینه با {{mstEdges}} یال و مجموع وزن {{totalWeight}} آماده است.',
    en: 'Finished MST with {{mstEdges}} edges and total weight {{totalWeight}}.',
  },
};
