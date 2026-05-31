
// ── Nomenclature Report v2: thumbnails + sticky col + column groups + size drilldown + highlight patterns ──

// ── Extended data with size breakdown ───────────────────────────────────────
const SIZES = ['XS','S','M','L','XL'];

function makeSizeBreakdown(p) {
  const dist = [0.10, 0.20, 0.35, 0.25, 0.10];
  return SIZES.map((s, i) => {
    const factor = dist[i];
    const sales = Math.round(p.sales * factor);
    const salesRub = Math.round(p.salesRub * factor);
    const returns = Math.round(p.returns * factor);
    const marginRub = Math.round(p.marginRub * factor);
    const margin = p.margin + (i - 2) * 0.8;
    const cost = Math.round(p.cost * factor);
    const buyout = sales - returns;
    const perUnit = salesRub / (sales || 1);
    return {
      size: s, sales, salesRub, returns, cost, marginRub, margin, prevMargin: margin - 1 - i * 0.3,
      buyout,
      buyoutPct: sales ? buyout / sales * 100 : 0,
      returnsRub: Math.round(returns * perUnit),
      returnsPct: sales ? returns / sales * 100 : 0,
      costPct: salesRub ? cost / salesRub * 100 : 0,
      logisticsRub: Math.round(p.logistics / 100 * salesRub),
      storageRub: Math.round(p.storage / 100 * salesRub),
      adsRub: Math.round(p.ads / 100 * salesRub),
      commissionRub: Math.round(p.commission / 100 * salesRub),
      acceptanceRub: Math.round(p.acceptance / 100 * salesRub),
      marginUnit: sales ? Math.round(marginRub / sales) : 0,
      roi: cost ? Math.round(marginRub / cost * 100) : 0,
    };
  });
}

// Color seed for placeholder thumbnails based on SKU
const THUMB_COLORS = [
  ['#4F6EF7','#3A55D4'],['#12B76A','#0E9059'],['#F79009','#D67A07'],['#8B5CF6','#6D44C4'],
  ['#EC4899','#BE3A85'],['#06B6D4','#0891B2'],['#F43F5E','#C7314A'],['#22C55E','#16A34A'],
];
function thumbStyle(sku) {
  const hash = sku.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const [a, b] = THUMB_COLORS[hash % THUMB_COLORS.length];
  return { background: `linear-gradient(135deg, ${a}, ${b})` };
}
function thumbInitials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || '') + (words[1]?.[0] || '');
}

function ProductThumb({ p, size = 36 }) {
  return React.createElement('div', {
    style: { width:size, height:size, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: size*0.36, fontWeight:700, letterSpacing:-.5, ...thumbStyle(p.sku) }
  }, thumbInitials(p.name).toUpperCase());
}

// ── Column groups definition (2-level header: group → columns) ──────────────
// std: показывается в стандартном режиме; pro-only колонки помечены std:false
const COLUMN_GROUPS = [
  {
    id: 'revenue', label: 'Выручка', color: 'var(--accent)',
    cols: [
      { key:'sales',      label:'Продажи, шт',  format:'num', width:105, numeric:true, std:false },
      { key:'salesRub',   label:'Продажи, ₽',   format:'rub', width:130, numeric:true, std:false },
      { key:'buyoutPct',  label:'Выкуп, %',     format:'pct', width:95,  numeric:true, std:true },
      { key:'returns',    label:'Возвраты, шт', format:'num', width:115, numeric:true, std:true, invert:true },
      { key:'returnsRub', label:'Возвраты, ₽',  format:'rub', width:120, numeric:true, std:true, invert:true },
      { key:'returnsPct', label:'Возвраты, %',  format:'pct', width:110, numeric:true, std:true, invert:true },
    ]
  },
  {
    id: 'costs', label: 'Издержки', color: 'var(--warning)',
    cols: [
      { key:'cost',          label:'Себест., ₽',  format:'rub', width:120, numeric:true, std:true,  invert:true },
      { key:'costPct',       label:'Себест., %',  format:'pct', width:105, numeric:true, std:true,  invert:true },
      { key:'acceptanceRub', label:'Приём, ₽',    format:'rub', width:110, numeric:true, std:false, invert:true },
      { key:'acceptance',    label:'Приём, %',    format:'pct', width:100, numeric:true, std:false, invert:true },
      { key:'storageRub',    label:'Хранен., ₽',  format:'rub', width:115, numeric:true, std:false, invert:true },
      { key:'storage',       label:'Хранен., %',  format:'pct', width:105, numeric:true, std:false, invert:true, norm:4 },
      { key:'commissionRub', label:'Комис., ₽',   format:'rub', width:115, numeric:true, std:false, invert:true },
      { key:'commission',    label:'Комис., %',   format:'pct', width:105, numeric:true, std:false, invert:true, norm:11 },
      { key:'logisticsRub',  label:'Логист., ₽',  format:'rub', width:115, numeric:true, std:false, invert:true },
      { key:'logistics',     label:'Логист., %',  format:'pct', width:105, numeric:true, std:false, invert:true, norm:8 },
      { key:'adsRub',        label:'Реклама, ₽',  format:'rub', width:115, numeric:true, std:false, invert:true },
      { key:'ads',           label:'Реклама, %',  format:'pct', width:105, numeric:true, std:false, invert:true, norm:5 },
    ]
  },
  {
    id: 'margin', label: 'Маржа', color: 'var(--positive)',
    cols: [
      { key:'marginUnit', label:'Марж/ед, ₽', format:'rub', width:110, numeric:true, std:true },
      { key:'marginRub',  label:'Маржа, ₽',   format:'rub', width:120, numeric:true, std:true },
      { key:'margin',     label:'Маржа, %',   format:'pct', width:100, numeric:true, std:true },
    ]
  },
];

