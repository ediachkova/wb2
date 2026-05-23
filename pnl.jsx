
// ── P&L Report v2: collapsed/Pro modes, clean visual ─────────────────────────

const PNL_MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн'];
const PNL_MONTH_KEYS = ['jan','feb','mar','apr','may','jun'];
const PNL_Q_COLS = [
  { key:'q1',   label:'I кв',  type:'quarter' },
  { key:'q2',   label:'II кв', type:'quarter' },
  { key:'year', label:'YTD',   type:'total' },
];

// row.type: 'kpi' (highlighted), 'section' (collapsible parent), 'child' (sub-row), 'subtotal'
// row.kind: 'income' | 'expense' | 'profit' | 'tax'
const PNL_DATA_COLLAPSED = [
  { id:'revenue',     label:'Выручка',                 type:'kpi',      kind:'income',  jan:4820000, feb:5140000, mar:5680000, apr:6120000, may:5940000, jun:6380000, q1:15640000, q2:18440000, year:62580000, pct:100,  prev:5410000 },
  { id:'varexp',      label:'Переменные расходы',      type:'section',  kind:'expense', jan:-2890000, feb:-3090000, mar:-3410000, apr:-3670000, may:-3570000, jun:-3830000, q1:-9390000, q2:-11070000, year:-37560000, pct:60.0, children:['cogs','commission','logistics','storage','ads'] },
  { id:'margprofit',  label:'Маржинальная прибыль',    type:'kpi',      kind:'profit',  jan:1930000, feb:2050000, mar:2270000, apr:2450000, may:2370000, jun:2550000, q1:6250000, q2:7370000, year:25020000, pct:40.0,  prev:2340000 },
  { id:'fixexp',      label:'Постоянные расходы',       type:'section',  kind:'expense', jan:-620000, feb:-620000, mar:-620000, apr:-650000, may:-650000, jun:-650000, q1:-1860000, q2:-1950000, year:-7620000, pct:12.2, children:['payroll','rent','software'] },
  { id:'ebitda',      label:'EBITDA',                   type:'kpi',      kind:'profit',  jan:1310000, feb:1430000, mar:1650000, apr:1800000, may:1720000, jun:1900000, q1:4390000, q2:5420000, year:17400000, pct:27.8,  prev:1690000 },
  { id:'tax',         label:'Налог УСН (6%)',           type:'subtotal', kind:'tax',     jan:-289000, feb:-308000, mar:-341000, apr:-367000, may:-356000, jun:-383000, q1:-938000, q2:-1106000, year:-3755000, pct:6.0 },
  { id:'netprofit',   label:'Чистая прибыль',           type:'kpi',      kind:'profit',  jan:1021000, feb:1122000, mar:1309000, apr:1433000, may:1364000, jun:1517000, q1:3452000, q2:4314000, year:13645000, pct:21.8,  prev:1334000 },
];

