
// ── Settings Pages ────────────────────────────────────────────────────────────

function SettingsProfile() {
  const toast = useToast();
  const [form, setForm] = React.useState({
    name:'Анна Козлова', email:'anna@store.ru',
    lang:'ru', tz:'Europe/Moscow',
    company:'ИП Козлова А.В.', tax:6, vat:false, costType:'supply',
  });
  const [pwForm, setPwForm] = React.useState({ current:'', next:'', confirm:'' });
  const [pwErr, setPwErr] = React.useState('');

  function save() {
    toast('Настройки сохранены', 'success');
  }
  function changePw() {
    if (pwForm.next !== pwForm.confirm) { setPwErr('Пароли не совпадают'); return; }
    if (pwForm.next.length < 8) { setPwErr('Минимум 8 символов'); return; }
    setPwErr(''); setPwForm({current:'',next:'',confirm:''});
    toast('Пароль изменён', 'success');
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:20, maxWidth:720 } },
    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Профиль'),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 } },
        React.createElement(Input, { label:'Имя', value:form.name, onChange:e=>setForm(f=>({...f,name:e.target.value})) }),
        React.createElement(Input, { label:'Email', type:'email', value:form.email, onChange:e=>setForm(f=>({...f,email:e.target.value})) }),
        React.createElement(Select, { label:'Язык', value:form.lang, onChange:e=>setForm(f=>({...f,lang:e.target.value})), options:[{value:'ru',label:'Русский'},{value:'en',label:'English'}] }),
        React.createElement(Select, { label:'Часовой пояс', value:form.tz, onChange:e=>setForm(f=>({...f,tz:e.target.value})),
          options:[{value:'Europe/Moscow',label:'Москва (UTC+3)'},{value:'Europe/Samara',label:'Самара (UTC+4)'},{value:'Asia/Yekaterinburg',label:'Екатеринбург (UTC+5)'}]
        })
      )
    ),

    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Смена пароля'),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:12, maxWidth:360 } },
        React.createElement(Input, { label:'Текущий пароль', type:'password', value:pwForm.current, onChange:e=>setPwForm(f=>({...f,current:e.target.value})) }),
        React.createElement(Input, { label:'Новый пароль', type:'password', value:pwForm.next, onChange:e=>setPwForm(f=>({...f,next:e.target.value})) }),
        React.createElement(Input, { label:'Подтверждение пароля', type:'password', value:pwForm.confirm, onChange:e=>setPwForm(f=>({...f,confirm:e.target.value})), error:pwErr }),
        React.createElement(Button, { onClick:changePw, style:{ alignSelf:'flex-start' } }, 'Изменить пароль')
      )
    ),

    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Настройки компании'),
      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 } },
        React.createElement('div', { style:{ gridColumn:'1/-1' } },
          React.createElement(Input, { label:'Название компании / ИП', value:form.company, onChange:e=>setForm(f=>({...f,company:e.target.value})) })
        ),
        React.createElement(Input, { label:'Ставка налога (%)', type:'number', value:form.tax, onChange:e=>setForm(f=>({...f,tax:e.target.value})), suffix:'%' }),
        React.createElement(Select, { label:'Тип себестоимости', value:form.costType, onChange:e=>setForm(f=>({...f,costType:e.target.value})),
          options:[{value:'supply',label:'По поставке'},{value:'period',label:'По периоду'}]
        }),
        React.createElement('div', { style:{ display:'flex', alignItems:'center', paddingTop:22 } },
          React.createElement(Toggle, { checked:form.vat, onChange:v=>setForm(f=>({...f,vat:v})), label:'Учёт НДС' })
        )
      )
    ),

    React.createElement('div', { style:{ display:'flex', justifyContent:'flex-end' } },
      React.createElement(Button, { onClick:save, size:'lg' }, 'Сохранить изменения')
    )
  );
}

