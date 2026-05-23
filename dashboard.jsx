
// ── Dashboard v3 — максимально информативный ───────────────────────────────

const { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;

function useThemeColors() {
  const { theme } = (window.useTheme && window.useTheme()) || { theme: 'light' };
  return React.useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const get = name => cs.getPropertyValue(name).trim();
    return {
      accent: get('--accent') || '#4F6EF7',
      positive: get('--positive') || '#12B76A',
      negative: get('--negative') || '#F04438',
      warning: get('--warning') || '#F79009',
      border: get('--border') || '#E6EAF2',
      cardBg: get('--bg-card') || '#FFFFFF',
      textSec: get('--text-secondary') || '#6B7A99',
    };
  }, [theme]);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function MiniSparkline({ data, color, height = 36 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaPath = `${path} L${width},${height} L0,${height} Z`;
  return React.createElement('svg', { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio:'none', style:{ width:'100%', height, display:'block' } },
    React.createElement('defs', null,
      React.createElement('linearGradient', { id:`sk-${color.replace('#','')}-${Math.random().toString(36).slice(2,8)}`, x1:0, y1:0, x2:0, y2:1 },
        React.createElement('stop', { offset:'0%', stopColor:color, stopOpacity:0.35 }),
        React.createElement('stop', { offset:'100%', stopColor:color, stopOpacity:0.02 })
      )
    ),
    React.createElement('path', { d:areaPath, fill:color, fillOpacity:0.12 }),
    React.createElement('path', { d:path, stroke:color, strokeWidth:1.8, fill:'none' })
  );
}

function DeltaChip({ value, suffix = '%' }) {
  const pos = value >= 0;
  return React.createElement('span', {
    style:{ display:'inline-flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:6, background: `color-mix(in srgb, var(--${pos?'positive':'negative'}) 14%, transparent)`, color: `var(--${pos?'positive':'negative'})`, fontSize:12, fontWeight:700, fontVariantNumeric:'tabular-nums' }
  },
    pos ? '↑' : '↓', Math.abs(value).toFixed(1), suffix
  );
}

// ── KPI card with sparkline ─────────────────────────────────────────────────
function KpiSparkCard({ label, value, delta, spark, sparkColor, sub }) {
  return React.createElement(Card, { style:{ flex:'1 1 220px', padding:20, display:'flex', flexDirection:'column', gap:12, minHeight:140 } },
    React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 } }, label),
    React.createElement('div', { style:{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8 } },
      React.createElement('span', { style:{ fontSize:26, fontWeight:800, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums', letterSpacing:-.4 } }, value),
      React.createElement(DeltaChip, { value: delta })
    ),
    sub && React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)' } }, sub),
    React.createElement('div', { style:{ marginTop:'auto' } },
      React.createElement(MiniSparkline, { data: spark, color: sparkColor || 'var(--accent)' })
    )
  );
}

// ── Marketplace split (donut + list) ────────────────────────────────────────
function MpSplitCard() {
  const c = useThemeColors();
  const data = [
    { name:'Wildberries',  value:3720000, color:'#CB11AB', sales:1240, share:60.8 },
    { name:'Ozon',         value:1680000, color:'#005BFF', sales:580,  share:27.5 },
    { name:'Яндекс Маркет',value: 720000, color:'#FC3F1D', sales:210,  share:11.7 },
  ];
  const total = data.reduce((s,d)=>s+d.value,0);

  return React.createElement(Card, { style:{ flex:'1 1 320px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Выручка по маркетплейсам'),
      React.createElement('span', { style:{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, padding:'3px 8px', borderRadius:6, background:'var(--bg-base)' } }, 'Апрель')
    ),
    React.createElement('div', { style:{ display:'flex', gap:18, alignItems:'center' } },
      React.createElement('div', { style:{ position:'relative', width:130, height:130, flexShrink:0 } },
        React.createElement(ResponsiveContainer, { width:'100%', height:'100%' },
          React.createElement(PieChart, null,
            React.createElement(Pie, { data, cx:'50%', cy:'50%', innerRadius:42, outerRadius:62, dataKey:'value', paddingAngle:1.5, startAngle:90, endAngle:-270 },
              data.map((d,i) => React.createElement(Cell, { key:i, fill:d.color, stroke:'none' }))
            )
          )
        ),
        React.createElement('div', { style:{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', pointerEvents:'none' } },
          React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } }, 'Всего'),
          React.createElement('div', { style:{ fontSize:16, fontWeight:800, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums', marginTop:1 } }, '₽6.1м')
        )
      ),
      React.createElement('div', { style:{ flex:1, display:'flex', flexDirection:'column', gap:10 } },
        data.map((d,i) =>
          React.createElement('div', { key:d.name, style:{ display:'flex', flexDirection:'column', gap:3 } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 } },
              React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6, minWidth:0 } },
                React.createElement('span', { style:{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 } }),
                React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, d.name)
              ),
              React.createElement('span', { style:{ fontSize:13, fontWeight:700, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' } }, d.share + '%')
            ),
            React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums', paddingLeft:14 } },
              fmtRub(d.value), ' · ', fmtNum(d.sales), ' заказов'
            )
          )
        )
      )
    )
  );
}