const PNL_DATA_PRO = [
  // Revenue with marketplace breakdown
  { id:'revenue',     label:'Выручка',                  type:'kpi',     kind:'income',  jan:4820000, feb:5140000, mar:5680000, apr:6120000, may:5940000, jun:6380000, q1:15640000, q2:18440000, year:62580000, pct:100,  prev:5410000 },
  { id:'rev_wb',      label:'Wildberries',              type:'child',   kind:'income',  jan:2940000, feb:3140000, mar:3470000, apr:3720000, may:3620000, jun:3890000, q1:9550000, q2:11230000, year:38180000, pct:61.0 },
  { id:'rev_ozon',    label:'Ozon',                     type:'child',   kind:'income',  jan:1320000, feb:1410000, mar:1560000, apr:1680000, may:1630000, jun:1750000, q1:4290000, q2:5060000, year:17170000, pct:27.4 },
  { id:'rev_ym',      label:'Яндекс Маркет',            type:'child',   kind:'income',  jan:560000,  feb:590000,  mar:650000,  apr:720000,  may:690000,  jun:740000,  q1:1800000, q2:2150000, year:7230000,  pct:11.6 },

  // Variable expenses with full breakdown
  { id:'varexp',      label:'Переменные расходы',       type:'section', kind:'expense', jan:-2890000, feb:-3090000, mar:-3410000, apr:-3670000, may:-3570000, jun:-3830000, q1:-9390000, q2:-11070000, year:-37560000, pct:60.0, children:['cogs','commission','logistics','storage','ads','acceptance','returns_cost'] },
  { id:'cogs',        label:'Себестоимость',            type:'child',   kind:'expense', jan:-1638000, feb:-1748000, mar:-1931000, apr:-2081000, may:-2020000, jun:-2169000, q1:-5317000, q2:-6270000, year:-21277000, pct:34.0 },
  { id:'commission',  label:'Комиссия маркетплейсов',   type:'child',   kind:'expense', jan:-530000, feb:-565000, mar:-625000, apr:-673000, may:-653000, jun:-702000, q1:-1720000, q2:-2028000, year:-6882000, pct:11.0 },
  { id:'logistics',   label:'Логистика и фулфилмент',   type:'child',   kind:'expense', jan:-386000, feb:-411000, mar:-454000, apr:-490000, may:-475000, jun:-510000, q1:-1251000, q2:-1475000, year:-5006000, pct:8.0 },
  { id:'storage',     label:'Хранение на складах МП',   type:'child',   kind:'expense', jan:-145000, feb:-154000, mar:-170000, apr:-183000, may:-178000, jun:-191000, q1:-469000, q2:-552000, year:-1874000, pct:3.0 },
  { id:'ads',         label:'Реклама и продвижение',    type:'child',   kind:'expense', jan:-145000, feb:-160000, mar:-174000, apr:-184000, may:-185000, jun:-195000, q1:-479000, q2:-564000, year:-1907000, pct:3.0 },
  { id:'acceptance',  label:'Платная приёмка',          type:'child',   kind:'expense', jan:-26000,  feb:-30000,  mar:-32000,  apr:-35000,  may:-35000,  jun:-37000,  q1:-88000, q2:-107000, year:-358000, pct:0.6 },
  { id:'returns_cost',label:'Стоимость возвратов',      type:'child',   kind:'expense', jan:-20000,  feb:-22000,  mar:-24000,  apr:-24000,  may:-24000,  jun:-26000,  q1:-66000, q2:-74000, year:-256000, pct:0.4 },

  { id:'margprofit',  label:'Маржинальная прибыль',     type:'kpi',     kind:'profit',  jan:1930000, feb:2050000, mar:2270000, apr:2450000, may:2370000, jun:2550000, q1:6250000, q2:7370000, year:25020000, pct:40.0, prev:2340000 },

  // Fixed expenses expanded
  { id:'fixexp',      label:'Постоянные расходы',       type:'section', kind:'expense', jan:-620000, feb:-620000, mar:-620000, apr:-650000, may:-650000, jun:-650000, q1:-1860000, q2:-1950000, year:-7620000, pct:12.2, children:['payroll','rent','software','bank_fees','office'] },
  { id:'payroll',     label:'ФОТ + налоги',             type:'child',   kind:'expense', jan:-320000, feb:-320000, mar:-320000, apr:-350000, may:-350000, jun:-350000, q1:-960000, q2:-1050000, year:-4020000, pct:6.4 },
  { id:'rent',        label:'Аренда офиса и склада',    type:'child',   kind:'expense', jan:-180000, feb:-180000, mar:-180000, apr:-180000, may:-180000, jun:-180000, q1:-540000, q2:-540000, year:-2160000, pct:3.5 },
  { id:'software',    label:'Программное обеспечение',  type:'child',   kind:'expense', jan:-92000,  feb:-92000,  mar:-92000,  apr:-92000,  may:-92000,  jun:-92000,  q1:-276000, q2:-276000, year:-1104000, pct:1.8 },
  { id:'bank_fees',   label:'Банковское обслуживание',  type:'child',   kind:'expense', jan:-12000,  feb:-12000,  mar:-12000,  apr:-12000,  may:-12000,  jun:-12000,  q1:-36000, q2:-36000, year:-144000, pct:0.2 },
  { id:'office',      label:'Прочие административные',  type:'child',   kind:'expense', jan:-16000,  feb:-16000,  mar:-16000,  apr:-16000,  may:-16000,  jun:-16000,  q1:-48000, q2:-48000, year:-192000, pct:0.3 },

  // Operating profit before adjustments
  { id:'opprofit',    label:'Операционная прибыль',     type:'subtotal',kind:'profit',  jan:1310000, feb:1430000, mar:1650000, apr:1800000, may:1720000, jun:1900000, q1:4390000, q2:5420000, year:17400000, pct:27.8 },

  // Other items
  { id:'otherinc',    label:'Прочие доходы',            type:'child',   kind:'income',  jan:18000,   feb:22000,   mar:28000,   apr:31000,   may:24000,   jun:29000,   q1:68000, q2:84000, year:296000, pct:0.5 },
  { id:'otherexp',    label:'Прочие расходы',           type:'child',   kind:'expense', jan:-24000,  feb:-26000,  mar:-31000,  apr:-28000,  may:-29000,  jun:-32000,  q1:-81000, q2:-89000, year:-326000, pct:0.5 },
  { id:'finexp',      label:'Финансовые расходы',       type:'child',   kind:'expense', jan:-48000,  feb:-48000,  mar:-48000,  apr:-48000,  may:-48000,  jun:-48000,  q1:-144000, q2:-144000, year:-576000, pct:0.9 },

  { id:'ebitda',      label:'EBITDA',                    type:'kpi',     kind:'profit',  jan:1256000, feb:1378000, mar:1599000, apr:1755000, may:1667000, jun:1849000, q1:4233000, q2:5271000, year:16794000, pct:26.8, prev:1635000 },

  { id:'tax',         label:'Налог УСН (6% от выручки)', type:'subtotal',kind:'tax',     jan:-289000, feb:-308000, mar:-341000, apr:-367000, may:-356000, jun:-383000, q1:-938000, q2:-1106000, year:-3755000, pct:6.0 },

  { id:'netprofit',   label:'Чистая прибыль',            type:'kpi',     kind:'profit',  jan:967000, feb:1070000, mar:1258000, apr:1388000, may:1311000, jun:1466000, q1:3295000, q2:4165000, year:13039000, pct:20.8, prev:1289000 },
];

