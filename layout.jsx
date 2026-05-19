
// ── Layout: Sidebar + Header ─────────────────────────────────────────────────

const NAV = [
  { id:'dashboard', label:'Главный дашборд', icon:'home', href:'dashboard' },
  { id:'reports', label:'Отчёты', icon:'chart', children:[
    { id:'reports/nomenclature', label:'Анализ по номенклатурам' },
    { id:'reports/weekly', label:'Отчёт по неделям' },
    { id:'reports/pnl', label:'P&L (прибыли и убытки)' },
  ]},
  { id:'directories', label:'Справочники', icon:'folder', children:[
    { id:'directories/nomenclature', label:'Номенклатура' },
    { id:'directories/expense-items', label:'Статьи расходов' },
    { id:'directories/cost-supply', label:'Себестоимость по поставке' },
    { id:'directories/cost-period', label:'Себестоимость по периоду' },
  ]},
  { id:'registers', label:'Реестры', icon:'clipboard', children:[
    { id:'registers/operations', label:'Операции / расходы' },
  ]},
  { id:'settings', label:'Настройки', icon:'settings', children:[
    { id:'settings/profile', label:'Профиль' },
    { id:'settings/api', label:'API-токены' },
    { id:'settings/norms', label:'Нормы по показателям' },
    { id:'settings/notifications', label:'Уведомления' },
  ]},
];

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const [open, setOpen] = React.useState(() => {
    const all = {};
    NAV.forEach(n => { if (n.children) all[n.id] = n.children.some(c => c.id === page); });
    return all;
  });

  function toggle(id) { setOpen(o => ({ ...o, [id]: !o[id] })); }
  function isActive(id) { return page === id; }

  function NavItem({ item, depth = 0 }) {
    const hasChildren = !!item.children;
    const isOpen = open[item.id];
    const active = isActive(item.id);
    const parentActive = hasChildren && item.children.some(c => c.id === page);

    return React.createElement('div', null,
      React.createElement('div', {
        'data-tour': depth === 0 ? `nav-${item.id}` : undefined,
        onClick: () => hasChildren ? toggle(item.id) : setPage(item.id),
        style: {
          display:'flex', alignItems:'center', gap:10, padding: depth === 0 ? '9px 16px' : '7px 16px 7px 42px',
          borderRadius:8, cursor:'pointer', margin:'1px 6px',
          background: active ? 'var(--accent)' : parentActive && !isOpen ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
          color: active ? '#fff' : parentActive ? 'var(--accent)' : 'var(--text-secondary)',
          fontSize:14, fontWeight: depth === 0 ? 500 : 400,
          transition:'all .15s',
        }
      },
        depth === 0 && React.createElement(Icon, { name:item.icon, size:18 }),
        React.createElement('span', { style:{ flex:1, fontSize:13 } }, item.label),
        hasChildren && React.createElement(Icon, { name: isOpen ? 'chevronDown' : 'chevronRight', size:15 })
      ),
      hasChildren && isOpen && item.children.map(c => React.createElement(NavItem, { key:c.id, item:c, depth:depth+1 }))
    );
  }

  return React.createElement('aside', {
    'data-tour':'sidebar',
    style: {
      width:240, minWidth:240, height:'100vh', position:'sticky', top:0,
      background:'var(--bg-sidebar)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0,
      zIndex:10,
    }
  },
    React.createElement('div', { style:{ padding:'20px 16px 12px', borderBottom:'1px solid var(--border)' } },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10 } },
        React.createElement('div', { style:{ width:32, height:32, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' } },
          React.createElement(Icon, { name:'trendingUp', size:18, color:'#fff' })
        ),
        React.createElement('span', { style:{ fontSize:16, fontWeight:800, color:'var(--text-primary)', letterSpacing:-.3 } }, 'Wild Profit')
      )
    ),
    React.createElement('nav', { style:{ flex:1, padding:'10px 0', overflowY:'auto' } },
      NAV.map(item => React.createElement(NavItem, { key:item.id, item }))
    ),
    React.createElement('div', { style:{ padding:'12px 16px', borderTop:'1px solid var(--border)' } },
      React.createElement('div', {
        onClick: () => setPage('login'),
        style:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', color:'var(--text-secondary)', fontSize:13 }
      },
        React.createElement(Icon, { name:'logout', size:16 }),
        'Выйти'
      )
    )
  );
}

function Header({ page, setPage }) {
  const { theme, toggle } = useTheme();
  const pageTitle = React.useMemo(() => {
    for (const n of NAV) {
      if (n.id === page) return n.label;
      if (n.children) { const c = n.children.find(x => x.id === page); if (c) return c.label; }
    }
    return '';
  }, [page]);

  return React.createElement('header', {
    style: { height:64, borderBottom:'1px solid var(--border)', background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:9, flexShrink:0 }
  },
    React.createElement('h1', { style:{ fontSize:18, fontWeight:700, color:'var(--text-primary)', margin:0 } }, pageTitle),
    React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:12 } },
      React.createElement('button', {
        'data-tour':'theme-toggle',
        onClick: toggle,
        style:{ background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }
      }, React.createElement(Icon, { name: theme === 'dark' ? 'sun' : 'moon', size:18 })),
      React.createElement('button', {
        onClick: () => setPage('settings/notifications'),
        style:{ background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }
      }, React.createElement(Icon, { name:'bell', size:18 })),
      React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }, onClick:()=>setPage('settings/profile') },
        React.createElement('div', {
          style:{ width:36, height:36, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }
        }, 'АК'),
        React.createElement('div', null,
          React.createElement('div', { style:{ fontSize:13, fontWeight:600, color:'var(--text-primary)' } }, 'Анна Козлова'),
          React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)' } }, 'anna@store.ru')
        )
      )
    )
  );
}

function Layout({ page, setPage, children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return React.createElement('div', { style:{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' } },
    React.createElement('div', { style:{ display:'flex' } },
      React.createElement(Sidebar, { page, setPage })
    ),
      React.createElement('div', { style:{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' } },
        React.createElement(Header, { page, setPage }),
        React.createElement('main', { style:{ flex:1, overflowY:'auto', padding:28 } }, children)
      ),
      React.createElement(HelpFab)
  );
}

Object.assign(window, { Layout, Sidebar, Header });