// ── Format helpers ──────────────────────────────────────────────────────────
function fmtCell(v, format) {
  if (v == null) return '—';
  if (format === 'rub') return fmtRub(v);
  if (format === 'pct') return fmtPct(v);
  return fmtNum(v);
}

// ── Status thresholds per metric — 3-tier semantic (bad / tolerable / ok) ─
// Each metric defines absolute boundaries that say "what's healthy for this column".
const STATUS_RULES = {
  margin:     { bad: v => v < 0,         tol: v => v < 10,                                  unit:'%', label:'Маржа' },
  marginRub:  { bad: v => v < 0,         tol: v => v < 50000,                               unit:'₽', label:'Маржа ₽' },
  marginUnit: { bad: v => v < 0,         tol: v => v < 100,                                 unit:'₽', label:'Маржа на ед.' },
  roi:        { bad: v => v < 0,         tol: v => v < 20,                                  unit:'%', label:'ROI' },
  logistics:  { bad: v => v > 12,        tol: v => v > 8,    norm:8,                        unit:'%', label:'Логистика' },
  storage:    { bad: v => v > 6,         tol: v => v > 4,    norm:4,                        unit:'%', label:'Хранение' },
  ads:        { bad: v => v > 8,         tol: v => v > 5,    norm:5,                        unit:'%', label:'Реклама' },
  commission: { bad: v => v > 15,        tol: v => v > 11,   norm:11,                       unit:'%', label:'Комиссия' },
  costPct:    { bad: v => v > 45,        tol: v => v > 38,                                  unit:'%', label:'Себестоимость' },
  acceptance: { bad: v => v > 2.5,       tol: v => v > 1.5,                                 unit:'%', label:'Приём' },
  returns:    { bad: (v,r) => v / r.sales > 0.10, tol: (v,r) => v / r.sales > 0.05,          unit:'шт', label:'Возвраты' },
  returnsPct: { bad: v => v > 10,        tol: v => v > 5,                                   unit:'%', label:'Возвраты %' },
  buyoutPct:  { bad: v => v < 85,        tol: v => v < 92,                                  unit:'%', label:'Выкуп %' },
};

function getStatus(key, value, row) {
  const rule = STATUS_RULES[key];
  if (!rule || value == null) return null;
  if (rule.bad(value, row)) return 'bad';
  if (rule.tol(value, row)) return 'tol';
  return 'ok';
}

const STATUS_STYLE = {
  bad: { bg: 'color-mix(in srgb, var(--negative) 14%, transparent)', dot: 'var(--negative)', label: 'Критично' },
  tol: { bg: 'color-mix(in srgb, var(--warning) 14%, transparent)',  dot: 'var(--warning)',  label: 'Терпимо' },
  ok:  { bg: 'transparent',                                          dot: 'var(--positive)', label: 'Норма' },
};

// ── Highlight pattern primitives ────────────────────────────────────────────
function heatBg(value, min, max, invert = false) {
  // Legacy gradient — kept for reference; current code uses status thresholds instead.
  return 'transparent';
}