function SettingsAPI() {
  const toast = useToast();
  const [mp, setMp] = React.useState('WB');
  const [token, setToken] = React.useState('');
  const [showToken, setShowToken] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testStatus, setTestStatus] = React.useState(null);

  const connected = [
    { id:1, mp:'Wildberries', status:'connected', expires:'2026-09-15', cabinet:'ИП Козлова А.В.' },
    { id:2, mp:'Ozon', status:'connected', expires:'2026-11-30', cabinet:'WP Store' },
    { id:3, mp:'Яндекс Маркет', status:'error', expires:'2026-05-01', cabinet:'WP YM' },
  ];

  function testConnection() {
    setTesting(true); setTestStatus(null);
    setTimeout(() => { setTesting(false); setTestStatus(token.length > 5 ? 'ok' : 'error'); }, 1500);
  }
  function addToken() {
    if (!token) return;
    toast('API-токен добавлен', 'success');
    setToken('');
  }

  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:20, maxWidth:720 } },
    React.createElement(Alert, { type:'warning', title:'Истекает токен Яндекс Маркет' }, 'Срок действия токена истекает 1 мая 2026. Обновите токен, чтобы данные продолжали синхронизироваться.'),

    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Подключить маркетплейс'),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
        React.createElement(Select, { label:'Маркетплейс', value:mp, onChange:e=>setMp(e.target.value), options:['WB','Ozon','Яндекс Маркет'] }),
        React.createElement('div', { style:{ position:'relative' } },
          React.createElement(Input, { label:'API-ключ / токен', type: showToken?'text':'password', value:token, onChange:e=>setToken(e.target.value), placeholder:'Вставьте ключ…' }),
          React.createElement('button', { onClick:()=>setShowToken(s=>!s), style:{ position:'absolute', right:10, bottom:10, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' } },
            React.createElement(Icon, { name: showToken?'eyeOff':'eye', size:17 })
          )
        ),
        React.createElement('div', { style:{ display:'flex', gap:10, alignItems:'center' } },
          React.createElement(Button, { variant:'secondary', onClick:testConnection, disabled:testing, icon:'refresh' }, testing ? 'Проверяем…' : 'Проверить подключение'),
          testStatus === 'ok' && React.createElement(Badge, { variant:'success' }, '✓ Подключено'),
          testStatus === 'error' && React.createElement(Badge, { variant:'danger' }, '✕ Ошибка подключения')
        ),
        React.createElement(Button, { onClick:addToken }, 'Добавить токен')
      )
    ),

    React.createElement(Card, { style:{ padding:0, overflow:'hidden' } },
      React.createElement('div', { style:{ padding:'16px 20px', borderBottom:'1px solid var(--border)' } },
        React.createElement('h3', { style:{ fontSize:15, fontWeight:700, margin:0 } }, 'Подключённые кабинеты')
      ),
      React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' } },
        React.createElement('thead', null,
          React.createElement('tr', { style:{ background:'var(--bg-base)' } },
            ['Маркетплейс','Кабинет','Статус','Срок действия','Действия'].map(h =>
              React.createElement('th', { key:h, style:{ padding:'10px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)', textTransform:'uppercase', letterSpacing:.4 } }, h)
            )
          )
        ),
        React.createElement('tbody', null,
          connected.map(r =>
            React.createElement('tr', { key:r.id,
              onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 5%, transparent)',
              onMouseLeave:e=>e.currentTarget.style.background='transparent',
            },
              React.createElement('td', { style:{ padding:'12px 16px', fontSize:14, fontWeight:600, borderBottom:'1px solid var(--border)' } }, r.mp),
              React.createElement('td', { style:{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)', borderBottom:'1px solid var(--border)' } }, r.cabinet),
              React.createElement('td', { style:{ padding:'12px 16px', borderBottom:'1px solid var(--border)' } },
                React.createElement(Badge, { variant: r.status==='connected'?'success':'danger' }, r.status==='connected'?'Активен':'Ошибка')
              ),
              React.createElement('td', { style:{ padding:'12px 16px', fontSize:13, borderBottom:'1px solid var(--border)', color: r.status==='error'?'var(--negative)':'var(--text-secondary)' } }, r.expires),
              React.createElement('td', { style:{ padding:'12px 16px', borderBottom:'1px solid var(--border)' } },
                React.createElement('div', { style:{ display:'flex', gap:8 } },
                  React.createElement(Button, { size:'sm', variant:'secondary', icon:'refresh', onClick:()=>toast('Токен обновлён','success') }, 'Обновить'),
                  React.createElement(Button, { size:'sm', variant:'secondary', icon:'trash', onClick:()=>toast('Кабинет удалён','success') }, '')
                )
              )
            )
          )
        )
      )
    )
  );
}

