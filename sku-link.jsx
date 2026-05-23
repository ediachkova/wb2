
// ── SKU Dictionary — связка карточек между маркетплейсами ───────────────────

const SKU_LINKS = [
  {
    id:1, internalSku:'WP-0041', name:'Носки махровые мужские 40-46', cat:'Одежда',
    links:[
      { mp:'WB',   sku:'12345678', name:'Носки мужские махровые тёплые зимние комплект', status:'active', sales30:920, price:870 },
      { mp:'Ozon', sku:'OZ-9981',  name:'Носки махровые мужские (комплект 5 пар)',        status:'active', sales30:280, price:890 },
      { mp:'ЯМ',   sku:'YM-44213', name:'Носки тёплые махровые 5 пар',                    status:'sync_error', sales30:40,  price:910 },
    ]
  },
  {
    id:2, internalSku:'WP-0042', name:'Футболка базовая унисекс XS-XL', cat:'Одежда',
    links:[
      { mp:'WB',   sku:'12345679', name:'Футболка базовая хлопок 100% унисекс', status:'active', sales30:660, price:1490 },
      { mp:'Ozon', sku:'OZ-9982',  name:'Футболка унисекс базовая',              status:'active', sales30:230, price:1450 },
    ]
  },
  {
    id:3, internalSku:'WP-0043', name:'Чехол для iPhone 15 Pro силикон', cat:'Аксессуары',
    links:[
      { mp:'WB',   sku:'12345680', name:'Чехол силиконовый iPhone 15 Pro', status:'active',     sales30:560, price:490 },
    ]
  },
  {
    id:4, internalSku:'WP-0044', name:'Перчатки зимние флис S-XL', cat:'Аксессуары',
    links:[
      { mp:'WB',   sku:'12345681', name:'Перчатки зимние флисовые тёплые', status:'active', sales30:320, price:1490 },
      { mp:'Ozon', sku:'OZ-9984',  name:'Перчатки флис зимние',             status:'active', sales30:100, price:1490 },
      { mp:'ЯМ',   sku:'YM-44215', name:'Перчатки флис S/M/L/XL',          status:'pending',sales30:0,   price:1490 },
    ]
  },
];

const MP_META = {
  'WB':   { color:'#CB11AB', icon:'package', short:'WB'   },
  'Ozon': { color:'#005BFF', icon:'package', short:'Ozon' },
  'ЯМ':   { color:'#FC3F1D', icon:'package', short:'ЯМ'   },
};

function MpBadge({ mp, size = 'md' }) {
  const m = MP_META[mp] || { color:'var(--accent)', short:mp };
  const sz = size === 'sm' ? { padding:'2px 8px', fontSize:11 } : { padding:'4px 10px', fontSize:12 };
  return React.createElement('span', {
    style:{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:6, background: `color-mix(in srgb, ${m.color} 16%, transparent)`, color:m.color, fontWeight:700, ...sz }
  },
    React.createElement('span', { style:{ width:5, height:5, borderRadius:'50%', background:m.color, flexShrink:0 } }),
    m.short
  );
}