// ── Main revenue chart with multi-line (revenue + profit) ───────────────────
function RevenueDynamicsCard() {
  const c = useThemeColors();
  const [scope, setScope] = React.useState('month');
  const days = 30;
  const data = React.useMemo(() => {
    return Array.from({length:days}, (_, i) => {
      const base = 180000 + Math.sin(i*0.35) * 30000 + i*1500;
      const revenue = Math.round(base + (Math.sin(i*1.3)+0.5) * 18000);
      const profit = Math.round(revenue * (0.18 + Math.sin(i*0.6)*0.05));
      const target = Math.round(200000 + i*1800);
      return { day: i+1, revenue, profit, target };
    });
  }, [scope]);

  return React.createElement(Card, { style:{ flex:'2 1 600px', padding:24, minWidth:0 } },
    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 } },
      React.createElement('div', null,
        React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Динамика выручки и прибыли'),
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, 'Апрель 2026 vs план')
      ),
      React.createElement('div', { style:{ display:'flex', gap:4, background:'var(--bg-base)', padding:3, borderRadius:7 } },
        ['week','month','quarter'].map(p =>
          React.createElement('button', { key:p, onClick:()=>setScope(p),
            style:{ padding:'5px 12px', borderRadius:5, border:'none', background: scope===p ? 'var(--bg-card)':'transparent', color: scope===p?'var(--text-primary)':'var(--text-secondary)', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', boxShadow: scope===p ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }
          }, p==='week'?'Неделя':p==='month'?'Месяц':'Квартал')
        )
      )
    ),
    React.createElement('div', { style:{ display:'flex', gap:24, marginTop:12, marginBottom:12 } },
      [
        { label:'Выручка', value: fmtRub(6120000), delta: 7.8, color: c.accent },
        { label:'Прибыль', value: fmtRub(1433000), delta: 9.4, color: c.positive },
        { label:'Цель', value: fmtRub(6500000), delta: -5.8, color: c.warning },
      ].map((s,i) =>
        React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:8 } },
          React.createElement('span', { style:{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 } }),
          React.createElement('div', null,
            React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, s.label),
            React.createElement('div', { style:{ fontSize:14, fontWeight:700, fontVariantNumeric:'tabular-nums' } }, s.value)
          )
        )
      )
    ),
    React.createElement(ResponsiveContainer, { width:'100%', height:230 },
      React.createElement(AreaChart, { data, margin:{ top:8, right:8, left:-10, bottom:0 } },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id:'g-revenue', x1:0, y1:0, x2:0, y2:1 },
            React.createElement('stop', { offset:'0%', stopColor: c.accent, stopOpacity:0.30 }),
            React.createElement('stop', { offset:'100%', stopColor: c.accent, stopOpacity:0.0 })
          )
        ),
        React.createElement(CartesianGrid, { strokeDasharray:'2 4', stroke:'var(--border)', vertical:false }),
        React.createElement(XAxis, { dataKey:'day', tick:{ fontSize:11, fill:'var(--text-secondary)' }, tickLine:false, axisLine:false, interval:4 }),
        React.createElement(YAxis, { tick:{ fontSize:11, fill:'var(--text-secondary)' }, tickLine:false, axisLine:false, tickFormatter:v=>'₽'+Math.round(v/1000)+'к' }),
        React.createElement(Tooltip, { contentStyle:{ background: c.cardBg, border:`1px solid ${c.border}`, borderRadius:8, fontSize:12 }, formatter:(v,n) => [fmtRub(v), n==='revenue'?'Выручка':n==='profit'?'Прибыль':'Цель'] }),
        React.createElement(Area, { type:'monotone', dataKey:'revenue', stroke: c.accent, strokeWidth:2.2, fill:'url(#g-revenue)', dot:false }),
        React.createElement(Line, { type:'monotone', dataKey:'profit',  stroke: c.positive, strokeWidth:2, dot:false }),
        React.createElement(Line, { type:'monotone', dataKey:'target',  stroke: c.warning, strokeWidth:1.5, strokeDasharray:'5 4', dot:false })
      )
    )
  );
}