// ── Row visual styles ───────────────────────────────────────────────────────
function rowStyle(type) {
  if (type === 'kpi') return {
    bg: 'color-mix(in srgb, var(--accent) 6%, transparent)',
    fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', padding: '14px 16px',
    indent: 0,
  };
  if (type === 'section') return {
    bg: 'var(--bg-base)',
    fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', padding: '11px 16px',
    indent: 0,
  };
  if (type === 'subtotal') return {
    bg: 'transparent',
    fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', padding: '11px 16px',
    indent: 0,
    borderTop: '1px solid var(--border)',
  };
  return { // child
    bg: 'transparent',
    fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)', padding: '8px 16px 8px 38px',
    indent: 22,
  };
}

// Sparkline mini
function PnlSpark({ row, color }) {
  const vals = PNL_MONTH_KEYS.map(k => row[k]).filter(v => v != null).map(v => Math.abs(v));
  if (!vals.length) return null;
  const w = 60, h = 22;
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const path = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return React.createElement('svg', { width:w, height:h, style:{ display:'block' } },
    React.createElement('path', { d:path, stroke:color, strokeWidth:1.6, fill:'none' })
  );
}

function PnLReport() {
  const [mode, setMode] = React.useState('collapsed'); // 'collapsed' | 'pro'
  const [collapsed, setCollapsed] = React.useState({ varexp: true, fixexp: true });
  const [view, setView] = React.useState('half'); // 'half' = H1, 'year' = year
  const c = useThemeColors ? useThemeColors() : null;

  const ROWS = mode === 'pro' ? PNL_DATA_PRO : PNL_DATA_COLLAPSED;

  // Hide children of collapsed sections
  const visible = React.useMemo(() => {
    const hide = new Set();
    ROWS.forEach(r => {
      if (r.type === 'section' && collapsed[r.id] && r.children) {
        r.children.forEach(id => hide.add(id));
      }
    });
    return ROWS.filter(r => !hide.has(r.id));
  }, [ROWS, collapsed]);

  const COLS = view === 'year' ? PNL_MONTHS : ['Янв','Фев','Мар','Апр','Май','Июн'];
  const COL_KEYS = view === 'year' ? PNL_MONTH_KEYS : PNL_MONTH_KEYS;

  function valueColor(row, v) {
    if (v == null) return 'var(--text-secondary)';
    if (row.type === 'kpi') {
      if (row.kind === 'profit' && v < 0) return 'var(--negative)';
      return 'var(--text-primary)';
    }
    // Expenses display as negative - neutral by default, no red overload
    return 'var(--text-primary)';
  }

  function deltaForKpi(row) {
    if (row.type !== 'kpi' || row.prev == null) return null;
    const v = row.apr; // current month
    if (v == null) return null;
    const pct = (v - row.prev) / row.prev * 100;
    return pct;
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    // Controls bar
    React.createElement(Card, { style:{ padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 } },
      React.createElement('div', { style:{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' } },
        // Mode toggle
        React.createElement('div', { style:{ display:'inline-flex', padding:3, background:'var(--bg-base)', borderRadius:8, gap:2 } },
          [
            { id:'collapsed', label:'Свёрнутый', icon:'chart' },
            { id:'pro',       label:'Расширенный Pro', icon:'database' }
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
        // Period selector
        React.createElement(Select, {
          value:'h1-2026', onChange:()=>{},
          options:[
            {value:'h1-2026', label:'I полугодие 2026'},
            {value:'q1-2026', label:'I квартал 2026'},
            {value:'2026',    label:'Весь 2026 год'},
            {value:'2025',    label:'2025 год'},
          ],
          style:{ minWidth:200 }
        }),
      ),
      React.createElement('div', { style:{ display:'flex', gap:8 } },
        React.createElement(Button, { variant:'secondary', size:'sm', icon:'download' }, 'Excel'),
        React.createElement(Button, { variant:'secondary', size:'sm', icon:'download' }, 'PDF'),
      )
    ),

    // KPI summary cards on top
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      [
        { label:'Выручка',           value: 62580000, prev: 64900000, color: 'var(--accent)' },
        { label:'Маржинальная прибыль', value: 25020000, prev: 28080000, color: 'var(--positive)' },
        { label:'EBITDA',            value: mode==='pro'?16794000:17400000, prev: 20280000, color: 'var(--positive)' },
        { label:'Чистая прибыль',     value: mode==='pro'?13039000:13645000, prev: 16016000, color: 'var(--positive)' },
      ].map((s,i) => {
        const pct = (s.value - s.prev) / s.prev * 100;
        const pos = pct >= 0;
        return React.createElement(Card, { key:i, style:{ flex:1, minWidth:200, padding:18 } },
          React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } }, s.label),
          React.createElement('div', { style:{ fontSize:22, fontWeight:800, color:'var(--text-primary)', fontVariantNumeric:'tabular-nums', marginTop:6, letterSpacing:-.3 } }, fmtRub(s.value)),
          React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8, marginTop:6 } },
            React.createElement('span', { style:{ fontSize:12, color: pos?'var(--positive)':'var(--negative)', fontWeight:700 } },
              (pos?'↑ +':'↓ ') + Math.abs(pct).toFixed(1) + '%'
            ),
            React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, 'YoY')
          )
        );
      })
    ),

    // Main table
    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ overflowX:'auto' } },
        React.createElement('table', { className:'zebra', style:{ width:'100%', borderCollapse:'collapse', minWidth: 1100 } },
          React.createElement('thead', null,
            React.createElement('tr', { style:{ background:'var(--bg-base)' } },
              React.createElement('th', { style:{ position:'sticky', left:0, background:'var(--bg-base)', padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)', minWidth:280, zIndex:2 } }, 'Статья'),
              COLS.map(m =>
                React.createElement('th', { key:m, style:{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' } }, m)
              ),
              PNL_Q_COLS.map(q =>
                React.createElement('th', { key:q.key, style:{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color: q.type === 'total' ? 'var(--accent)' : 'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', background: q.type === 'total' ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'transparent' } }, q.label)
              ),
              React.createElement('th', { style:{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)' } }, '% выр.'),
              React.createElement('th', { style:{ padding:'10px 12px', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)' } }, 'Тренд')
            )
          ),
          React.createElement('tbody', null,
            visible.map((row, idx) => {
              const rs = rowStyle(row.type);
              const isSection = row.type === 'section';
              const isKpi = row.type === 'kpi';
              const isSubtotal = row.type === 'subtotal';
              const delta = deltaForKpi(row);
              const trendColor = row.kind === 'profit' ? 'var(--positive)' : row.kind === 'expense' ? 'var(--text-secondary)' : 'var(--accent)';
              return React.createElement('tr', {
                key: row.id,
                onClick: isSection ? () => setCollapsed(c => ({ ...c, [row.id]: !c[row.id] })) : undefined,
                style:{
                  background: rs.bg,
                  cursor: isSection ? 'pointer' : 'default',
                  borderTop: rs.borderTop,
                }
              },
                // Label cell
                React.createElement('td', {
                  style:{ padding: rs.padding, fontSize: rs.fontSize, fontWeight: rs.fontWeight, color: rs.color, borderBottom:'1px solid var(--border)', position:'sticky', left:0, background: rs.bg !== 'transparent' ? rs.bg : (idx % 2 === 1 ? 'color-mix(in srgb, var(--text-secondary) 9%, var(--bg-card))' : 'var(--bg-card)'), zIndex:1, minWidth:280 }
                },
                  React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
                    // KPI accent stripe
                    isKpi && React.createElement('span', { style:{ width:3, alignSelf:'stretch', borderRadius:2, background: row.kind === 'profit' ? 'var(--positive)' : 'var(--accent)' } }),
                    isSection && React.createElement(Icon, { name: collapsed[row.id] ? 'chevronRight' : 'chevronDown', size:14, color:'var(--text-secondary)' }),
                    React.createElement('span', null, row.label),
                    // Delta chip for KPI
                    isKpi && delta != null && React.createElement('span', {
                      style:{ fontSize:11, padding:'2px 7px', borderRadius:4, background: `color-mix(in srgb, var(--${delta>=0?'positive':'negative'}) 14%, transparent)`, color: `var(--${delta>=0?'positive':'negative'})`, fontWeight:700, fontVariantNumeric:'tabular-nums' }
                    }, (delta>=0?'+':'') + delta.toFixed(1) + '%')
                  )
                ),
                // Monthly values
                COL_KEYS.map(k => {
                  const v = row[k];
                  return React.createElement('td', { key:k,
                    style: { padding: '8px 12px', fontSize: rs.fontSize, fontWeight: rs.fontWeight, color: valueColor(row, v), borderBottom:'1px solid var(--border)', textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }
                  }, v != null ? fmtRub(v) : '—');
                }),
                // Quarter / YTD
                PNL_Q_COLS.map(q => {
                  const v = row[q.key];
                  return React.createElement('td', { key:q.key,
                    style: { padding: '8px 12px', fontSize: rs.fontSize, fontWeight: q.type === 'total' ? Math.max(rs.fontWeight, 700) : rs.fontWeight, color: valueColor(row, v), borderBottom:'1px solid var(--border)', textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', background: q.type === 'total' ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'transparent' }
                  }, v != null ? fmtRub(v) : '—');
                }),
                // % of revenue
                React.createElement('td', { style:{ padding:'8px 12px', fontSize: 12, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textAlign:'right', fontVariantNumeric:'tabular-nums' } },
                  row.pct != null ? row.pct.toFixed(1) + '%' : '—'
                ),
                // Sparkline trend
                React.createElement('td', { style:{ padding:'8px 12px', borderBottom:'1px solid var(--border)' } },
                  row.pct != null && React.createElement(PnlSpark, { row, color: trendColor })
                )
              );
            })
          )
        )
      )
    ),

    // Insights footer
    mode === 'pro' && React.createElement(Card, { style:{ padding:18 } },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, marginBottom:12 } },
        React.createElement('div', { style:{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg, var(--accent), #8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' } },
          React.createElement(Icon, { name:'info', size:14, color:'#fff' })
        ),
        React.createElement('h3', { style:{ fontSize:14, fontWeight:700, margin:0 } }, 'Что важно в этом периоде')
      ),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:10 } },
        [
          { icon:'trendingUp', color:'var(--positive)', text:'Маржа выросла с 38.2% до 40.0% за полугодие — рост на 1.8 п.п.' },
          { icon:'alertTriangle', color:'var(--warning)', text:'Реклама занимает 3.0% от выручки vs план 2.5% — перерасход ₽254к.' },
          { icon:'alertTriangle', color:'var(--negative)', text:'Чистая прибыль ниже прошлого года на 18.6% при росте выручки.' },
        ].map((r,i) =>
          React.createElement('div', { key:i, style:{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg-base)', borderRadius:8 } },
            React.createElement(Icon, { name:r.icon, size:15, color:r.color, style:{ marginTop:2, flexShrink:0 } }),
            React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', lineHeight:1.5 } }, r.text)
          )
        )
      )
    )
  );
}

Object.assign(window, { PnLReport });