function severityDot(p) {
  // Composite severity: margin sign + logistics overrun + returns rate
  const flags = [];
  if (p.margin < 0) flags.push('negMargin');
  if (p.logistics > 12) flags.push('highLogistics');
  if (p.returns / p.sales > 0.08) flags.push('highReturns');
  if (p.margin > 25) flags.push('top');
  if (flags.includes('negMargin')) return { color:'var(--negative)', label:'Критичная', flags };
  if (flags.length >= 2) return { color:'var(--warning)', label:'Внимание', flags };
  if (flags.includes('top')) return { color:'var(--positive)', label:'Лидер', flags };
  return { color:'transparent', label:'OK', flags };
}

// Trend sparkline (synthetic)
function Spark({ baseline = 50, color, width = 60, height = 18, seed = 1, trend = 1 }) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const n = Math.sin(seed + i * 1.3) * 12;
    pts.push(baseline + n + i * trend * 2);
  }
  const min = Math.min(...pts), max = Math.max(...pts);
  const range = max - min || 1;
  const path = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return React.createElement('svg', { width, height, style:{ display:'block' } },
    React.createElement('path', { d:path, stroke:color, strokeWidth:1.5, fill:'none' })
  );
}

// ── Cell renderer with multiple highlight patterns ──────────────────────────
function Cell({ row, col, colStats, patterns, rank, sizeMode = false, firstInGroup = false }) {
  const v = row[col.key];
  if (v == null) return React.createElement('td', { style:{ padding:'10px 12px' } }, '—');

  // Special key: margin column — always semantic-colored text
  const isMarginPct = col.key === 'margin';
  const isMarginRub = col.key === 'marginRub' || col.key === 'marginUnit';
  const semanticTextColor = isMarginPct ? marginColor(v) : isMarginRub ? marginColor(v) : 'var(--text-primary)';

  // Pattern: status threshold (3-tier semantic — bad / tolerable / ok)
  const status = getStatus(col.key, v, row);
  const statusInfo = status ? STATUS_STYLE[status] : null;

  // Pattern: tinted cell background by status
  let bg = 'transparent';
  if (patterns.heatmap && statusInfo && !sizeMode) {
    bg = statusInfo.bg;
  }

  // Pattern: threshold warning (kept separate — explicit ⚠ icon when over norm)
  const overNorm = patterns.threshold && col.norm != null && v > col.norm;

  // Pattern: inline bar fill (only for % columns, shows fact vs max)
  const showBar = patterns.bars && col.format === 'pct' && colStats;
  const barPct = showBar ? Math.min(100, (v / Math.max(colStats.max, col.norm || 0)) * 100) : 0;
  const barColor = overNorm ? 'var(--negative)' : col.invert ? 'var(--warning)' : 'var(--positive)';

  // Pattern: delta arrow (margin column only, for demo)
  const showDelta = patterns.delta && isMarginPct && row.prevMargin != null;
  const delta = showDelta ? +(v - row.prevMargin).toFixed(1) : null;

  // Pattern: top/bottom rank badge (only for primary numeric columns in main rows)
  const showRank = patterns.rank && !sizeMode && rank && (col.key === 'salesRub' || col.key === 'margin' || col.key === 'marginRub');

  return React.createElement('td', {
    title: statusInfo ? `${col.label}: ${fmtCell(v, col.format)} — ${statusInfo.label}` : undefined,
    style: {
      padding:'10px 12px', fontSize:13, textAlign:'right', borderBottom:'1px solid var(--border)',
      fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', position:'relative',
      ...(bg !== 'transparent' ? { background: bg } : {}),
      ...(firstInGroup ? { borderLeft: '1px solid var(--border)' } : {}),
      color: status === 'bad' ? 'var(--negative)' : status === 'tol' ? 'var(--warning)' : semanticTextColor,
      fontWeight: status === 'bad' || status === 'tol' ? 700 : (isMarginPct || isMarginRub ? 600 : 400),
    }
  },
    React.createElement('div', { style:{ display:'inline-flex', alignItems:'center', gap:6, justifyContent:'flex-end' } },
      overNorm && React.createElement(NormTooltip, { norm: col.norm, fact: v, label: col.label }),
      fmtCell(v, col.format),
      showDelta && delta != null && delta !== 0 && React.createElement('span', {
        style:{ fontSize:11, color: delta > 0 ? 'var(--positive)' : 'var(--negative)', fontWeight:600 }
      }, (delta > 0 ? '↑' : '↓') + Math.abs(delta).toFixed(1)),
      showRank && rank.top && React.createElement('span', { style:{ fontSize:10, padding:'2px 5px', borderRadius:4, background:'color-mix(in srgb, var(--positive) 18%, transparent)', color:'var(--positive)', fontWeight:700, letterSpacing:.2 } }, '#'+rank.top),
      showRank && rank.bottom && React.createElement('span', { style:{ fontSize:10, padding:'2px 5px', borderRadius:4, background:'color-mix(in srgb, var(--negative) 18%, transparent)', color:'var(--negative)', fontWeight:700, letterSpacing:.2 } }, 'низ '+rank.bottom)
    ),
    showBar && React.createElement('div', { style:{
      position:'absolute', bottom:0, left:8, right:8, height:2, background:'var(--border)', borderRadius:1
    } },
      React.createElement('div', { style:{ width: barPct+'%', height:'100%', background:barColor, borderRadius:1, transition:'width .2s' } })
    )
  );
}