// ── Expense vs norm horizontal bars ─────────────────────────────────────────
function ExpenseNormsCard() {
  const items = [
    { id:'logistics',  label:'Логистика',     fact:8.1,  norm:8,  rub:495000 },
    { id:'storage',    label:'Хранение',       fact:2.9,  norm:4,  rub:177000 },
    { id:'ads',        label:'Реклама',        fact:6.2,  norm:5,  rub:380000 },
    { id:'cost',       label:'Себестоимость',  fact:33.8, norm:34, rub:2069000 },
    { id:'commission', label:'Комиссия МП',    fact:11.2, norm:11, rub:685000 },
  ];
  return React.createElement(Card, { style:{ flex:'1 1 360px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Расходы vs нормы'),
      React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, '% от выручки')
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
      items.map(it => {
        const over = it.fact > it.norm;
        const scale = Math.max(it.fact, it.norm) * 1.15;
        const factW = (it.fact / scale) * 100;
        const normW = (it.norm / scale) * 100;
        return React.createElement('div', { key:it.id, style:{ display:'flex', flexDirection:'column', gap:6 } },
          React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
            React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', fontWeight:500 } }, it.label),
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
              React.createElement('span', { style:{ fontSize:11, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' } }, fmtRub(it.rub)),
              React.createElement('span', { style:{ fontSize:13, fontWeight:700, color: over ? 'var(--negative)' : 'var(--positive)', fontVariantNumeric:'tabular-nums' } }, fmtPct(it.fact))
            )
          ),
          React.createElement('div', { style:{ position:'relative', height:8, background:'var(--bg-base)', borderRadius:4, overflow:'hidden' } },
            React.createElement('div', { style:{ position:'absolute', top:0, left:0, height:'100%', width: factW+'%', background: over ? 'var(--negative)' : 'var(--positive)', borderRadius:4, transition:'width .3s' } }),
            React.createElement('div', { style:{ position:'absolute', top:-3, left: normW+'%', width:2, height:14, background:'var(--text-secondary)', opacity:.6, borderRadius:1 } })
          ),
          React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'Норма ', fmtPct(it.norm))
        );
      })
    )
  );
}

