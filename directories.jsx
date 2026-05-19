
// ── Directories ──────────────────────────────────────────────────────────────

function NomenclatureDirectory() {
  const toast = useToast();
  const [search, setSearch] = React.useState('');
  const [coverage, setCoverage] = React.useState('all');
  const [cat, setCat] = React.useState('all');
  const [editing, setEditing] = React.useState(null);
  const [newOpen, setNewOpen] = React.useState(false);

  // Synthetic master cards: derive from PRODUCTS, attach MP links
  const masters = React.useMemo(() => PRODUCTS.map((p, i) => {
    const links = [
      { mp:'WB',   sku: p.mpSku,         active: true,                                  price: Math.round(p.salesRub / p.sales),       sales: Math.round(p.sales * 0.62) },
      i % 3 !== 2 ? { mp:'Ozon', sku: 'OZ-' + (1000 + p.id), active: i % 4 !== 1,        price: Math.round(p.salesRub / p.sales * 0.98), sales: Math.round(p.sales * 0.26) } : null,
      i % 4 === 0 ? { mp:'ЯМ',   sku: 'YM-' + (44000 + p.id), active: i % 8 !== 0,       price: Math.round(p.salesRub / p.sales * 1.02), sales: Math.round(p.sales * 0.12) } : null,
    ].filter(Boolean);
    return { ...p, links };
  }), []);

  // Filters
  const filtered = masters.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.sku.toLowerCase().includes(q) && !m.links.some(l => l.sku.toLowerCase().includes(q))) return false;
    }
    if (cat !== 'all' && m.cat !== cat) return false;
    if (coverage === 'full' && m.links.length < 3) return false;
    if (coverage === 'partial' && (m.links.length === 0 || m.links.length === 3)) return false;
    if (coverage === 'single' && m.links.length !== 1) return false;
    if (coverage === 'none' && m.links.length !== 0) return false;
    return true;
  });

  // KPI counts
  const cnt = {
    total: masters.length,
    full: masters.filter(m => m.links.length === 3).length,
    partial: masters.filter(m => m.links.length > 0 && m.links.length < 3).length,
    errors: masters.reduce((s,m) => s + m.links.filter(l => !l.active).length, 0),
  };

  function MpSlot({ link, mp, onClick }) {
    if (!link) {
      // empty slot — call to link
      const m = MP_META[mp];
      return React.createElement('div', {
        onClick: e => { e.stopPropagation(); onClick(); },
        style:{ flex:1, minWidth:0, padding:'10px 12px', border:'1.5px dashed var(--border)', borderRadius:8, cursor:'pointer', display:'flex', flexDirection:'column', gap:3, transition:'all .12s' },
        onMouseEnter:e=>{ e.currentTarget.style.borderColor = m.color; e.currentTarget.style.background = `color-mix(in srgb, ${m.color} 5%, transparent)`; },
        onMouseLeave:e=>{ e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; },
      },
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
          React.createElement('span', { style:{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 } }),
          React.createElement('span', { style:{ fontSize:12, fontWeight:600, color:'var(--text-secondary)' } }, mp)
        ),
        React.createElement('div', { style:{ fontSize:13, color: m.color, fontWeight:600, display:'flex', alignItems:'center', gap:4 } },
          React.createElement(Icon, { name:'plus', size:12 }),
          'Привязать'
        )
      );
    }
    const m = MP_META[link.mp];
    return React.createElement('div', {
      style:{ flex:1, minWidth:0, padding:'10px 12px', border:`1px solid ${m.color}40`, borderRadius:8, background:`color-mix(in srgb, ${m.color} 6%, transparent)`, display:'flex', flexDirection:'column', gap:3 }
    },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 } },
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:5, minWidth:0 } },
          React.createElement('span', { style:{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 } }),
          React.createElement('span', { style:{ fontSize:11, fontFamily:'monospace', color:m.color, fontWeight:700 } }, link.sku)
        ),
        !link.active && React.createElement('span', { title:'Ошибка синхронизации', style:{ fontSize:10, color:'var(--negative)' } }, '⚠')
      ),
      React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:12, fontVariantNumeric:'tabular-nums' } },
        React.createElement('span', { style:{ color:'var(--text-secondary)' } }, fmtRub(link.price)),
        React.createElement('span', { style:{ fontWeight:600, color:'var(--text-primary)' } }, fmtNum(link.sales) + ' шт')
      )
    );
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    // KPIs
    React.createElement('div', { style:{ display:'flex', gap:14, flexWrap:'wrap' } },
      [
        { label:'Всего номенклатур',  value: cnt.total,    sub:'мастер-карточек' },
        { label:'На всех 3 МП',        value: cnt.full,     sub:'полное покрытие', color:'var(--positive)' },
        { label:'Частично привязаны',  value: cnt.partial,  sub:'1-2 МП — расширить' },
        { label:'Ошибки синхронизации', value: cnt.errors,  sub:'требуют внимания', color: cnt.errors > 0 ? 'var(--negative)' : 'var(--text-primary)' },
      ].map((s,i) =>
        React.createElement(Card, { key:i, style:{ flex:1, minWidth:200, padding:18 } },
          React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)' } }, s.label),
          React.createElement('div', { style:{ fontSize:26, fontWeight:800, color: s.color || 'var(--text-primary)', marginTop:6, fontVariantNumeric:'tabular-nums' } }, s.value),
          React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, s.sub)
        )
      )
    ),

    // Controls
    React.createElement('div', { style:{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' } },
      React.createElement('div', { style:{ position:'relative', flex:'1 1 280px', maxWidth:380 } },
        React.createElement('span', { style:{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' } }, React.createElement(Icon,{name:'search',size:15})),
        React.createElement('input', { placeholder:'Поиск по SKU или названию…', value:search, onChange:e=>setSearch(e.target.value),
          style:{ height:40, padding:'0 12px 0 36px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, width:'100%', outline:'none', fontFamily:'inherit' }
        })
      ),
      React.createElement(Select, { value:cat, onChange:e=>setCat(e.target.value),
        options:[{value:'all',label:'Все категории'},{value:'Одежда',label:'Одежда'},{value:'Аксессуары',label:'Аксессуары'},{value:'Сумки',label:'Сумки'},{value:'Косметика',label:'Косметика'},{value:'Электроника',label:'Электроника'},{value:'Товары для дома',label:'Товары для дома'},{value:'Товары для сна',label:'Товары для сна'}]
      }),
      React.createElement(Select, { value:coverage, onChange:e=>setCoverage(e.target.value),
        options:[{value:'all',label:'Любое покрытие'},{value:'full',label:'На всех 3 МП'},{value:'partial',label:'Частично (1-2 МП)'},{value:'single',label:'Только 1 МП'},{value:'none',label:'Не привязано'}]
      }),
      React.createElement('div', { style:{ marginLeft:'auto', display:'flex', gap:8 } },
        React.createElement(Button, { variant:'secondary', icon:'upload' }, 'Импорт CSV'),
        React.createElement(Button, { icon:'plus', onClick:()=>setNewOpen(true) }, 'Новая номенклатура')
      )
    ),

    // Cards
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      filtered.length === 0 && React.createElement(Card, { style:{ padding:40, textAlign:'center' } },
        React.createElement(Icon, { name:'package', size:32, color:'var(--text-secondary)', style:{ display:'block', margin:'0 auto 10px' } }),
        React.createElement('p', { style:{ color:'var(--text-secondary)', margin:0 } }, 'Ничего не найдено по заданным фильтрам')
      ),
      filtered.map(m => {
        const totalSales = m.links.reduce((s,l) => s + l.sales, 0);
        const missing = ['WB','Ozon','ЯМ'].filter(mp => !m.links.some(l => l.mp === mp));
        return React.createElement(Card, { key:m.id, style:{ padding:'16px 18px', cursor:'pointer', transition:'all .12s' },
          onClick: () => setEditing(m),
          onMouseEnter: e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform='translateY(-1px)'; },
          onMouseLeave: e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform='translateY(0)'; },
        },
          // Master card header
          React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:14, marginBottom:12 } },
            React.createElement(ProductThumb, { p:m, size:48 }),
            React.createElement('div', { style:{ flex:1, minWidth:0 } },
              React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' } },
                React.createElement('span', { style:{ fontFamily:'monospace', fontSize:12, color:'var(--accent)', fontWeight:700 } }, m.sku),
                React.createElement(Badge, { variant:'neutral' }, m.cat),
                React.createElement(Badge, { variant: m.status === 'active' ? 'success' : 'neutral' }, m.status === 'active' ? 'Активна' : 'Неактивна'),
                m.brand && React.createElement('span', { style:{ fontSize:12, color:'var(--text-secondary)' } }, m.brand)
              ),
              React.createElement('div', { style:{ fontSize:14, fontWeight:500, color:'var(--text-primary)', marginTop:3 } }, m.name)
            ),
            React.createElement('div', { style:{ textAlign:'right', minWidth:120 } },
              React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'Продажи 30 дн'),
              React.createElement('div', { style:{ fontSize:18, fontWeight:800, fontVariantNumeric:'tabular-nums' } }, fmtNum(totalSales) + ' шт'),
              React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' } }, fmtRub(m.salesRub))
            ),
            React.createElement('div', { style:{ display:'flex', gap:4 } },
              React.createElement('button', { onClick: e => { e.stopPropagation(); setEditing(m); }, style:{ background:'var(--bg-base)', border:'none', borderRadius:8, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--accent)' } }, React.createElement(Icon,{name:'edit',size:15})),
              React.createElement('button', { onClick: e => { e.stopPropagation(); toast('Карточка удалена','success'); }, style:{ background:'var(--bg-base)', border:'none', borderRadius:8, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--negative)' } }, React.createElement(Icon,{name:'trash',size:15}))
            )
          ),
          // 3 MP slots
          React.createElement('div', { style:{ display:'flex', gap:10 } },
            ['WB','Ozon','ЯМ'].map(mp => {
              const link = m.links.find(l => l.mp === mp);
              return React.createElement(MpSlot, { key:mp, link, mp, onClick: () => setEditing({ ...m, _focusMp: mp }) });
            })
          )
        );
      })
    ),

    // Edit modal
    editing && React.createElement(NomenclatureEditModal, { item: editing, onClose: () => setEditing(null) }),
    newOpen && React.createElement(NomenclatureEditModal, { item: { isNew:true, sku:'', name:'', cat:'Одежда', brand:'', status:'active', links:[] }, onClose: () => setNewOpen(false) })
  );
}