// ── Highlight patterns showcase strip (top of page) ─────────────────────────
function PatternsLegend({ patterns, setPatterns }) {
  const items = [
    { id:'heatmap',   label:'Статус показателя', desc:'Срочно / терпимо / норма' },
    { id:'bars',      label:'Инлайн-бары',    desc:'Полоска под значением' },
    { id:'threshold', label:'Порог нормы',    desc:'⚠ при превышении' },
    { id:'delta',     label:'Динамика',       desc:'↑↓ vs пред. период' },
    { id:'rank',      label:'Ранг',           desc:'#1 / низ N' },
    { id:'severity',  label:'Светофор строки',desc:'Цветная полоса слева' },
    { id:'rowFill',   label:'Заливка строки', desc:'Критичные подсвечены' },
  ];
  return React.createElement(Card, { style:{ padding:18 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' } },
      React.createElement('h3', { style:{ fontSize:14, fontWeight:700, color:'var(--text-primary)', margin:0 } }, 'Паттерны выделения критичных точек'),
      React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, '— включите нужные:')
    ),
    React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:8 } },
      items.map(it => {
        const active = patterns[it.id];
        return React.createElement('button', {
          key: it.id,
          onClick: () => setPatterns(p => ({ ...p, [it.id]: !p[it.id] })),
          style: {
            display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2,
            padding:'8px 12px', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
            border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
            background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--bg-card)',
            color: active ? 'var(--accent)' : 'var(--text-primary)',
            minWidth: 144, textAlign:'left',
          }
        },
          React.createElement('span', { style:{ fontSize:13, fontWeight:600 } },
            React.createElement('span', { style:{ marginRight:6, opacity: active ? 1 : .4 } }, active ? '●' : '○'),
            it.label
          ),
          React.createElement('span', { style:{ fontSize:11, color:'var(--text-secondary)', fontWeight:400 } }, it.desc)
        );
      })
    )
  );
}

