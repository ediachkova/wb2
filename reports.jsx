
// ── Reports: Nomenclature, Weekly, P&L ──────────────────────────────────────

function FilterBar({ onFilter }) {
  const [q, setQ] = React.useState('');
  const [mp, setMp] = React.useState('all');
  const [cat, setCat] = React.useState('all');
  const [marginType, setMarginType] = React.useState('all');

  function apply() {
    onFilter({ q, mp, cat, marginType });
  }
  function reset() {
    setQ(''); setMp('all'); setCat('all'); setMarginType('all');
    onFilter({ q:'', mp:'all', cat:'all', marginType:'all' });
  }

  return React.createElement(Card, { style:{ padding:16, marginBottom:20 } },
    React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'flex-end' } },
      React.createElement('div', { style:{ flex:'2 1 200px' } },
        React.createElement(Input, { placeholder:'Поиск по артикулу или названию…', value:q, onChange:e=>setQ(e.target.value), prefix: React.createElement(Icon,{name:'search',size:14}) })
      ),
      React.createElement('div', { style:{ flex:'1 1 140px' } },
        React.createElement(Select, { value:mp, onChange:e=>setMp(e.target.value),
          options:[{value:'all',label:'Все МП'},{value:'wb',label:'Wildberries'},{value:'ozon',label:'Ozon'},{value:'ym',label:'Яндекс Маркет'}]
        })
      ),
      React.createElement('div', { style:{ flex:'1 1 140px' } },
        React.createElement(Select, { value:cat, onChange:e=>setCat(e.target.value),
          options:[{value:'all',label:'Все категории'},{value:'Одежда',label:'Одежда'},{value:'Аксессуары',label:'Аксессуары'},{value:'Сумки',label:'Сумки'},{value:'Косметика',label:'Косметика'}]
        })
      ),
      React.createElement('div', { style:{ flex:'1 1 160px' } },
        React.createElement(Select, { value:marginType, onChange:e=>setMarginType(e.target.value),
          options:[{value:'all',label:'Все маржи'},{value:'positive',label:'Только +'},{value:'negative',label:'Только −'}]
        })
      ),
      React.createElement(Button, { onClick:apply, icon:'filter' }, 'Применить'),
      React.createElement(Button, { onClick:reset, variant:'secondary' }, 'Сбросить'),
      React.createElement(Button, { variant:'secondary', icon:'download' }, 'Экспорт'),
    )
  );
}