function AttributesTab({ attrs, setAttrs }) {
  const toast = useToast();
  const [newName, setNewName] = React.useState('');
  const [newValue, setNewValue] = React.useState({});

  const TEMPLATES = [
    { name:'Размер',   values:['XS','S','M','L','XL'] },
    { name:'Цвет',     values:['Чёрный','Белый','Серый','Синий'] },
    { name:'Материал', values:[] },
    { name:'Состав',   values:[] },
    { name:'Возраст',  values:['0-6 мес','6-12 мес','1-2 года'] },
    { name:'Сезон',    values:['Зима','Лето','Демисезон','Всесезон'] },
    { name:'Пол',      values:['Мужской','Женский','Унисекс','Детский'] },
    { name:'Объём',    values:[] },
    { name:'Мощность', values:[] },
  ];

  function addAttr(name, values = []) {
    if (!name) return;
    if (attrs.some(a => a.name.toLowerCase() === name.toLowerCase())) { toast('Такая характеристика уже добавлена','warning'); return; }
    const id = Math.max(0, ...attrs.map(a => a.id)) + 1;
    setAttrs([...attrs, { id, name, values }]);
    setNewName('');
  }
  function removeAttr(id) { setAttrs(attrs.filter(a => a.id !== id)); }
  function addValue(attrId, val) {
    if (!val) return;
    setAttrs(attrs.map(a => a.id === attrId ? { ...a, values: a.values.includes(val) ? a.values : [...a.values, val] } : a));
    setNewValue(v => ({ ...v, [attrId]: '' }));
  }
  function removeValue(attrId, val) {
    setAttrs(attrs.map(a => a.id === attrId ? { ...a, values: a.values.filter(v => v !== val) } : a));
  }

  const usedNames = new Set(attrs.map(a => a.name));
  const availableTemplates = TEMPLATES.filter(t => !usedNames.has(t.name));

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
    React.createElement('p', { style:{ margin:0, fontSize:13, color:'var(--text-secondary)' } }, 'Опишите вариативность товара: размеры, цвета, материал и т.п. Эти данные используются для разбивки продаж и публикации карточек на маркетплейсах.'),

    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      attrs.length === 0 && React.createElement('div', { style:{ padding:24, textAlign:'center', background:'var(--bg-base)', borderRadius:10, color:'var(--text-secondary)', fontSize:13 } },
        'Характеристик пока нет. Добавьте из шаблонов ниже или создайте свою.'
      ),
      attrs.map(a =>
        React.createElement('div', { key:a.id, style:{ padding:'12px 14px', background:'var(--bg-base)', borderRadius:10 } },
          React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
              React.createElement('span', { style:{ fontSize:14, fontWeight:600, color:'var(--text-primary)' } }, a.name),
              React.createElement('span', { style:{ fontSize:11, padding:'2px 6px', borderRadius:4, background:'var(--bg-card)', color:'var(--text-secondary)' } }, a.values.length + ' знач.')
            ),
            React.createElement('button', { onClick:()=>removeAttr(a.id), style:{ background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:4, opacity:.7 } }, React.createElement(Icon,{name:'trash',size:14}))
          ),
          React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 } },
            a.values.map(v =>
              React.createElement('span', { key:v, style:{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 9px', borderRadius:6, background:'var(--bg-card)', border:'1px solid var(--border)', fontSize:13, color:'var(--text-primary)' } },
                v,
                React.createElement('button', { onClick:()=>removeValue(a.id, v), style:{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:0, display:'flex', alignItems:'center' } },
                  React.createElement(Icon, { name:'x', size:11 })
                )
              )
            )
          ),
          React.createElement('div', { style:{ display:'flex', gap:6 } },
            React.createElement('input', {
              placeholder:'Добавить значение и Enter…',
              value: newValue[a.id] || '',
              onChange: e => setNewValue(v => ({ ...v, [a.id]: e.target.value })),
              onKeyDown: e => { if (e.key === 'Enter') { addValue(a.id, e.target.value); } },
              style:{ flex:1, height:32, padding:'0 10px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:6, fontSize:13, color:'var(--text-primary)', fontFamily:'inherit', outline:'none' }
            }),
            React.createElement('button', { onClick: ()=>addValue(a.id, newValue[a.id] || ''), style:{ padding:'0 12px', height:32, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-card)', color:'var(--accent)', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit' } }, '+')
          )
        )
      )
    ),

    React.createElement('div', { style:{ padding:14, border:'1.5px dashed var(--border)', borderRadius:10, display:'flex', flexDirection:'column', gap:10 } },
      React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:.4 } }, 'Добавить характеристику'),
      availableTemplates.length > 0 && React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:6 } },
        availableTemplates.map(t =>
          React.createElement('button', { key:t.name, onClick:()=>addAttr(t.name, t.values),
            style:{ padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }
          }, '+ ' + t.name)
        )
      ),
      React.createElement('div', { style:{ display:'flex', gap:6 } },
        React.createElement('input', { placeholder:'Своё название…', value:newName, onChange:e=>setNewName(e.target.value),
          onKeyDown: e => { if (e.key === 'Enter') addAttr(newName); },
          style:{ flex:1, height:36, padding:'0 12px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, fontSize:14, color:'var(--text-primary)', fontFamily:'inherit', outline:'none' }
        }),
        React.createElement(Button, { size:'sm', onClick:()=>addAttr(newName), icon:'plus' }, 'Добавить')
      )
    ),

    attrs.length >= 2 && React.createElement('div', { style:{ padding:'12px 14px', background:'color-mix(in srgb, var(--accent) 6%, transparent)', borderRadius:8, fontSize:13, display:'flex', alignItems:'center', gap:10 } },
      React.createElement(Icon, { name:'info', size:16, color:'var(--accent)', style:{ flexShrink:0 } }),
      React.createElement('span', { style:{ color:'var(--text-primary)' } },
        'Будет создано ',
        React.createElement('b', { style:{ color:'var(--accent)' } }, attrs.reduce((s,a)=>s * (a.values.length || 1), 1)),
        ' вариаций товара (комбинаций характеристик)'
      )
    )
  );
}