function NormTooltip({ norm, fact, label }) {
  const [show, setShow] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const ref = React.useRef(null);

  function onEnter() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top - 8, left: r.left + r.width / 2 });
    }
    setShow(true);
  }

  return React.createElement(React.Fragment, null,
    React.createElement('span', {
      ref,
      onMouseEnter: onEnter,
      onMouseLeave: () => setShow(false),
      style:{ color:'var(--warning)', fontSize:13, lineHeight:1, cursor:'help', display:'inline-flex' }
    }, '⚠'),
    show && ReactDOM.createPortal(
      React.createElement('div', {
        style: {
          position:'fixed', top: pos.top, left: pos.left, transform:'translate(-50%, -100%)',
          background:'var(--text-primary)', color:'var(--bg-card)', padding:'10px 14px', borderRadius:8,
          fontSize:12, lineHeight:1.55, maxWidth:280, zIndex:2000, pointerEvents:'none',
          boxShadow:'0 8px 24px rgba(0,0,0,.18)', whiteSpace:'normal', textAlign:'left',
          animation:'modalIn .12s ease',
        }
      },
        React.createElement('div', { style:{ fontWeight:700, marginBottom:3, display:'flex', alignItems:'center', gap:5 } }, '⚠ Превышение нормы'),
        React.createElement('div', { style:{ opacity:.85 } },
          label, ': факт ', React.createElement('b', { style:{ color:'var(--warning)' } }, fmtPct(fact)),
          ' при норме ', React.createElement('b', null, norm + '%')
        ),
        React.createElement('div', { style:{ opacity:.6, marginTop:4, fontSize:11 } }, 'Задаётся в Настройки → Нормы по показателям'),
        // Arrow
        React.createElement('div', { style:{ position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%) rotate(45deg)', width:10, height:10, background:'var(--text-primary)' } })
      ),
      document.body
    )
  );
}

// ── Main report ─────────────────────────────────────────────────────────────
function NomenclatureReportV2({ paid: initialPaid = false }) {
  const [mode, setMode] = React.useState(initialPaid ? 'pro' : 'standard');
  const paid = mode === 'pro';
  const [collapsedGroups, setCollapsedGroups] = React.useState({});
  function toggleGroup(id) { setCollapsedGroups(g => ({ ...g, [id]: !g[id] })); }
  const [sortCol, setSortCol] = React.useState('salesRub');
  const [sortDir, setSortDir] = React.useState('desc');
  const [filter, setFilter] = React.useState({});
  const [expanded, setExpanded] = React.useState({});
  const [groupsExpanded, setGroupsExpanded] = React.useState({ sales:true, expenses: paid, margin:true });
  const [patterns, setPatterns] = React.useState({
    heatmap: true, bars: true, threshold: true, delta: paid,
    rank: true, severity: true, sparklines: false, rowFill: paid,
  });
  const [previewProduct, setPreviewProduct] = React.useState(null);

  // React to mode change
  React.useEffect(() => {
    setGroupsExpanded(g => ({ ...g, expenses: paid }));
    setPatterns(p => ({ ...p, delta: paid, rowFill: paid }));
  }, [paid]);

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  // Filter + sort
  const rows = React.useMemo(() => {
    let r = PRODUCTS.map(p => {
      const buyout = p.sales - p.returns;
      const perUnit = p.salesRub / p.sales;
      return {
        ...p,
        buyout,
        buyoutPct: buyout / p.sales * 100,
        returnsRub: Math.round(p.returns * perUnit),
        returnsPct: p.returns / p.sales * 100,
        costPct: p.cost / p.salesRub * 100,
        logisticsRub: Math.round(p.logistics / 100 * p.salesRub),
        storageRub: Math.round(p.storage / 100 * p.salesRub),
        adsRub: Math.round(p.ads / 100 * p.salesRub),
        commissionRub: Math.round(p.commission / 100 * p.salesRub),
        acceptanceRub: Math.round(p.acceptance / 100 * p.salesRub),
        roi: Math.round(p.marginRub / p.cost * 100),
      };
    });
    if (filter.q) r = r.filter(x => x.name.toLowerCase().includes(filter.q.toLowerCase()) || x.sku.includes(filter.q));
    if (filter.cat && filter.cat !== 'all') r = r.filter(x => x.cat === filter.cat);
    if (filter.marginType === 'positive') r = r.filter(x => x.margin > 0);
    if (filter.marginType === 'negative') r = r.filter(x => x.margin < 0);
    r.sort((a, b) => {
      const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return r;
  }, [filter, sortCol, sortDir]);

  // Column statistics for heatmap & ranking
  const colStats = React.useMemo(() => {
    const stats = {};
    COLUMN_GROUPS.forEach(g => g.cols.forEach(c => {
      if (!c.numeric) return;
      const vals = rows.map(r => r[c.key]).filter(v => v != null);
      stats[c.key] = { min: Math.min(...vals), max: Math.max(...vals), avg: vals.reduce((a,b)=>a+b,0)/vals.length };
    }));
    return stats;
  }, [rows]);

  // Ranking: top 3 + bottom 3 per key column
  const rankings = React.useMemo(() => {
    const out = {};
    ['salesRub','margin','marginRub'].forEach(k => {
      const sorted = [...rows].sort((a,b) => (b[k]||0) - (a[k]||0));
      out[k] = { top: {}, bottom: {} };
      sorted.slice(0,3).forEach((r,i) => out[k].top[r.id] = i+1);
      sorted.slice(-3).reverse().forEach((r,i) => out[k].bottom[r.id] = i+1);
    });
    return out;
  }, [rows]);

  function getRank(row, key) {
    const r = rankings[key];
    if (!r) return null;
    return { top: r.top[row.id], bottom: r.bottom[row.id] };
  }

  // Visible columns by mode (standard shows std:true cols; pro shows all)
  const visibleGroups = COLUMN_GROUPS.map(g => ({
    ...g,
    cols: g.cols.filter(c => paid || c.std),
    collapsed: !!collapsedGroups[g.id],
  })).filter(g => g.cols.length);
  const visibleCols = visibleGroups.flatMap(g => g.collapsed ? [] : g.cols.map(c => ({ ...c, group: g.id })));
  // Render slots: a collapsed group becomes one narrow placeholder cell
  const colSlots = visibleGroups.flatMap(g =>
    g.collapsed
      ? [{ type:'collapsed', group:g, width:44 }]
      : g.cols.map((c, i) => ({ type:'col', col:{ ...c, group:g.id }, width:c.width, firstInGroup:i===0 }))
  );
  const tableMinWidth = 280 + colSlots.reduce((s,sl) => s + sl.width, 0);

  // Sticky col styles
  const stickyStyle = { position:'sticky', left:0, background:'var(--bg-card)', zIndex:2, borderRight:'1px solid var(--border)' };
  const stickyHeadStyle = { ...stickyStyle, background:'var(--bg-card)', zIndex:3 };

  const modeToggle = React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, width:'100%' } },
    React.createElement('div', { style:{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' } },
      React.createElement('div', { style:{ display:'inline-flex', padding:3, background:'var(--bg-base)', borderRadius:8, gap:2 } },
        [
          { id:'standard', label:'Стандартный', icon:'chart' },
          { id:'pro',      label:'Расширенный Pro', icon:'database' }
        ].map(m =>
          React.createElement('button', { key:m.id, onClick:()=>setMode(m.id),
            style:{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', background: mode===m.id?'var(--bg-card)':'transparent', color: mode===m.id?'var(--text-primary)':'var(--text-secondary)', boxShadow: mode===m.id?'0 1px 3px rgba(0,0,0,.08)':'none', transition:'all .15s' }
          },
            React.createElement(Icon, { name:m.icon, size:14 }),
            m.label,
            m.id === 'pro' && React.createElement('span', { style:{ fontSize:9, padding:'1px 5px', borderRadius:3, background:'var(--accent)', color:'#fff', fontWeight:700, letterSpacing:.3 } }, 'PRO')
          )
        )
      ),
      React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } },
        paid ? 'Все колонки по выручке и издержкам' : 'Базовый набор метрик'
      )
    ),
    React.createElement('div', { style:{ display:'flex', gap:8 } },
      React.createElement(Button, { variant:'secondary', size:'sm', icon:'download' }, 'Excel'),
      paid && React.createElement(Button, { variant:'secondary', size:'sm', icon:'download' }, 'PDF')
    )
  );

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    React.createElement(PatternsLegend, { patterns, setPatterns }),

    React.createElement(FilterBar, { onFilter: setFilter, extra: modeToggle }),

    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ overflowX:'auto' } },
        React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse', minWidth: tableMinWidth } },
          React.createElement('thead', null,
            // Group header row
            React.createElement('tr', { style:{ background:'var(--bg-card)' } },
              React.createElement('th', { rowSpan:2, style:{ ...stickyHeadStyle, padding:'10px 14px', textAlign:'left', minWidth:280, fontSize:12, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.4, borderBottom:'1px solid var(--border)', verticalAlign:'bottom' } }, 'Товар'),
              visibleGroups.map((g) =>
                React.createElement('th', {
                  key:g.id, colSpan: g.collapsed ? 1 : g.cols.length,
                  onClick: () => toggleGroup(g.id),
                  title: g.collapsed ? 'Развернуть «' + g.label + '»' : 'Свернуть «' + g.label + '»',
                  style:{ padding:'8px 12px', textAlign:'center', fontSize:12, fontWeight:700, color:'var(--text-primary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }
                },
                  React.createElement('span', { style:{ display:'inline-flex', alignItems:'center', gap:5, justifyContent:'center' } },
                    React.createElement(Icon, { name: g.collapsed ? 'chevronRight' : 'chevronDown', size:13, color:'var(--text-secondary)' }),
                    g.collapsed ? '' : g.label
                  )
                )
              )
            ),
            // Column header row
            React.createElement('tr', { style:{ background:'var(--bg-card)' } },
              colSlots.map((sl) => {
                if (sl.type === 'collapsed')
                  return React.createElement('th', { key:'col-'+sl.group.id, onClick:()=>toggleGroup(sl.group.id),
                    title:'Развернуть «' + sl.group.label + '»',
                    style:{ borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', cursor:'pointer', width:44, minWidth:44 } });
                const c = sl.col;
                return React.createElement(SortableHeader, { key:c.key, label:c.label, column:c.key, sortCol, sortDir, onSort:handleSort, align:'right', borderLeft: sl.firstInGroup, highlight: paid && !c.std });
              })
            )
          ),
          React.createElement('tbody', null,
            rows.flatMap((row, rowIdx) => {
              const sev = severityDot(row);
              const sizesBreak = makeSizeBreakdown(row);
              const isExpanded = expanded[row.id];
              const rowFill = patterns.rowFill && sev.color !== 'transparent' && sev.flags.includes('negMargin');
              return [
                React.createElement('tr', {
                  key: row.id,
                  style: { background: rowFill ? 'color-mix(in srgb, var(--negative) 6%, var(--bg-card))' : (rowIdx % 2 === 1 ? 'color-mix(in srgb, var(--text-secondary) 8%, var(--bg-card))' : 'var(--bg-card)'), transition:'background .12s' }
                },
                  // Sticky first cell: severity stripe + thumbnail + SKU + name
                  React.createElement('td', { style:{ ...stickyStyle, background: rowFill ? 'color-mix(in srgb, var(--negative) 6%, var(--bg-card))' : (rowIdx % 2 === 1 ? 'color-mix(in srgb, var(--text-secondary) 8%, var(--bg-card))' : 'var(--bg-card)'), padding:'10px 14px', borderBottom:'1px solid var(--border)', width:280, minWidth:280, maxWidth:280 } },
                    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, minWidth:0 } },
                      // Severity stripe
                      patterns.severity && React.createElement('div', { style:{ width:3, alignSelf:'stretch', borderRadius:2, background: sev.color, flexShrink:0 } }),
                      // Expand chevron
                      React.createElement('button', {
                        onClick: () => setExpanded(ex => ({ ...ex, [row.id]: !ex[row.id] })),
                        style:{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:2, display:'flex', alignItems:'center' }
                      }, React.createElement(Icon, { name: isExpanded ? 'chevronDown' : 'chevronRight', size:14 })),
                      // Thumbnail
                      React.createElement('div', { onClick: ()=>setPreviewProduct(row), style:{ cursor:'zoom-in' } },
                        React.createElement(ProductThumb, { p: row })
                      ),
                      // SKU + Name
                      React.createElement('div', { style:{ minWidth:0, flex:1 } },
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
                          React.createElement('span', { style:{ fontFamily:'monospace', fontSize:11.5, color:'var(--accent)', fontWeight:600 } }, row.sku),
                          patterns.severity && sev.flags.includes('top') && React.createElement('span', { style:{ fontSize:10, padding:'1px 5px', borderRadius:4, background:'color-mix(in srgb, var(--positive) 18%, transparent)', color:'var(--positive)', fontWeight:700 } }, '★ ЛИДЕР'),
                          patterns.severity && sev.flags.includes('negMargin') && React.createElement('span', { style:{ fontSize:10, padding:'1px 5px', borderRadius:4, background:'color-mix(in srgb, var(--negative) 18%, transparent)', color:'var(--negative)', fontWeight:700 } }, '⚠ УБЫТОК')
                        ),
                        React.createElement('div', { style:{ fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 } }, row.name),
                        React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', marginTop:1, display:'flex', alignItems:'center', gap:8 } },
                          row.cat, ' · ', row.brand,
                          patterns.sparklines && React.createElement(Spark, { color: sev.flags.includes('negMargin') ? 'var(--negative)' : 'var(--positive)', seed: row.id, trend: row.margin > 0 ? 1 : -0.8 })
                        )
                      )
                    )
                  ),
                  ...colSlots.map((sl) => {
                    if (sl.type === 'collapsed') {
                      const rowBg = rowFill ? 'color-mix(in srgb, var(--negative) 6%, var(--bg-card))' : (rowIdx % 2 === 1 ? 'color-mix(in srgb, var(--text-secondary) 8%, var(--bg-card))' : 'var(--bg-card)');
                      return React.createElement('td', { key:'c-'+sl.group.id, onClick:()=>toggleGroup(sl.group.id),
                        style:{ borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', background:rowBg, cursor:'pointer', textAlign:'center', color:'var(--text-secondary)' } },
                        React.createElement(Icon, { name:'chevronRight', size:12 }));
                    }
                    const c = sl.col;
                    return React.createElement(Cell, {
                      key: c.key + c.group, row, col: c, colStats: colStats[c.key],
                      patterns, rank: getRank(row, c.key),
                      firstInGroup: sl.firstInGroup,
                    });
                  })
                ),
                // Expanded: size breakdown as table rows (same columns)
                isExpanded && sizesBreak.map(sizeRow =>
                  React.createElement('tr', { key: row.id + '-' + sizeRow.size,
                    style: { background:'var(--bg-card)', fontSize:13 }
                  },
                    React.createElement('td', { style:{ ...stickyStyle, background:'var(--bg-card)', padding:'7px 14px 7px 70px', borderBottom:'1px solid var(--border)' } },
                      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8, color:'var(--text-secondary)' } },
                        React.createElement('span', { style:{ fontSize:11 } }, '└'),
                        React.createElement('span', { style:{ fontSize:12, fontWeight:600, padding:'2px 7px', borderRadius:4, background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-primary)' } }, 'Размер ' + sizeRow.size),
                        React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, fmtPct(sizeRow.sales / row.sales * 100, 0) + ' от продаж')
                      )
                    ),
                    ...colSlots.map((sl) => {
                      if (sl.type === 'collapsed')
                        return React.createElement('td', { key:'c-'+sl.group.id, onClick:()=>toggleGroup(sl.group.id),
                          style:{ borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', background:'var(--bg-card)', cursor:'pointer', textAlign:'center', color:'var(--text-secondary)' } },
                          React.createElement(Icon, { name:'chevronRight', size:12 }));
                      const c = sl.col;
                      const sizeVal = sizeRow[c.key] != null ? sizeRow : { ...row, ...sizeRow };
                      return React.createElement(Cell, {
                        key: c.key + sizeRow.size, row: sizeVal, col: c, colStats: colStats[c.key],
                        patterns: { ...patterns, rank: false, severity: false, rowFill: false, sparklines: false, delta: patterns.delta && c.key === 'margin' },
                        rank: null,
                        sizeMode: true,
                        firstInGroup: sl.firstInGroup,
                      });
                    })
                  )
                )
              ].filter(Boolean);
            })
          )
        )
      )
    ),

    paid && React.createElement(AIInsights, { rows }),

    // Image preview modal
    previewProduct && React.createElement(Modal, { open:true, onClose:()=>setPreviewProduct(null), title: previewProduct.name, width:480 },
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
        React.createElement('div', { style:{ aspectRatio:'1/1', width:'100%', borderRadius:14, ...thumbStyle(previewProduct.sku), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:120, fontWeight:800, letterSpacing:-2 } },
          thumbInitials(previewProduct.name).toUpperCase()
        ),
        React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } },
          'Артикул: ', React.createElement('span', { style:{ fontFamily:'monospace', color:'var(--accent)' } }, previewProduct.sku), ' · ',
          previewProduct.cat, ' · ', previewProduct.brand
        ),
        React.createElement(Alert, { type:'info' }, 'Реальные фотографии товаров подгружаются из карточек маркетплейса по API. Здесь — плейсхолдер с инициалами.')
      )
    )
  );
}