function NomenclatureReport({ paid = false }) {
  const [sortCol, setSortCol] = React.useState('salesRub');
  const [sortDir, setSortDir] = React.useState('desc');
  const [filter, setFilter] = React.useState({});
  const [expanded, setExpanded] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => { const t = setTimeout(()=>setLoading(false), 600); return ()=>clearTimeout(t); }, []);

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  const filtered = React.useMemo(() => {
    let rows = [...PRODUCTS];
    if (filter.q) rows = rows.filter(r => r.name.toLowerCase().includes(filter.q.toLowerCase()) || r.sku.includes(filter.q));
    if (filter.cat && filter.cat !== 'all') rows = rows.filter(r => r.cat === filter.cat);
    if (filter.marginType === 'positive') rows = rows.filter(r => r.margin > 0);
    if (filter.marginType === 'negative') rows = rows.filter(r => r.margin < 0);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [filter, sortCol, sortDir]);

  const cols = [
    { key:'sku', label:'Артикул', align:'left' },
    { key:'cat', label:'Категория', align:'left' },
    { key:'brand', label:'Бренд', align:'left' },
    { key:'sales', label:'Продажи шт', align:'right' },
    { key:'salesRub', label:'Продажи ₽', align:'right' },
    { key:'returns', label:'Возвраты', align:'right' },
    { key:'cost', label:'Себест-сть', align:'right' },
    { key:'opex', label:'Опер. расх.', align:'right' },
    { key:'marginRub', label:'Маржа ₽', align:'right' },
    { key:'margin', label:'Маржа %', align:'right' },
    ...(paid ? [
      { key:'logistics', label:'Лог-ка %', align:'right' },
      { key:'storage', label:'Хранение %', align:'right' },
      { key:'ads', label:'Реклама ₽', align:'right' },
      { key:'commission', label:'Комиссия %', align:'right' },
      { key:'marginUnit', label:'Маржа/ед', align:'right' },
    ] : []),
  ];

  const SUB_ROWS = { sizes: ['XS','S','M','L','XL'], qty:[12,45,98,67,23] };

  function CellVal({ col, row }) {
    if (col.key === 'sku') return React.createElement('span', { style:{ fontFamily:'monospace', fontSize:12, color:'var(--accent)' } }, row.sku);
    if (col.key === 'cat' || col.key === 'brand') return React.createElement('span', null, row[col.key]);
    if (col.key === 'margin') return React.createElement('span', { style:{ fontWeight:700, color: marginColor(row.margin) } }, fmtPct(row.margin));
    if (col.key === 'marginRub') return React.createElement('span', { style:{ fontWeight:700, color: marginColor(row.marginRub), fontVariantNumeric:'tabular-nums' } }, fmtRub(row.marginRub));
    if (col.key === 'salesRub' || col.key === 'cost' || col.key === 'opex' || col.key === 'marginUnit') return React.createElement('span', { style:{ fontVariantNumeric:'tabular-nums' } }, col.key==='marginUnit' ? fmtRub(row[col.key]) : fmtRub(row[col.key]));
    if (['logistics','storage','commission'].includes(col.key)) return React.createElement('span', { style:{ fontVariantNumeric:'tabular-nums' } }, fmtPct(row[col.key]));
    if (col.key === 'ads') return React.createElement('span', { style:{ fontVariantNumeric:'tabular-nums' } }, fmtRub(row.ads * row.salesRub / 100));
    return React.createElement('span', { style:{ fontVariantNumeric:'tabular-nums' } }, fmtNum(row[col.key]));
  }

  return React.createElement('div', null,
    paid && React.createElement('div', { style:{ marginBottom:16 } },
      React.createElement(Alert, { type:'info', title:'Расширенный анализ — Pro' }, 'Доступны дополнительные колонки: детализация расходов, маржа на единицу, AI-рекомендации.')
    ),
    React.createElement(FilterBar, { onFilter: setFilter }),
    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      loading
        ? React.createElement('div', { style:{ padding:24, display:'flex', flexDirection:'column', gap:10 } },
            Array.from({length:8}).map((_,i) => React.createElement(Skeleton, { key:i, height:40 }))
          )
        : React.createElement('div', { style:{ overflowX:'auto' } },
            React.createElement('table', { className:'zebra', style:{ width:'100%', borderCollapse:'collapse', minWidth:900 } },
              React.createElement('thead', null,
                React.createElement('tr', { style:{ background:'var(--bg-base)' } },
                  React.createElement('th', { style:{ width:32, padding:'10px 14px', borderBottom:'1px solid var(--border)' } }),
                  cols.map(c => React.createElement(SortableHeader, { key:c.key, label:c.label, column:c.key, sortCol, sortDir, onSort:handleSort, align:c.align }))
                )
              ),
              React.createElement('tbody', null,
                filtered.map(row =>
                  React.createElement(React.Fragment, { key:row.id },
                    React.createElement('tr', {
                      style:{ cursor:'pointer', transition:'background .1s' },
                      onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 5%, transparent)',
                      onMouseLeave:e=>e.currentTarget.style.background='transparent',
                    },
                      React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' },
                        onClick:()=>setExpanded(ex=>({...ex,[row.id]:!ex[row.id]})) },
                        React.createElement(Icon, { name: expanded[row.id] ? 'chevronDown' : 'chevronRight', size:14, color:'var(--text-secondary)' })
                      ),
                      cols.map(c =>
                        React.createElement('td', { key:c.key, style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', textAlign:c.align } },
                          c.key==='sku'
                            ? React.createElement('div', null,
                                React.createElement('div', { style:{ fontFamily:'monospace', fontSize:12, color:'var(--accent)' } }, row.sku),
                                React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, row.name)
                              )
                            : React.createElement(CellVal, { col:c, row })
                        )
                      )
                    ),
                    expanded[row.id] && React.createElement('tr', { key:'exp-'+row.id },
                      React.createElement('td', { colSpan: cols.length+1, style:{ background:'var(--bg-base)', padding:'12px 28px', borderBottom:'1px solid var(--border)' } },
                        React.createElement('div', { style:{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:8 } }, 'Детализация по размерам'),
                        React.createElement('div', { style:{ display:'flex', gap:12 } },
                          SUB_ROWS.sizes.map((s,i) =>
                            React.createElement('div', { key:s, style:{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', textAlign:'center' } },
                              React.createElement('div', { style:{ fontSize:13, fontWeight:700 } }, s),
                              React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)' } }, SUB_ROWS.qty[i] + ' шт')
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
    ),
    paid && React.createElement(Card, { style:{ marginTop:20 } },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, marginBottom:14 } },
        React.createElement('div', { style:{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#4F6EF7,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' } },
          React.createElement(Icon, { name:'info', size:15, color:'#fff' })
        ),
        React.createElement('h3', { style:{ fontSize:15, fontWeight:700, color:'var(--text-primary)', margin:0 } }, 'AI-рекомендации')
      ),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        [
          { icon:'alertTriangle', color:'var(--negative)', text:'Чехол для iPhone 15 Pro (WP-0043): маржа −3.2%. Логистика 14.1% — выше нормы вдвое. Рассмотрите повышение цены или смену склада.' },
          { icon:'trendingUp', color:'var(--positive)', text:'Маска для сна (WP-0049): маржа 42.1% — лучший показатель портфеля. Увеличьте бюджет рекламы для масштабирования.' },
          { icon:'alertTriangle', color:'var(--warning)', text:'Органайзер (WP-0050): отрицательная маржа. Возвраты 55 шт (14.5%). Проверьте качество упаковки и описание.' },
        ].map((r,i) =>
          React.createElement('div', { key:i, style:{ display:'flex', gap:10, padding:'10px 14px', background:'var(--bg-base)', borderRadius:8 } },
            React.createElement(Icon, { name:r.icon, size:16, color:r.color, style:{ marginTop:1, flexShrink:0 } }),
            React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', lineHeight:1.5 } }, r.text)
          )
        )
      )
    )
  );
}

function WeeklyReport() {
  const [sortCol, setSortCol] = React.useState('week');
  const [sortDir, setSortDir] = React.useState('asc');
  const [expanded, setExpanded] = React.useState({});

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('desc'); }
  }

  // Add prev-week deltas to data
  const rowsWithDelta = WEEKLY.map((r, i) => ({
    ...r,
    deltaSales: i > 0 ? r.sales - WEEKLY[i-1].sales : 0,
    deltaSalesPct: i > 0 ? (r.sales - WEEKLY[i-1].sales) / WEEKLY[i-1].sales * 100 : 0,
    deltaMargin: i > 0 ? r.margin - WEEKLY[i-1].margin : 0,
  }));

  const sorted = sortCol === 'week' && sortDir === 'asc' ? rowsWithDelta : [...rowsWithDelta].sort((a,b) =>
    typeof a[sortCol] === 'string'
      ? (sortDir==='asc' ? a[sortCol].localeCompare(b[sortCol]) : b[sortCol].localeCompare(a[sortCol]))
      : (sortDir==='asc' ? a[sortCol]-b[sortCol] : b[sortCol]-a[sortCol])
  );

  // Column stats for heatmap
  const stats = {};
  ['sales','profit','margin','returns','ads','logistics','price'].forEach(k => {
    const vals = WEEKLY.map(r=>r[k]);
    stats[k] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  // Rank top/bottom weeks by profit
  const profitSorted = [...WEEKLY].sort((a,b)=>b.profit-a.profit);
  const topWeek = profitSorted[0].week;
  const worstWeek = profitSorted[profitSorted.length-1].week;

  const cols = [
    { key:'price',     label:'Цена',          fmt:'rub', width:90,  norm:null,  invert:false },
    { key:'sales',     label:'Выручка',       fmt:'rub', width:130, norm:null,  invert:false },
    { key:'profit',    label:'Прибыль',       fmt:'rub', width:130, norm:null,  invert:false },
    { key:'margin',    label:'Маржа %',       fmt:'pct', width:100, norm:null,  invert:false, semantic:true },
    { key:'returns',   label:'Возвраты, шт',  fmt:'num', width:110, norm:null,  invert:true },
    { key:'ads',       label:'Реклама',       fmt:'rub', width:110, norm:null,  invert:true },
    { key:'logistics', label:'Логистика',     fmt:'rub', width:120, norm:null,  invert:true },
  ];

  function fmtBy(v, kind) {
    if (kind === 'rub') return fmtRub(v);
    if (kind === 'pct') return fmtPct(v);
    return fmtNum(v);
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    // KPI strip
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      [
        { label:'Средняя выручка/нед', value: fmtRub(rowsWithDelta.reduce((s,r)=>s+r.sales,0) / rowsWithDelta.length) },
        { label:'Лучшая неделя', value: topWeek.match(/Нед\. \d+/)[0], sub: fmtRub(profitSorted[0].profit), color:'var(--positive)' },
        { label:'Худшая неделя', value: worstWeek.match(/Нед\. \d+/)[0], sub: fmtRub(profitSorted[profitSorted.length-1].profit), color:'var(--negative)' },
        { label:'Тренд маржи', value: '↑ +4.4%', sub:'за 8 недель', color:'var(--positive)' },
      ].map((s,i) =>
        React.createElement(Card, { key:i, style:{ flex:1, minWidth:180, padding:18 } },
          React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } }, s.label),
          React.createElement('div', { style:{ fontSize:22, fontWeight:800, color: s.color || 'var(--text-primary)', marginTop:6, fontVariantNumeric:'tabular-nums' } }, s.value),
          s.sub && React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2, fontVariantNumeric:'tabular-nums' } }, s.sub)
        )
      )
    ),

    React.createElement(FilterBar, { onFilter:()=>{} }),

    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ overflowX:'auto' } },
        React.createElement('table', { className:'zebra', style:{ width:'100%', borderCollapse:'collapse', minWidth: 900 } },
          React.createElement('thead', null,
            React.createElement('tr', { style:{ background:'var(--bg-base)' } },
              React.createElement('th', { style:{ position:'sticky', left:0, background:'var(--bg-base)', padding:'10px 14px', textAlign:'left', minWidth:240, fontSize:12, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.4, borderBottom:'1px solid var(--border)', zIndex:2 } }, 'Неделя'),
              cols.map(c => React.createElement(SortableHeader, { key:c.key, label:c.label, column:c.key, sortCol, sortDir, onSort:handleSort, align:'right' }))
            )
          ),
          React.createElement('tbody', null,
            sorted.map((r, idx) => {
              const isTop = r.week === topWeek;
              const isWorst = r.week === worstWeek;
              const rowBg = isTop ? 'color-mix(in srgb, var(--positive) 6%, transparent)' : isWorst ? 'color-mix(in srgb, var(--negative) 6%, transparent)' : 'transparent';
              return React.createElement('tr', { key: r.week, style:{ background: rowBg, transition:'background .12s' } },
                // Sticky week cell
                React.createElement('td', { style:{ position:'sticky', left:0, background: rowBg !== 'transparent' ? rowBg : (idx % 2 === 1 ? 'color-mix(in srgb, var(--text-secondary) 9%, var(--bg-card))' : 'var(--bg-card)'), padding:'12px 14px', borderBottom:'1px solid var(--border)', borderRight:'1px solid var(--border)', zIndex:1, minWidth:240 } },
                  React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10 } },
                    React.createElement('div', { style:{ width:3, alignSelf:'stretch', borderRadius:2, background: isTop ? 'var(--positive)' : isWorst ? 'var(--negative)' : 'var(--border)' } }),
                    React.createElement('div', null,
                      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
                        React.createElement('span', { style:{ fontSize:14, fontWeight:600 } }, r.week.match(/Нед\. \d+/)[0]),
                        isTop && React.createElement('span', { style:{ fontSize:10, padding:'1px 5px', borderRadius:4, background:'color-mix(in srgb, var(--positive) 18%, transparent)', color:'var(--positive)', fontWeight:700 } }, '★ ЛИДЕР'),
                        isWorst && React.createElement('span', { style:{ fontSize:10, padding:'1px 5px', borderRadius:4, background:'color-mix(in srgb, var(--negative) 18%, transparent)', color:'var(--negative)', fontWeight:700 } }, '⚠ СЛАБАЯ')
                      ),
                      React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, r.week.replace(/Нед\. \d+ /, '').replace(/[()]/g,''))
                    )
                  )
                ),
                // Data cells with heatmap + delta
                cols.map(c => {
                  const v = r[c.key];
                  const s = stats[c.key];
                  let bg = 'transparent';
                  if (s.max !== s.min) {
                    let t = (v - s.min) / (s.max - s.min);
                    if (c.invert) t = 1 - t;
                    if (t > 0.66) bg = `color-mix(in srgb, var(--positive) ${Math.round((t-0.5)*30)}%, transparent)`;
                    else if (t < 0.33) bg = `color-mix(in srgb, var(--negative) ${Math.round((0.5-t)*30)}%, transparent)`;
                  }
                  const isSales = c.key === 'sales';
                  const isMargin = c.key === 'margin';
                  const showDelta = idx > 0 && (isSales || isMargin);
                  const delta = isSales ? r.deltaSalesPct : r.deltaMargin;

                  return React.createElement('td', { key:c.key,
                    style: { padding:'12px', fontSize:13, textAlign:'right', borderBottom:'1px solid var(--border)', fontVariantNumeric:'tabular-nums', ...(bg !== 'transparent' ? { background: bg } : {}), fontWeight: isMargin ? 600 : 400, color: c.semantic ? marginColor(v) : 'var(--text-primary)', whiteSpace:'nowrap' }
                  },
                    React.createElement('div', { style:{ display:'inline-flex', alignItems:'center', gap:5, justifyContent:'flex-end' } },
                      fmtBy(v, c.fmt),
                      showDelta && delta !== 0 && React.createElement('span', {
                        style: { fontSize:11, color: delta > 0 ? 'var(--positive)' : 'var(--negative)', fontWeight:600 }
                      }, (delta > 0 ? '↑' : '↓') + Math.abs(isSales ? delta : delta).toFixed(1) + (isSales ? '%' : ''))
                    )
                  );
                })
              );
            })
          )
        )
      )
    )
  );
}