function NomenclatureEditModal({ item, onClose }) {
  const toast = useToast();
  const [tab, setTab] = React.useState(item._focusMp || 'main');
  const [form, setForm] = React.useState({
    sku: item.sku || '', name: item.name || '', cat: item.cat || 'Одежда',
    brand: item.brand || '', status: item.status !== 'inactive',
    cost: item.cost ? Math.round(item.cost / item.sales) : 0,
    barcode: '', weight: 0.18, dimensions: '20×15×3',
  });
  const [attrs, setAttrs] = React.useState(() => item.attrs || [
    { id:1, name:'Размер', values:['S','M','L','XL'] },
    { id:2, name:'Цвет', values:['Чёрный','Серый','Синий'] },
    { id:3, name:'Материал', values:['Хлопок 95%','Эластан 5%'] },
    { id:4, name:'Сезон', values:['Демисезон'] },
  ]);
  const links = item.links || [];

  function save() { toast(item.isNew ? 'Номенклатура создана' : 'Изменения сохранены','success'); onClose(); }

  const TABS = [
    { id:'main',  label:'Основное',     icon:'info'   },
    { id:'attrs', label:'Характеристики',icon:'database' },
    { id:'WB',    label:'Wildberries',  icon:'package', color:'#CB11AB' },
    { id:'Ozon',  label:'Ozon',         icon:'package', color:'#005BFF' },
    { id:'ЯМ',    label:'Яндекс Маркет',icon:'package', color:'#FC3F1D' },
    { id:'cost',  label:'Себестоимость',icon:'database' },
  ];

  return React.createElement(Modal, { open:true, onClose, title: item.isNew ? 'Новая номенклатура' : `Редактирование · ${item.sku}`, width:680 },
    React.createElement('div', { style:{ marginLeft:-28, marginRight:-28, borderBottom:'1px solid var(--border)', marginBottom:20, paddingLeft:28, paddingRight:28, display:'flex', gap:2, overflowX:'auto' } },
      TABS.map(t =>
        React.createElement('button', { key:t.id, onClick:()=>setTab(t.id),
          style:{
            padding:'10px 14px', border:'none', background:'transparent',
            borderBottom: '2px solid ' + (tab === t.id ? (t.color || 'var(--accent)') : 'transparent'),
            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: tab === t.id ? 700 : 500, fontSize:13, cursor:'pointer', fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
          }
        },
          t.color && React.createElement('span', { style:{ width:8, height:8, borderRadius:'50%', background:t.color } }),
          t.label
        )
      )
    ),

    tab === 'main' && React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
      React.createElement('div', { style:{ display:'flex', gap:14, alignItems:'flex-start' } },
        React.createElement('div', { style:{ width:120, height:120, borderRadius:12, background:'var(--bg-base)', border:'2px dashed var(--border)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, cursor:'pointer', color:'var(--text-secondary)', flexShrink:0 } },
          item.sku ? React.createElement(ProductThumb, { p: item, size:80 }) : React.createElement(Icon, { name:'upload', size:24 }),
          React.createElement('span', { style:{ fontSize:11 } }, item.sku ? 'Заменить фото' : 'Добавить фото')
        ),
        React.createElement('div', { style:{ flex:1, display:'flex', flexDirection:'column', gap:12 } },
          React.createElement(Input, { label:'Внутренний артикул', value:form.sku, onChange:e=>setForm(f=>({...f,sku:e.target.value})), placeholder:'WP-XXXX' }),
          React.createElement(Input, { label:'Название', value:form.name, onChange:e=>setForm(f=>({...f,name:e.target.value})) }),
        )
      ),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 } },
        React.createElement(Select, { label:'Категория', value:form.cat, onChange:e=>setForm(f=>({...f,cat:e.target.value})), options:['Одежда','Аксессуары','Сумки','Косметика','Электроника','Товары для дома','Товары для сна'] }),
        React.createElement(Input, { label:'Бренд', value:form.brand, onChange:e=>setForm(f=>({...f,brand:e.target.value})) }),
        React.createElement(Input, { label:'Штрих-код', value:form.barcode, onChange:e=>setForm(f=>({...f,barcode:e.target.value})), placeholder:'4607012345678' }),
        React.createElement(Input, { label:'Вес, кг', type:'number', value:form.weight, onChange:e=>setForm(f=>({...f,weight:e.target.value})), suffix:'кг' }),
      ),
      React.createElement(Toggle, { checked:form.status, onChange:v=>setForm(f=>({...f,status:v})), label:'Активная номенклатура' })
    ),

    tab === 'attrs' && React.createElement(AttributesTab, { attrs, setAttrs }),

    (tab === 'WB' || tab === 'Ozon' || tab === 'ЯМ') && (() => {
      const link = links.find(l => l.mp === tab);
      const meta = MP_META[tab];
      if (!link) return React.createElement('div', { style:{ textAlign:'center', padding:'32px 0' } },
        React.createElement('div', { style:{ width:56, height:56, borderRadius:'50%', background:`color-mix(in srgb, ${meta.color} 16%, transparent)`, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center' } },
          React.createElement(Icon, { name:'plus', size:24, color: meta.color })
        ),
        React.createElement('h3', { style:{ margin:'0 0 6px', fontSize:16 } }, `Не привязано к ${tab}`),
        React.createElement('p', { style:{ fontSize:13, color:'var(--text-secondary)', margin:'0 0 18px' } }, `Свяжите карточку с маркетплейсом ${tab}, чтобы агрегировать продажи и расходы.`),
        React.createElement(Input, { label:`Артикул на ${tab}`, placeholder: tab==='WB'?'12345678':tab==='Ozon'?'OZ-XXXX':'YM-XXXXX' }),
        React.createElement('div', { style:{ marginTop:14 } },
          React.createElement(Button, { onClick:()=>{ toast(`Привязано к ${tab}`,'success'); onClose(); } }, `Привязать к ${tab}`)
        )
      );
      return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:12 } },
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, background:`color-mix(in srgb, ${meta.color} 8%, transparent)`, border:`1px solid ${meta.color}40` } },
          React.createElement('span', { style:{ width:10, height:10, borderRadius:'50%', background:meta.color } }),
          React.createElement('span', { style:{ fontWeight:700, color:meta.color } }, tab + ': ' + link.sku),
          React.createElement(Badge, { variant: link.active ? 'success' : 'danger', style:{ marginLeft:'auto' } }, link.active ? '● Синхронизирован' : '⚠ Ошибка')
        ),
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 } },
          React.createElement(Input, { label:'Артикул МП', value: link.sku, onChange:()=>{} }),
          React.createElement(Input, { label:'Текущая цена', value: link.price, suffix:'₽', onChange:()=>{} }),
          React.createElement(Input, { label:'Продажи 30 дн', value: link.sales, suffix:'шт', onChange:()=>{} }),
          React.createElement(Input, { label:'Остаток на складе МП', value: 142, suffix:'шт', onChange:()=>{} }),
        ),
        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 } },
          React.createElement(Input, { label:`Комиссия ${tab}, %`, type:'number', value: 11, suffix:'%' }),
          React.createElement(Input, { label:'Логистика, %', type:'number', value: 8, suffix:'%' }),
        ),
        React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', gap:8 } },
          React.createElement(Button, { variant:'secondary', size:'sm', icon:'refresh', onClick:()=>toast('Синхронизация запущена','success') }, 'Синхронизировать сейчас'),
          React.createElement(Button, { variant:'secondary', size:'sm', icon:'trash', onClick:()=>toast(`Связка с ${tab} удалена`,'success'), style:{ color:'var(--negative)' } }, 'Отвязать')
        )
      );
    })(),

    tab === 'cost' && React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
      React.createElement('p', { style:{ margin:0, fontSize:13, color:'var(--text-secondary)' } }, 'Себестоимость закупки за единицу. Используется для расчёта маржи во всех отчётах.'),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 } },
        React.createElement(Input, { label:'Цена закупки за ед.', value:form.cost, onChange:e=>setForm(f=>({...f,cost:e.target.value})), prefix:'₽', type:'number' }),
        React.createElement(Select, { label:'Тип учёта', value:'supply', onChange:()=>{}, options:[{value:'supply',label:'По поставке'},{value:'period',label:'По периоду'},{value:'fifo',label:'FIFO'}] }),
      ),
      React.createElement('div', { style:{ padding:14, borderRadius:8, background:'var(--bg-base)', display:'flex', flexDirection:'column', gap:8 } },
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:.4 } }, 'Последние поставки'),
        [
          { date:'15 апр 2026', qty:120, price:180 },
          { date:'02 апр 2026', qty:80,  price:175 },
          { date:'18 мар 2026', qty:200, price:172 },
        ].map((s,i) =>
          React.createElement('div', { key:i, style:{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13, borderBottom: i<2?'1px solid var(--border)':'none' } },
            React.createElement('span', null, s.date),
            React.createElement('span', { style:{ color:'var(--text-secondary)' } }, fmtNum(s.qty) + ' шт'),
            React.createElement('span', { style:{ fontWeight:600, fontVariantNumeric:'tabular-nums' } }, fmtRub(s.price))
          )
        )
      )
    ),

    React.createElement('div', { style:{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24, paddingTop:18, borderTop:'1px solid var(--border)' } },
      React.createElement(Button, { variant:'secondary', onClick:onClose }, 'Отмена'),
      React.createElement(Button, { onClick:save, icon:'check' }, item.isNew ? 'Создать' : 'Сохранить')
    )
  );
}