function SettingsNorms() {
  const toast = useToast();
  const [norms, setNorms] = React.useState(NORMS.map(n=>({...n})));
  function update(id, val) { setNorms(ns => ns.map(n => n.id===id ? {...n,norm:Number(val)||0} : n)); }

  return React.createElement('div', { style:{ maxWidth:600 } },
    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:6 } }, 'Нормы по показателям'),
      React.createElement('p', { style:{ fontSize:13, color:'var(--text-secondary)', marginBottom:20, marginTop:0 } }, 'Задайте допустимые % расходов от выручки. Превышение будет подсвечено на дашборде.'),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:0 } },
        norms.map((n,i) =>
          React.createElement('div', { key:n.id, style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom: i<norms.length-1?'1px solid var(--border)':'none' } },
            React.createElement('div', null,
              React.createElement('div', { style:{ fontSize:14, fontWeight:500 } }, n.label),
              React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, 'Факт: ' + n.fact + '% · Отклонение: ' + (n.fact - n.norm > 0 ? '+' : '') + (n.fact - n.norm).toFixed(1) + '%')
            ),
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
              React.createElement('input', { type:'number', value:n.norm, onChange:e=>update(n.id,e.target.value), min:0, max:100,
                style:{ width:80, padding:'8px 10px', textAlign:'right', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, fontFamily:'inherit' }
              }),
              React.createElement('span', { style:{ color:'var(--text-secondary)', fontSize:14 } }, '%')
            )
          )
        )
      ),
      React.createElement('div', { style:{ marginTop:24 } },
        React.createElement(Button, { onClick:()=>toast('Нормы сохранены','success') }, 'Сохранить нормы')
      )
    )
  );
}

function SettingsNotifications() {
  const toast = useToast();
  const [channels, setChannels] = React.useState({ email:true, push:false });
  const [events, setEvents] = React.useState({
    negativeMargин: true, highExpense: true, tokenExpire: true, dataError: false,
  });
  const eventLabels = [
    { id:'negativeMargин', label:'Отрицательная маржа', desc:'Уведомление при марже ниже 0%' },
    { id:'highExpense', label:'Рост расходов выше нормы', desc:'Когда факт превышает норму' },
    { id:'tokenExpire', label:'Истечение API-токена', desc:'За 7 дней до окончания' },
    { id:'dataError', label:'Ошибка загрузки данных', desc:'При сбое синхронизации' },
  ];

  return React.createElement('div', { style:{ maxWidth:600, display:'flex', flexDirection:'column', gap:20 } },
    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Каналы уведомлений'),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
        React.createElement(Toggle, { checked:channels.email, onChange:v=>setChannels(c=>({...c,email:v})), label:'Email — anna@store.ru' }),
        React.createElement(Toggle, { checked:channels.push, onChange:v=>setChannels(c=>({...c,push:v})), label:'Push-уведомления (браузер)' })
      )
    ),
    React.createElement(Card, null,
      React.createElement('h3', { style:{ fontSize:16, fontWeight:700, marginTop:0, marginBottom:20 } }, 'Типы событий'),
      React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:0 } },
        eventLabels.map((ev,i) =>
          React.createElement('div', { key:ev.id, style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom: i<eventLabels.length-1?'1px solid var(--border)':'none' } },
            React.createElement('div', null,
              React.createElement('div', { style:{ fontSize:14, fontWeight:500 } }, ev.label),
              React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, ev.desc)
            ),
            React.createElement('input', { type:'checkbox', checked:events[ev.id], onChange:e=>setEvents(v=>({...v,[ev.id]:e.target.checked})),
              style:{ width:18, height:18, accentColor:'var(--accent)', cursor:'pointer' }
            })
          )
        )
      )
    ),
    React.createElement(Button, { onClick:()=>toast('Настройки уведомлений сохранены','success') }, 'Сохранить')
  );
}

Object.assign(window, { SettingsProfile, SettingsAPI, SettingsNorms, SettingsNotifications });