// ── Cash flow card ──────────────────────────────────────────────────────────
function CashFlowCard() {
  const upcoming = [
    { date:'Сегодня',    mp:'Wildberries', amount:380000,  status:'pending' },
    { date:'Завтра',     mp:'Ozon',        amount:215000,  status:'pending' },
    { date:'5 мая',      mp:'Wildberries', amount:620000,  status:'planned' },
    { date:'8 мая',      mp:'Яндекс Маркет', amount:120000,status:'planned' },
  ];
  const obligations = [
    { label:'ФОТ май',    amount:-350000, date:'25 мая' },
    { label:'Аренда',     amount:-180000, date:'5 мая' },
    { label:'Налог УСН',  amount:-285000, date:'30 апр' },
  ];
  return React.createElement(Card, { style:{ flex:'1 1 320px', padding:24, minWidth:280 } },
    React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:'0 0 4px' } }, 'Денежный поток'),
    React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', marginBottom:18 } }, 'Поступления и обязательства, 14 дней'),
    React.createElement('div', { style:{ display:'flex', gap:10, marginBottom:18 } },
      React.createElement('div', { style:{ flex:1, padding:'10px 12px', background:'color-mix(in srgb, var(--positive) 12%, transparent)', borderRadius:8 } },
        React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'Ожидаемые поступления'),
        React.createElement('div', { style:{ fontSize:18, fontWeight:800, color:'var(--positive)', fontVariantNumeric:'tabular-nums', marginTop:3 } }, fmtRub(upcoming.reduce((s,u)=>s+u.amount,0)))
      ),
      React.createElement('div', { style:{ flex:1, padding:'10px 12px', background:'color-mix(in srgb, var(--negative) 12%, transparent)', borderRadius:8 } },
        React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'Обязательства'),
        React.createElement('div', { style:{ fontSize:18, fontWeight:800, color:'var(--negative)', fontVariantNumeric:'tabular-nums', marginTop:3 } }, fmtRub(obligations.reduce((s,o)=>s+o.amount,0)))
      )
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:1 } },
      React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:6 } }, 'Ближайшие операции'),
      [...upcoming.slice(0,3).map((u,i) => ({ ...u, type:'in' })), ...obligations.slice(0,2).map((o,i)=>({ date:o.date, mp:o.label, amount:o.amount, type:'out' }))]
        .map((r,i) =>
          React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom: i<4?'1px solid var(--border)':'none' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1 } },
              React.createElement('span', { style:{ fontSize:11, color: r.type==='in'?'var(--positive)':'var(--negative)', fontWeight:700, width:14, textAlign:'center' } }, r.type==='in'?'+':'−'),
              React.createElement('span', { style:{ fontSize:12, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, r.mp),
              React.createElement('span', { style:{ fontSize:11, color:'var(--text-secondary)' } }, '· ', r.date)
            ),
            React.createElement('span', { style:{ fontSize:13, fontWeight:700, fontVariantNumeric:'tabular-nums', color: r.type==='in'?'var(--positive)':'var(--negative)' } }, fmtRub(Math.abs(r.amount)))
          )
        )
    )
  );
}