function ExpenseItemsDirectory() {
  const toast = useToast();
  const items = [
    { id:1, name:'Реклама WB', type:'ОПУ+ДДС', mp:'Wildberries', cat:'Маркетинг', active:true },
    { id:2, name:'Логистика Ozon', type:'ОПУ', mp:'Ozon', cat:'Логистика', active:true },
    { id:3, name:'Хранение', type:'ОПУ', mp:'Все', cat:'Операционные', active:true },
    { id:4, name:'ФОТ', type:'ОПУ+ДДС', mp:'—', cat:'Персонал', active:true },
    { id:5, name:'Аренда офиса', type:'ДДС', mp:'—', cat:'Административные', active:true },
    { id:6, name:'Программное обеспечение', type:'ДДС', mp:'—', cat:'Административные', active:true },
    { id:7, name:'Платная приёмка WB', type:'ОПУ', mp:'Wildberries', cat:'Логистика', active:false },
    { id:8, name:'Штрафы', type:'ОПУ', mp:'Все', cat:'Прочие', active:true },
  ];
  return React.createElement('div', null,
    React.createElement('div', { style:{ display:'flex', justifyContent:'flex-end', marginBottom:16 } },
      React.createElement(Button, { icon:'plus', onClick:()=>toast('Функция в разработке','warning') }, 'Добавить статью')
    ),
    React.createElement(Card, { style:{ padding:0 } },
      React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style:{ background:'var(--bg-base)' } },
            ['Название','Тип','Маркетплейс','Категория ОПУ','Активна','Действия'].map(h =>
              React.createElement('th', { key:h, style:{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4 } }, h)
            )
          )
        ),
        React.createElement('tbody', null,
          items.map(r =>
            React.createElement('tr', { key:r.id,
              onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 5%, transparent)',
              onMouseLeave:e=>e.currentTarget.style.background='transparent',
            },
              React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', fontWeight:500 } }, r.name),
              React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' } }, React.createElement(Badge, { variant:'neutral' }, r.type)),
              React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' } }, r.mp),
              React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)' } }, r.cat),
              React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' } }, React.createElement(Badge, { variant: r.active?'success':'neutral' }, r.active?'Да':'Нет')),
              React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' } },
                React.createElement('div', { style:{ display:'flex', gap:6 } },
                  React.createElement('button', { style:{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', padding:4 } }, React.createElement(Icon,{name:'edit',size:16})),
                  React.createElement('button', { style:{ background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:4 } }, React.createElement(Icon,{name:'trash',size:16}))
                )
              )
            )
          )
        )
      )
    )
  );
}