function PnLReport({ paid = false }) {
  const [collapsed, setCollapsed] = React.useState({ varexp: false, fixexp: false });
  const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн'];
  const QCOLS = ['I кв','II кв','Год'];

  function getVal(row, key) {
    const map = { 'Янв':'jan','Фев':'feb','Мар':'mar','Апр':'apr','Май':'may','Июн':'jun','I кв':'q1','II кв':'q2','Год':'year' };
    return row[map[key]];
  }

  const visibleRows = React.useMemo(() => {
    let res = [];
    let skipSection = null;
    for (const row of PNL_ROWS) {
      if (row.type === 'section') {
        skipSection = collapsed[row.id] ? row.id : null;
        res.push(row);
        continue;
      }
      if (row.type === 'child' && skipSection) continue;
      res.push(row);
    }
    return res;
  }, [collapsed]);

  function toggleSection(id) { setCollapsed(c => ({ ...c, [id]: !c[id] })); }

  return React.createElement('div', null,
    React.createElement('div', { style:{ display:'flex', justifyContent:'flex-end', marginBottom:16, gap:8 } },
      React.createElement(Button, { variant:'secondary', icon:'download' }, 'Экспорт Excel'),
      paid && React.createElement(Button, { variant:'secondary', icon:'download' }, 'Экспорт PDF')
    ),
    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ overflowX:'auto' } },
        React.createElement('table', { className:'zebra', style:{ width:'100%', borderCollapse:'collapse', minWidth:900 } },
          React.createElement('thead', null,
            React.createElement('tr', { style:{ background:'var(--bg-base)' } },
              React.createElement('th', { style:{ padding:'10px 16px', textAlign:'left', fontSize:12, color:'var(--text-secondary)', fontWeight:600, borderBottom:'1px solid var(--border)', minWidth:220, textTransform:'uppercase', letterSpacing:.4 } }, 'Статья'),
              [...MONTHS, ...QCOLS].map(m =>
                React.createElement('th', { key:m, style:{ padding:'10px 12px', textAlign:'right', fontSize:12, color:'var(--text-secondary)', fontWeight:600, borderBottom:'1px solid var(--border)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:.4, background: QCOLS.includes(m) ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'transparent' } }, m)
              ),
              React.createElement('th', { style:{ padding:'10px 12px', textAlign:'right', fontSize:12, color:'var(--text-secondary)', fontWeight:600, borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4 } }, '% выр.')
            )
          ),
          React.createElement('tbody', null,
            visibleRows.map(row => {
              const isSection = row.type === 'section';
              const isHeader = row.type === 'header';
              const isChild = row.type === 'child';
              return React.createElement('tr', {
                key:row.id,
                onClick: isSection ? ()=>toggleSection(row.id) : undefined,
                style:{ cursor: isSection ? 'pointer' : 'default', background: isHeader ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent' },
                onMouseEnter: !isChild ? undefined : e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 4%, transparent)',
                onMouseLeave: !isChild ? undefined : e=>e.currentTarget.style.background='transparent',
              },
                React.createElement('td', { style:{ padding:'9px 16px', fontSize:13, borderBottom:'1px solid var(--border)', fontWeight: isHeader ? 700 : isSection ? 600 : 400, color: isChild ? 'var(--text-secondary)' : 'var(--text-primary)', display:'flex', alignItems:'center', gap:6 } },
                  isSection && React.createElement(Icon, { name: collapsed[row.id] ? 'chevronRight' : 'chevronDown', size:13 }),
                  row.label
                ),
                [...MONTHS, ...QCOLS].map(m => {
                  const v = getVal(row, m);
                  const isQ = QCOLS.includes(m);
                  return React.createElement('td', { key:m, style:{ padding:'9px 12px', textAlign:'right', fontSize:13, borderBottom:'1px solid var(--border)', fontVariantNumeric:'tabular-nums', fontWeight: isHeader ? 700 : isSection ? 600 : 400, whiteSpace:'nowrap', color: v > 0 ? (isHeader && row.id !== 'revenue' ? 'var(--positive)' : 'var(--text-primary)') : v < 0 ? 'var(--negative)' : 'var(--text-secondary)', background: isQ ? 'color-mix(in srgb, var(--accent) 3%, transparent)' : 'transparent' } },
                    v != null ? (Math.abs(v) >= 1000 ? fmtRub(v) : fmtPct(v)) : '—'
                  );
                }),
                React.createElement('td', { style:{ padding:'9px 12px', textAlign:'right', fontSize:13, borderBottom:'1px solid var(--border)', fontVariantNumeric:'tabular-nums', color:'var(--text-secondary)', fontWeight: isHeader ? 600 : 400, whiteSpace:'nowrap' } },
                  row.pct != null ? fmtPct(row.pct) : '—'
                )
              );
            })
          )
        )
      )
    )
  );
}

Object.assign(window, { NomenclatureReport, WeeklyReport, PnLReport, FilterBar });
