
// ── Registers: Operations + Import ───────────────────────────────────────────

function OperationsRegister() {
  const toast = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [filter, setFilter] = React.useState({ mp:'all', type:'all' });
  const [form, setForm] = React.useState({
    dateDDS: '2026-04-26', dateOPU: '2026-04-26',
    mp:'Wildberries', article:'Реклама', type:'expense',
    amount:'', account:'Расч. счёт', comment:''
  });

  const filtered = OPERATIONS.filter(r => {
    if (filter.mp !== 'all' && r.mp !== filter.mp) return false;
    if (filter.type !== 'all' && r.type !== filter.type) return false;
    return true;
  });

  const totalIncome = filtered.filter(r=>r.type==='income').reduce((s,r)=>s+r.amount,0);
  const totalExpense = filtered.filter(r=>r.type==='expense').reduce((s,r)=>s+Math.abs(r.amount),0);

  function saveOp() {
    if (!form.amount) { toast('Введите сумму','error'); return; }
    toast('Операция добавлена','success');
    setShowForm(false);
    setForm({dateDDS:'2026-04-26',dateOPU:'2026-04-26',mp:'Wildberries',article:'Реклама',type:'expense',amount:'',account:'Расч. счёт',comment:''});
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
    // Summary cards
    React.createElement('div', { style:{ display:'flex', gap:14 } },
      React.createElement(Card, { style:{ flex:1 } },
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 } }, 'Поступления (апрель)'),
        React.createElement('div', { style:{ fontSize:22, fontWeight:800, color:'var(--positive)', fontVariantNumeric:'tabular-nums' } }, fmtRub(totalIncome))
      ),
      React.createElement(Card, { style:{ flex:1 } },
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 } }, 'Расходы (апрель)'),
        React.createElement('div', { style:{ fontSize:22, fontWeight:800, color:'var(--negative)', fontVariantNumeric:'tabular-nums' } }, fmtRub(totalExpense))
      ),
      React.createElement(Card, { style:{ flex:1 } },
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 } }, 'Баланс'),
        React.createElement('div', { style:{ fontSize:22, fontWeight:800, fontVariantNumeric:'tabular-nums', color: (totalIncome-totalExpense)>0?'var(--positive)':'var(--negative)' } }, fmtRub(totalIncome-totalExpense))
      )
    ),

    // Controls
    React.createElement('div', { style:{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' } },
      React.createElement(Select, { value:filter.mp, onChange:e=>setFilter(f=>({...f,mp:e.target.value})),
        options:[{value:'all',label:'Все МП'},{value:'Wildberries',label:'Wildberries'},{value:'Ozon',label:'Ozon'},{value:'Яндекс Маркет',label:'Яндекс Маркет'},{value:'—',label:'Без МП'}]
      }),
      React.createElement(Select, { value:filter.type, onChange:e=>setFilter(f=>({...f,type:e.target.value})),
        options:[{value:'all',label:'Все типы'},{value:'income',label:'Приход'},{value:'expense',label:'Расход'}]
      }),
      React.createElement('div', { style:{ marginLeft:'auto', display:'flex', gap:8 } },
        React.createElement(Button, { variant:'secondary', icon:'upload', onClick:()=>setImportOpen(true) }, 'Импорт'),
        React.createElement(Button, { icon:'plus', onClick:()=>setShowForm(s=>!s) }, 'Добавить операцию')
      )
    ),

    // Add form
    showForm && React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:15, fontWeight:700, marginTop:0, marginBottom:16 } }, 'Новая операция'),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 } },
        React.createElement('div', null, React.createElement(Input, { label:'Дата ДДС', type:'date', value:form.dateDDS, onChange:e=>setForm(f=>({...f,dateDDS:e.target.value})) })),
        React.createElement('div', null, React.createElement(Input, { label:'Дата ОПУ', type:'date', value:form.dateOPU, onChange:e=>setForm(f=>({...f,dateOPU:e.target.value})) })),
        React.createElement('div', null, React.createElement(Select, { label:'Маркетплейс', value:form.mp, onChange:e=>setForm(f=>({...f,mp:e.target.value})), options:['Wildberries','Ozon','Яндекс Маркет','—'] })),
        React.createElement('div', null, React.createElement(Select, { label:'Статья расходов', value:form.article, onChange:e=>setForm(f=>({...f,article:e.target.value})), options:['Реклама','Логистика','Хранение','ФОТ','Аренда','Поступление выручки','Прочие'] })),
        React.createElement('div', null,
          React.createElement('label', { style:{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:5 } }, 'Тип'),
          React.createElement('div', { style:{ display:'flex', gap:8 } },
            ['income','expense'].map(t =>
              React.createElement('button', { key:t, onClick:()=>setForm(f=>({...f,type:t})),
                style:{ flex:1, padding:'9px', borderRadius:8, border:'1px solid var(--border)', background: form.type===t?(t==='income'?'var(--positive)':'var(--negative)'):'var(--bg-base)', color: form.type===t?'#fff':'var(--text-secondary)', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit' }
              }, t==='income'?'Приход':'Расход')
            )
          )
        ),
        React.createElement('div', null, React.createElement(Input, { label:'Сумма, ₽', type:'number', value:form.amount, onChange:e=>setForm(f=>({...f,amount:e.target.value})), prefix:'₽' })),
        React.createElement('div', null, React.createElement(Select, { label:'Счёт', value:form.account, onChange:e=>setForm(f=>({...f,account:e.target.value})), options:['Расч. счёт','Карта','Наличные'] })),
        React.createElement('div', { style:{ gridColumn:'1/-1' } },
          React.createElement('label', { style:{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:5 } }, 'Комментарий'),
          React.createElement('textarea', { value:form.comment, onChange:e=>setForm(f=>({...f,comment:e.target.value})), rows:2, placeholder:'Необязательно…',
            style:{ width:'100%', padding:'8px 12px', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }
          })
        )
      ),
      React.createElement('div', { style:{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 } },
        React.createElement(Button, { variant:'secondary', onClick:()=>setShowForm(false) }, 'Отмена'),
        React.createElement(Button, { onClick:saveOp }, 'Добавить')
      )
    ),

    // Table
    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ overflowX:'auto' } },
        React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse', minWidth:800 } },
          React.createElement('thead', null,
            React.createElement('tr', { style:{ background:'var(--bg-base)' } },
              ['Дата ДДС','Дата ОПУ','МП','Статья','Тип','Сумма','Счёт','Комментарий',''].map(h =>
                React.createElement('th', { key:h, style:{ padding:'10px 14px', textAlign: h==='Сумма'?'right':'left', fontSize:12, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4, whiteSpace:'nowrap' } }, h)
              )
            )
          ),
          React.createElement('tbody', null,
            filtered.map(r =>
              React.createElement('tr', { key:r.id,
                onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 5%, transparent)',
                onMouseLeave:e=>e.currentTarget.style.background='transparent',
              },
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' } }, r.dateDDS),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', color:'var(--text-secondary)', whiteSpace:'nowrap' } }, r.dateOPU),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)' } }, r.mp),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', fontWeight:500 } }, r.article),
                React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' } },
                  React.createElement(Badge, { variant: r.type==='income'?'success':'danger' }, r.type==='income'?'Приход':'Расход')
                ),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color: r.type==='income'?'var(--positive)':'var(--negative)' } }, fmtRub(Math.abs(r.amount))),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:13, borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' } }, r.account),
                React.createElement('td', { style:{ padding:'10px 14px', fontSize:12, borderBottom:'1px solid var(--border)', color:'var(--text-secondary)', maxWidth:160 } }, React.createElement('span', { style:{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' } }, r.comment || '—')),
                React.createElement('td', { style:{ padding:'10px 14px', borderBottom:'1px solid var(--border)' } },
                  React.createElement('div', { style:{ display:'flex', gap:4 } },
                    React.createElement('button', { onClick:()=>toast('Операция удалена','success'), style:{ background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:4 } }, React.createElement(Icon,{name:'trash',size:15}))
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Import Modal
    React.createElement(Modal, { open:importOpen, onClose:()=>setImportOpen(false), title:'Импорт данных', width:560 },
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:16 } },
        React.createElement('div', {
          onDragOver:e=>{e.preventDefault();setDragOver(true)},
          onDragLeave:()=>setDragOver(false),
          onDrop:e=>{e.preventDefault();setDragOver(false);toast('Файл загружен. Проверьте маппинг.','success')},
          style:{ border:`2px dashed ${dragOver?'var(--accent)':'var(--border)'}`, borderRadius:12, padding:40, textAlign:'center', background: dragOver?'color-mix(in srgb, var(--accent) 6%, transparent)':'var(--bg-base)', transition:'all .2s', cursor:'pointer' }
        },
          React.createElement(Icon, { name:'upload', size:32, color:'var(--text-secondary)', style:{ display:'block', margin:'0 auto 10px' } }),
          React.createElement('p', { style:{ margin:'0 0 6px', fontWeight:600, color:'var(--text-primary)' } }, 'Перетащите файл или нажмите для загрузки'),
          React.createElement('p', { style:{ margin:0, fontSize:13, color:'var(--text-secondary)' } }, 'Excel (.xlsx) или CSV, до 10MB')
        ),
        React.createElement('div', null,
          React.createElement('h4', { style:{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:.4 } }, 'Маппинг колонок'),
          React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
            [['Дата','dateDDS'],['Сумма','amount'],['Комментарий','comment']].map(([col, field]) =>
              React.createElement('div', { key:col, style:{ display:'flex', alignItems:'center', gap:10 } },
                React.createElement('span', { style:{ flex:1, fontSize:13, padding:'8px 12px', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:6 } }, col),
                React.createElement(Icon, { name:'chevronRight', size:16, color:'var(--text-secondary)' }),
                React.createElement(Select, { value:field, onChange:()=>{}, options:[{value:'dateDDS',label:'Дата ДДС'},{value:'amount',label:'Сумма'},{value:'comment',label:'Комментарий'},{value:'skip',label:'— Пропустить —'}] })
              )
            )
          )
        ),
        React.createElement('div', { style:{ display:'flex', gap:10, justifyContent:'flex-end' } },
          React.createElement(Button, { variant:'secondary', onClick:()=>setImportOpen(false) }, 'Отмена'),
          React.createElement(Button, { onClick:()=>{toast('Данные импортированы','success');setImportOpen(false);} }, 'Импортировать')
        )
      )
    )
  );
}

Object.assign(window, { OperationsRegister });