function CostBySupplyDirectory() {
  const toast = useToast();
  const [rows, setRows] = React.useState(PRODUCTS.slice(0,8).map((p,i) => ({ id:p.id, name:p.name, sku:p.sku, qty: [50,120,80,30,60,200,40,90][i], price: [180,290,85,420,1200,180,140,210][i] })));
  function updateRow(id, field, val) {
    setRows(rs => rs.map(r => r.id===id ? {...r, [field]: Number(val)||0} : r));
  }
  const total = rows.reduce((s,r) => s + r.qty * r.price, 0);
  return React.createElement('div', null,
    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 } },
      React.createElement('div', null,
        React.createElement('h2', { style:{ margin:0, fontSize:16, fontWeight:700 } }, 'Поставка #П-2026-018'),
        React.createElement('div', { style:{ fontSize:13, color:'var(--text-secondary)', marginTop:4 } }, 'Дата: 20 апреля 2026 · ' + rows.length + ' позиций')
      ),
      React.createElement('div', { style:{ display:'flex', gap:10 } },
        React.createElement(Button, { variant:'secondary', icon:'copy', onClick:()=>toast('Скопировано из поставки П-2026-017','success') }, 'Копировать из предыдущей'),
        React.createElement(Button, { variant:'secondary', icon:'upload' }, 'Загрузить Excel'),
        React.createElement(Button, { icon:'check', onClick:()=>toast('Себестоимость сохранена','success') }, 'Сохранить')
      )
    ),
    React.createElement(Card, { style:{ padding:0 } },
      React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style:{ background:'var(--bg-base)' } },
            ['Артикул','Номенклатура','Кол-во, шт','Цена за ед., ₽','Итого, ₽'].map((h,i) =>
              React.createElement('th', { key:h, style:{ padding:'10px 14px', textAlign: i>1?'right':'left', fontSize:12, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4 } }, h)
            )
          )
        ),
        React.createElement('tbody', null,
          rows.map(r =>
            React.createElement('tr', { key:r.id },
              React.createElement('td', { style:{ padding:'8px 14px', fontSize:12, borderBottom:'1px solid var(--border)', fontFamily:'monospace', color:'var(--accent)' } }, r.sku),
              React.createElement('td', { style:{ padding:'8px 14px', fontSize:13, borderBottom:'1px solid var(--border)', maxWidth:220 } }, React.createElement('span', { style:{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' } }, r.name)),
              React.createElement('td', { style:{ padding:'4px 14px', borderBottom:'1px solid var(--border)', textAlign:'right' } },
                React.createElement('input', { type:'number', value:r.qty, onChange:e=>updateRow(r.id,'qty',e.target.value), style:{ width:80, padding:'6px 10px', textAlign:'right', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' } })
              ),
              React.createElement('td', { style:{ padding:'4px 14px', borderBottom:'1px solid var(--border)', textAlign:'right' } },
                React.createElement('input', { type:'number', value:r.price, onChange:e=>updateRow(r.id,'price',e.target.value), style:{ width:110, padding:'6px 10px', textAlign:'right', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' } })
              ),
              React.createElement('td', { style:{ padding:'8px 14px', borderBottom:'1px solid var(--border)', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600 } }, fmtRub(r.qty*r.price))
            )
          ),
          React.createElement('tr', { style:{ background:'color-mix(in srgb, var(--accent) 6%, transparent)' } },
            React.createElement('td', { colSpan:4, style:{ padding:'12px 14px', fontWeight:700, fontSize:14 } }, 'Итого по поставке'),
            React.createElement('td', { style:{ padding:'12px 14px', textAlign:'right', fontWeight:800, fontSize:16, fontVariantNumeric:'tabular-nums', color:'var(--accent)' } }, fmtRub(total))
          )
        )
      )
    )
  );
}

function CostByPeriodDirectory() {
  const toast = useToast();
  const [rows, setRows] = React.useState(PRODUCTS.slice(0,6).map((p,i) => ({ id:p.id, name:p.name, sku:p.sku, period:'Апрель 2026', price:[180,290,85,420,1200,180][i] })));
  function updatePrice(id, val) { setRows(rs => rs.map(r => r.id===id ? {...r,price:Number(val)||0} : r)); }
  return React.createElement('div', null,
    React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 } },
      React.createElement(Select, { value:'apr-2026', onChange:()=>{}, options:[{value:'apr-2026',label:'Апрель 2026'},{value:'mar-2026',label:'Март 2026'},{value:'feb-2026',label:'Февраль 2026'}] }),
      React.createElement('div', { style:{ display:'flex', gap:10 } },
        React.createElement(Button, { variant:'secondary', icon:'upload' }, 'Загрузить Excel'),
        React.createElement(Button, { icon:'check', onClick:()=>toast('Себестоимость по периоду сохранена','success') }, 'Сохранить')
      )
    ),
    React.createElement(Card, { style:{ padding:0 } },
      React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style:{ background:'var(--bg-base)' } },
            ['Артикул','Номенклатура','Период','Цена за ед., ₽'].map((h,i) =>
              React.createElement('th', { key:h, style:{ padding:'10px 14px', textAlign: i>1?'right':'left', fontSize:12, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4 } }, h)
            )
          )
        ),
        React.createElement('tbody', null,
          rows.map(r =>
            React.createElement('tr', { key:r.id,
              onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 5%, transparent)',
              onMouseLeave:e=>e.currentTarget.style.background='transparent',
            },
              React.createElement('td', { style:{ padding:'8px 14px', fontSize:12, borderBottom:'1px solid var(--border)', fontFamily:'monospace', color:'var(--accent)' } }, r.sku),
              React.createElement('td', { style:{ padding:'8px 14px', fontSize:13, borderBottom:'1px solid var(--border)' } }, r.name),
              React.createElement('td', { style:{ padding:'8px 14px', fontSize:13, borderBottom:'1px solid var(--border)', textAlign:'right', color:'var(--text-secondary)' } }, r.period),
              React.createElement('td', { style:{ padding:'4px 14px', borderBottom:'1px solid var(--border)', textAlign:'right' } },
                React.createElement('input', { type:'number', value:r.price, onChange:e=>updatePrice(r.id,e.target.value), style:{ width:110, padding:'6px 10px', textAlign:'right', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-primary)', fontSize:13, fontFamily:'inherit' } })
              )
            )
          )
        )
      )
    )
  );
}

Object.assign(window, { NomenclatureDirectory, ExpenseItemsDirectory, CostBySupplyDirectory, CostByPeriodDirectory });