function SkuLinkDictionary() {
  const toast = useToast();
  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState({1:true});
  const [linkModal, setLinkModal] = React.useState(null);

  const filtered = SKU_LINKS.filter(r =>
    r.internalSku.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.links.some(l => l.sku.toLowerCase().includes(search.toLowerCase()) || l.name.toLowerCase().includes(search.toLowerCase()))
  );

  function statusBadge(s) {
    if (s === 'active') return React.createElement(Badge, { variant:'success' }, '● Синхронизация');
    if (s === 'sync_error') return React.createElement(Badge, { variant:'danger' }, '⚠ Ошибка');
    if (s === 'pending') return React.createElement(Badge, { variant:'warning' }, '○ Ожидает');
    return React.createElement(Badge, { variant:'neutral' }, s);
  }

  // Stats
  const totalInternal = SKU_LINKS.length;
  const totalLinks = SKU_LINKS.reduce((s, r) => s + r.links.length, 0);
  const errors = SKU_LINKS.reduce((s, r) => s + r.links.filter(l => l.status === 'sync_error').length, 0);
  const coverage = Math.round(SKU_LINKS.filter(r => r.links.length >= 2).length / totalInternal * 100);

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:18 } },
    // Header / stats
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      [
        { label:'Внутренних SKU',    value: totalInternal,         sub:'мастер-карточек' },
        { label:'Связок с МП',       value: totalLinks,            sub:'привязано к маркетплейсам' },
        { label:'Покрытие 2+ МП',    value: coverage + '%',        sub:'омниканальность', color: coverage > 60 ? 'var(--positive)' : 'var(--warning)' },
        { label:'Ошибок синхронизации', value: errors,              sub:'требуют внимания', color: errors > 0 ? 'var(--negative)' : 'var(--positive)' },
      ].map((s,i) =>
        React.createElement(Card, { key:i, style:{ flex:1, minWidth:180, padding:18 } },
          React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } }, s.label),
          React.createElement('div', { style:{ fontSize:26, fontWeight:800, color: s.color || 'var(--text-primary)', marginTop:6, marginBottom:2, fontVariantNumeric:'tabular-nums' } }, s.value),
          React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)' } }, s.sub)
        )
      )
    ),

    // Controls
    React.createElement('div', { style:{ display:'flex', gap:10, alignItems:'center' } },
      React.createElement('div', { style:{ position:'relative', flex:'1 1 320px', maxWidth:420 } },
        React.createElement('span', { style:{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' } }, React.createElement(Icon,{name:'search',size:15})),
        React.createElement('input', { placeholder:'Поиск по SKU или названию…', value:search, onChange:e=>setSearch(e.target.value),
          style:{ padding:'9px 12px 9px 36px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, width:'100%', outline:'none', fontFamily:'inherit' }
        })
      ),
      React.createElement('div', { style:{ marginLeft:'auto', display:'flex', gap:8 } },
        React.createElement(Button, { variant:'secondary', icon:'upload' }, 'Импорт CSV'),
        React.createElement(Button, { icon:'plus', onClick:()=>setLinkModal({ new:true }) }, 'Новая мастер-карточка')
      )
    ),

    // List of master cards
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      filtered.map(item => {
        const isOpen = expanded[item.id];
        const linkedMps = item.links.map(l => l.mp);
        const missing = ['WB','Ozon','ЯМ'].filter(m => !linkedMps.includes(m));
        const totalSales = item.links.reduce((s, l) => s + l.sales30, 0);
        return React.createElement(Card, { key: item.id, style:{ padding:0, overflow:'hidden' } },
          // Header
          React.createElement('div', {
            onClick: () => setExpanded(e => ({ ...e, [item.id]: !e[item.id] })),
            style:{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', cursor:'pointer', userSelect:'none', borderBottom: isOpen ? '1px solid var(--border)' : 'none' }
          },
            React.createElement(Icon, { name: isOpen ? 'chevronDown' : 'chevronRight', size:16, color:'var(--text-secondary)' }),
            React.createElement(ProductThumb, { p: { sku: item.internalSku, name: item.name }, size:42 }),
            React.createElement('div', { style:{ flex:1, minWidth:0 } },
              React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
                React.createElement('span', { style:{ fontFamily:'monospace', fontSize:12, color:'var(--accent)', fontWeight:700 } }, item.internalSku),
                React.createElement(Badge, { variant:'neutral' }, item.cat)
              ),
              React.createElement('div', { style:{ fontSize:14, fontWeight:500, color:'var(--text-primary)', marginTop:2 } }, item.name)
            ),
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
              linkedMps.map(mp => React.createElement(MpBadge, { key:mp, mp, size:'sm' })),
              missing.map(mp =>
                React.createElement('span', { key:mp, style:{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', fontSize:11, borderRadius:6, border:'1px dashed var(--border)', color:'var(--text-secondary)' } }, '+ ' + mp)
              )
            ),
            React.createElement('div', { style:{ textAlign:'right', minWidth:120 } },
              React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'Продажи 30 дн'),
              React.createElement('div', { style:{ fontSize:16, fontWeight:700, fontVariantNumeric:'tabular-nums' } }, fmtNum(totalSales) + ' шт')
            )
          ),
          // Expanded: linked SKUs
          isOpen && React.createElement('div', { style:{ padding:'14px 20px 18px', background:'var(--bg-base)' } },
            React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' } },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  ['МП','Артикул','Название карточки','Цена','Продажи 30д','Статус',''].map((h,i) =>
                    React.createElement('th', { key:h, style:{ padding:'8px 10px', textAlign: i>=3 && i<=4 ? 'right' : 'left', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.4, borderBottom:'1px solid var(--border)' } }, h)
                  )
                )
              ),
              React.createElement('tbody', null,
                item.links.map((link, idx) =>
                  React.createElement('tr', { key: link.sku, style:{ background: idx % 2 ? 'transparent' : 'var(--bg-card)' } },
                    React.createElement('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border)' } }, React.createElement(MpBadge, { mp: link.mp })),
                    React.createElement('td', { style:{ padding:'10px', fontFamily:'monospace', fontSize:12, color:'var(--accent)', borderBottom:'1px solid var(--border)' } }, link.sku),
                    React.createElement('td', { style:{ padding:'10px', fontSize:13, borderBottom:'1px solid var(--border)' } },
                      React.createElement('span', { style:{ display:'block', maxWidth:380, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, link.name)
                    ),
                    React.createElement('td', { style:{ padding:'10px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontSize:13, borderBottom:'1px solid var(--border)' } }, fmtRub(link.price)),
                    React.createElement('td', { style:{ padding:'10px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontSize:13, fontWeight:600, borderBottom:'1px solid var(--border)' } }, fmtNum(link.sales30) + ' шт'),
                    React.createElement('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border)' } }, statusBadge(link.status)),
                    React.createElement('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border)' } },
                      React.createElement('div', { style:{ display:'flex', gap:4 } },
                        React.createElement('button', { onClick:()=>toast('Синхронизация запущена','success'), style:{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', padding:4 } }, React.createElement(Icon, { name:'refresh', size:15 })),
                        React.createElement('button', { onClick:()=>toast('Связка удалена','success'), style:{ background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:4 } }, React.createElement(Icon, { name:'trash', size:15 }))
                      )
                    )
                  )
                ),
                missing.length > 0 && React.createElement('tr', null,
                  React.createElement('td', { colSpan:7, style:{ padding:'12px 10px' } },
                    React.createElement('button', {
                      onClick:()=>setLinkModal({ item, mp: missing[0] }),
                      style:{ width:'100%', padding:'10px', border:'1px dashed var(--accent)', borderRadius:8, background:'transparent', color:'var(--accent)', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit' }
                    },
                      React.createElement(Icon, { name:'plus', size:14 }),
                      'Привязать карточку из ', missing.join(', ')
                    )
                  )
                )
              )
            )
          )
        );
      })
    ),

    // Link modal
    linkModal && React.createElement(Modal, { open:true, onClose:()=>setLinkModal(null), title: linkModal.new ? 'Новая мастер-карточка' : `Привязать карточку из ${linkModal.mp}`, width:560 },
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
        linkModal.new && React.createElement(Input, { label:'Внутренний артикул', placeholder:'WP-XXXX' }),
        linkModal.new && React.createElement(Input, { label:'Название мастер-карточки', placeholder:'Например, Носки махровые мужские 40-46' }),
        !linkModal.new && React.createElement(Select, { label:'Маркетплейс', value: linkModal.mp, onChange:()=>{}, options:['WB','Ozon','ЯМ'] }),
        React.createElement(Input, { label: linkModal.new ? 'Артикул МП (необязательно)' : 'Артикул карточки на маркетплейсе', placeholder:'Например, 12345678' }),
        React.createElement('div', { style:{ padding:14, borderRadius:10, background:'var(--bg-base)', display:'flex', gap:10, alignItems:'flex-start' } },
          React.createElement(Icon, { name:'info', size:16, color:'var(--accent)', style:{ marginTop:2, flexShrink:0 } }),
          React.createElement('span', { style:{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 } }, 'Мы попробуем найти карточку по артикулу автоматически и предложим связать. Все продажи и расходы будут агрегированы под мастер-карточкой.')
        ),
        React.createElement('div', { style:{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 } },
          React.createElement(Button, { variant:'secondary', onClick:()=>setLinkModal(null) }, 'Отмена'),
          React.createElement(Button, { onClick:()=>{ toast('Карточка привязана','success'); setLinkModal(null); } }, linkModal.new ? 'Создать' : 'Привязать')
        )
      )
    )
  );
}

Object.assign(window, { SkuLinkDictionary });