// ── Top SKU leaderboard ─────────────────────────────────────────────────────
function TopSkuCard() {
  const sorted = [...PRODUCTS].sort((a,b)=>b.marginRub - a.marginRub).slice(0, 6);
  const maxMargin = Math.max(...sorted.map(p => p.marginRub));
  return React.createElement(Card, { style:{ flex:'1 1 480px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Топ номенклатуры по марже'),
      React.createElement('button', { style:{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' } }, 'Все товары →')
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      sorted.map((p, i) => {
        const pct = (p.marginRub / maxMargin) * 100;
        return React.createElement('div', { key:p.id, style:{ display:'flex', alignItems:'center', gap:12 } },
          React.createElement('div', { style:{ width:22, fontSize:13, fontWeight:700, color:'var(--text-secondary)', textAlign:'center' } }, '#' + (i+1)),
          React.createElement('div', { style:{ width:32, height:32, borderRadius:6, flexShrink:0, ...thumbStyle(p.sku), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700 } }, thumbInitials(p.name).toUpperCase()),
          React.createElement('div', { style:{ flex:1, minWidth:0 } },
            React.createElement('div', { style:{ fontSize:13, color:'var(--text-primary)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, p.name),
            React.createElement('div', { style:{ height:4, background:'var(--border)', borderRadius:2, marginTop:5, overflow:'hidden' } },
              React.createElement('div', { style:{ width:pct+'%', height:'100%', background: p.margin > 25 ? 'var(--positive)' : 'var(--accent)' } })
            )
          ),
          React.createElement('div', { style:{ textAlign:'right' } },
            React.createElement('div', { style:{ fontSize:13, fontWeight:700, fontVariantNumeric:'tabular-nums' } }, fmtRub(p.marginRub)),
            React.createElement('div', { style:{ fontSize:11, color: marginColor(p.margin), fontWeight:600 } }, fmtPct(p.margin))
          )
        );
      })
    )
  );
}

// ── Critical alerts ─────────────────────────────────────────────────────────
function CriticalAlertsCard() {
  const alerts = [
    { icon:'alertTriangle', color:'var(--negative)', title:'Убыточные товары', n:2, desc:'WP-0043, WP-0050 с маржой ниже 0%' },
    { icon:'alertTriangle', color:'var(--warning)', title:'Логистика выше нормы', n:3, desc:'8.1% vs 8% — превышение на 0.1 п.п.' },
    { icon:'package', color:'var(--accent)', title:'Без движения 60+ дней', n:4, desc:'Хранение ₽245 000 на остатках' },
    { icon:'refresh', color:'var(--positive)', title:'Растущие SKU', n:5, desc:'Маска для сна +42% маржа' },
    { icon:'key', color:'var(--warning)', title:'Истекает токен ЯМ', n:1, desc:'Срок действия 1 мая 2026' },
  ];
  return React.createElement(Card, { style:{ flex:'1 1 380px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Критичные точки'),
      React.createElement('span', { style:{ fontSize:11, padding:'3px 8px', borderRadius:10, background:'color-mix(in srgb, var(--negative) 14%, transparent)', color:'var(--negative)', fontWeight:700 } }, alerts.reduce((s,a)=>s+a.n,0) + ' событий')
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
      alerts.map((a, i) =>
        React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'var(--bg-base)', cursor:'pointer', transition:'transform .12s' },
          onMouseEnter:e=>e.currentTarget.style.transform='translateX(3px)',
          onMouseLeave:e=>e.currentTarget.style.transform='translateX(0)'
        },
          React.createElement('div', { style:{ width:32, height:32, borderRadius:'50%', background: `color-mix(in srgb, ${a.color} 18%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
            React.createElement(Icon, { name:a.icon, size:15, color:a.color })
          ),
          React.createElement('div', { style:{ flex:1, minWidth:0 } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
              React.createElement('span', { style:{ fontSize:13, fontWeight:600, color:'var(--text-primary)' } }, a.title),
              React.createElement('span', { style:{ fontSize:10, padding:'1px 6px', borderRadius:4, background: a.color, color:'#fff', fontWeight:700 } }, a.n)
            ),
            React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, a.desc)
          ),
          React.createElement(Icon, { name:'chevronRight', size:14, color:'var(--text-secondary)' })
        )
      )
    )
  );
}

// ── Inventory health ────────────────────────────────────────────────────────
function InventoryHealthCard() {
  const items = [
    { sku:'WP-0049', name:'Маска для сна',           stock:48,  daysOfCover:1.4,  trend:'critical' },
    { sku:'WP-0044', name:'Перчатки зимние',          stock:182, daysOfCover:14.2, trend:'ok' },
    { sku:'WP-0042', name:'Футболка базовая унисекс', stock:24,  daysOfCover:2.8,  trend:'low' },
    { sku:'WP-0050', name:'Органайзер для ящика',     stock:920, daysOfCover:84.5, trend:'overstock' },
  ];
  const colorMap = {
    critical: { c:'var(--negative)', label:'критично', icon:'alertTriangle' },
    low:      { c:'var(--warning)',  label:'низкий',   icon:'alertTriangle' },
    ok:       { c:'var(--positive)', label:'норма',    icon:'check' },
    overstock:{ c:'var(--accent)',   label:'излишек',  icon:'package' },
  };
  return React.createElement(Card, { style:{ flex:'1 1 380px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Здоровье склада'),
      React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, 'Дней до OOS')
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      items.map((it,i) => {
        const m = colorMap[it.trend];
        return React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:12 } },
          React.createElement('div', { style:{ width:36, height:36, borderRadius:8, background: `color-mix(in srgb, ${m.c} 16%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
            React.createElement(Icon, { name:m.icon, size:16, color:m.c })
          ),
          React.createElement('div', { style:{ flex:1, minWidth:0 } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
              React.createElement('span', { style:{ fontFamily:'monospace', fontSize:11, color:'var(--accent)', fontWeight:700 } }, it.sku),
              React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, it.name)
            ),
            React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', marginTop:2 } }, fmtNum(it.stock) + ' шт на складе · ', m.label)
          ),
          React.createElement('div', { style:{ textAlign:'right' } },
            React.createElement('div', { style:{ fontSize:16, fontWeight:800, color: m.c, fontVariantNumeric:'tabular-nums' } }, it.daysOfCover.toFixed(1)),
            React.createElement('div', { style:{ fontSize:10, color:'var(--text-secondary)' } }, 'дней')
          )
        );
      })
    ),
    React.createElement('div', { style:{ marginTop:14, padding:'10px 14px', background:'var(--bg-base)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 } },
      React.createElement('span', { style:{ color:'var(--text-secondary)' } }, 'Замороженные средства'),
      React.createElement('span', { style:{ fontWeight:700, fontVariantNumeric:'tabular-nums' } }, fmtRub(1842000))
    )
  );
}

// ── Returns reasons breakdown ───────────────────────────────────────────────
function ReturnsReasonsCard() {
  const reasons = [
    { label:'Не подошёл размер',     value:142, pct:38, color:'#F79009' },
    { label:'Брак / повреждение',    value:78,  pct:21, color:'#F04438' },
    { label:'Не соответствует фото', value:54,  pct:14, color:'#8B5CF6' },
    { label:'Не понравилось',        value:51,  pct:14, color:'#06B6D4' },
    { label:'Другое',                 value:48,  pct:13, color:'#6B7A99' },
  ];
  const total = reasons.reduce((s,r)=>s+r.value,0);
  return React.createElement(Card, { style:{ flex:'1 1 380px', padding:24, minWidth:300 } },
    React.createElement('div', { style:{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 } },
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Возвраты по причинам'),
      React.createElement('div', { style:{ display:'flex', alignItems:'baseline', gap:6 } },
        React.createElement('span', { style:{ fontSize:18, fontWeight:800, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums' } }, total),
        React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, 'шт за апрель')
      )
    ),
    React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginBottom:16 } }, '4.5% от продаж · ',
      React.createElement('span', { style:{ color:'var(--negative)', fontWeight:600 } }, '↑ +0.8% к марту')
    ),
    // Stacked bar
    React.createElement('div', { style:{ display:'flex', height:10, borderRadius:5, overflow:'hidden', marginBottom:18 } },
      reasons.map((r,i) =>
        React.createElement('div', { key:i, style:{ width:r.pct+'%', background:r.color, transition:'width .3s' } })
      )
    ),
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:9 } },
      reasons.map((r,i) =>
        React.createElement('div', { key:i, style:{ display:'flex', alignItems:'center', gap:10 } },
          React.createElement('span', { style:{ width:8, height:8, borderRadius:2, background:r.color, flexShrink:0 } }),
          React.createElement('span', { style:{ flex:1, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, r.label),
          React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums', minWidth:36, textAlign:'right' } }, r.value),
          React.createElement('span', { style:{ fontSize:12, fontWeight:700, fontVariantNumeric:'tabular-nums', minWidth:36, textAlign:'right' } }, r.pct + '%')
        )
      )
    )
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
function DashboardPage() {
  const c = useThemeColors();

  // Sparkline mocks
  const spk = (variance=1, trend=1, n=14) => Array.from({length:n}, (_,i) => 50 + Math.sin(i*0.6)*8*variance + i*trend);

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    // Row 1: 3 KPI cards
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      React.createElement(KpiSparkCard, {
        label:'Выручка', value: fmtRub(6120000), delta: 7.8,
        spark: spk(1, 1.2), sparkColor: c.accent,
        sub:'14 дней'
      }),
      React.createElement(KpiSparkCard, {
        label:'Чистая прибыль', value: fmtRub(1433000), delta: 9.4,
        spark: spk(0.8, 1.8), sparkColor: c.positive,
        sub:'14 дней'
      }),
      React.createElement(KpiSparkCard, {
        label:'Маржинальность', value:'23.4%', delta: 1.2,
        spark: spk(0.6, 0.4), sparkColor: c.warning,
        sub:'+0.3 п.п. за неделю'
      }),
    ),

    // Row 2: Top SKU + Critical alerts (подняты вверх)
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      React.createElement(TopSkuCard),
      React.createElement(CriticalAlertsCard),
    ),

    // Row 3: Big chart + Marketplace split
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      React.createElement(RevenueDynamicsCard),
      React.createElement(MpSplitCard),
    ),

    // Row 4: Expense vs norms + Cash flow + Inventory
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      React.createElement(ExpenseNormsCard),
      React.createElement(CashFlowCard),
      React.createElement(InventoryHealthCard),
    ),

    // Row 5: Returns
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      React.createElement(ReturnsReasonsCard),
    )
  );
}

Object.assign(window, { DashboardPage });