function AIInsights({ rows }) {
  const top = rows.find(r => r.margin > 25);
  const worst = rows.find(r => r.margin < 0);
  const overLog = rows.find(r => r.logistics > 12);

  return React.createElement(Card, { style:{ padding:20 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, marginBottom:14 } },
      React.createElement('div', { style:{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg, var(--accent), #8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' } },
        React.createElement(Icon, { name:'info', size:15, color:'#fff' })
      ),
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, color:'var(--text-primary)', margin:0 } }, 'AI-рекомендации')
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
      worst && React.createElement(InsightRow, { color:'var(--negative)', icon:'alertTriangle',
        text: `${worst.sku} «${worst.name}»: маржа ${fmtPct(worst.margin)}. Себестоимость ${fmtPct(worst.cost/worst.salesRub*100)} от выручки. Рассмотрите повышение цены на ${Math.abs(Math.round(worst.margin * -1.5))}% или смену поставщика.` }),
      overLog && React.createElement(InsightRow, { color:'var(--warning)', icon:'alertTriangle',
        text: `${overLog.sku}: логистика ${fmtPct(overLog.logistics)} — выше нормы (8%). Размещение на ближайший региональный склад снизит расход на 30-40%.` }),
      top && React.createElement(InsightRow, { color:'var(--positive)', icon:'trendingUp',
        text: `${top.sku} «${top.name}»: маржа ${fmtPct(top.margin)} — топ портфеля. Увеличьте бюджет рекламы на 25% и расширьте размерную сетку.` }),
    )
  );
}

function InsightRow({ color, icon, text }) {
  return React.createElement('div', { style:{ display:'flex', gap:10, padding:'10px 14px', background:'var(--bg-base)', borderRadius:8 } },
    React.createElement(Icon, { name:icon, size:16, color, style:{ marginTop:2, flexShrink:0 } }),
    React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', lineHeight:1.55 } }, text)
  );
}

Object.assign(window, { NomenclatureReportV2, ProductThumb, thumbStyle, thumbInitials });
