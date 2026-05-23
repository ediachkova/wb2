
// ── Help: floating FAB + support modal + onboarding tour ────────────────────

const TOUR_STEPS = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Навигация',
    body: 'Все разделы Wild Profit здесь: дашборд, отчёты, справочники, реестры, настройки. Кликните на пункт со стрелкой, чтобы развернуть подразделы.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Главный дашборд',
    body: 'Сводка по бизнесу: выручка, прибыль, маржа, ROAS. Здесь же — топ номенклатуры, критичные точки и графики динамики.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-reports"]',
    title: 'Отчёты',
    body: 'Анализ по номенклатурам с подсветкой критичных показателей, разбивкой по размерам, AI-рекомендациями. Плюс P&L и отчёт по неделям.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-directories"]',
    title: 'Справочники',
    body: 'Номенклатура товаров, связки карточек между маркетплейсами (WB / Ozon / ЯМ), статьи расходов, себестоимость по поставкам и периодам.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-registers"]',
    title: 'Реестры операций',
    body: 'Все приходы и расходы в одном месте. Импорт из Excel или ручной ввод. Расходы автоматически попадают в P&L.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Настройки',
    body: 'Подключите API-токены маркетплейсов, задайте нормы по статьям расходов, настройте уведомления о критичных событиях.',
    placement: 'right',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Тёмная тема',
    body: 'Переключайте оформление в одно касание. Выбор запоминается.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="help-fab"]',
    title: 'Помощь',
    body: 'Из этой кнопки можно перезапустить обучение, открыть базу знаний или связаться с поддержкой. Готово, желаем продуктивной работы!',
    placement: 'left',
  },
];

function TourOverlay({ onClose }) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [rect, setRect] = React.useState(null);
  const step = TOUR_STEPS[stepIdx];

  React.useEffect(() => {
    const update = () => {
      const el = document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else { setRect(null); }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [stepIdx]);

  React.useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setStepIdx(i => Math.min(TOUR_STEPS.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setStepIdx(i => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  function finish() {
    try { localStorage.setItem('wp-tour-done', '1'); } catch(e){}
    onClose();
  }

  // Tooltip position with viewport bounds clamping
  const pad = 14;
  const tooltipW = 340;
  const tooltipH = 280;
  let tipStyle = { top: 80, left: 80 };
  if (rect) {
    let top, left;
    if (step.placement === 'right') {
      top = rect.top;
      left = rect.left + rect.width + pad;
    } else if (step.placement === 'left') {
      top = rect.top;
      left = rect.left - tooltipW - pad;
    } else if (step.placement === 'bottom') {
      top = rect.top + rect.height + pad;
      left = rect.left - 150;
    }
    // Clamp to viewport
    const maxTop = window.innerHeight - tooltipH - 20;
    const maxLeft = window.innerWidth - tooltipW - 20;
    top = Math.min(Math.max(20, top), Math.max(20, maxTop));
    left = Math.min(Math.max(20, left), Math.max(20, maxLeft));
    tipStyle = { top, left };
  }

  const isLast = stepIdx === TOUR_STEPS.length - 1;

  return React.createElement('div', { style:{ position:'fixed', inset:0, zIndex:1500, pointerEvents:'none' } },
    // Dim overlay with cutout via box-shadow
    rect && React.createElement('div', {
      style: {
        position:'fixed', top: rect.top - 6, left: rect.left - 6,
        width: rect.width + 12, height: rect.height + 12, borderRadius:10,
        boxShadow:'0 0 0 9999px rgba(0,0,0,0.62)',
        pointerEvents:'auto', transition:'all .25s cubic-bezier(.4,0,.2,1)',
        border:'2px solid var(--accent)',
      },
      onClick: e => e.stopPropagation(),
    }),
    !rect && React.createElement('div', { style:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.62)' } }),
    // Tooltip card
    React.createElement('div', {
      style: { position:'fixed', ...tipStyle, width:340, maxWidth:'calc(100vw - 40px)', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 12px 40px rgba(0,0,0,0.30)', pointerEvents:'auto', animation:'modalIn .2s ease' }
    },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 } },
        React.createElement('div', { style:{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:.6 } }, `Шаг ${stepIdx + 1} из ${TOUR_STEPS.length}`),
        React.createElement('button', { onClick:finish, style:{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:12, fontFamily:'inherit', padding:4 } }, 'Пропустить')
      ),
      React.createElement('h3', { style:{ fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:'4px 0 8px' } }, step.title),
      React.createElement('p', { style:{ fontSize:13, color:'var(--text-secondary)', margin:0, lineHeight:1.55 } }, step.body),
      // Progress dots
      React.createElement('div', { style:{ display:'flex', gap:5, marginTop:16, marginBottom:16 } },
        TOUR_STEPS.map((_, i) =>
          React.createElement('div', { key:i, style:{ width: i === stepIdx ? 20 : 6, height:6, borderRadius:3, background: i <= stepIdx ? 'var(--accent)' : 'var(--border)', transition:'width .2s' } })
        )
      ),
      React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', gap:8 } },
        React.createElement(Button, { variant:'secondary', size:'sm', onClick:()=>setStepIdx(i=>Math.max(0,i-1)), disabled: stepIdx === 0 }, '← Назад'),
        isLast
          ? React.createElement(Button, { size:'sm', onClick: finish, icon:'check' }, 'Завершить')
          : React.createElement(Button, { size:'sm', onClick:()=>setStepIdx(i=>i+1) }, 'Далее →')
      )
    )
  );
}

function SupportModal({ open, onClose }) {
  const toast = useToast();
  const [form, setForm] = React.useState({ subject:'', topic:'question', message:'', email:'anna@store.ru' });
  const [sent, setSent] = React.useState(false);

  function send() {
    if (!form.subject || !form.message) { toast('Заполните тему и сообщение','error'); return; }
    setSent(true);
    setTimeout(() => { onClose(); setSent(false); setForm({ subject:'', topic:'question', message:'', email:'anna@store.ru' }); toast('Обращение отправлено. Ответим в течение 2 часов.','success'); }, 1200);
  }

  if (!open) return null;
  return React.createElement(Modal, { open, onClose, title:'Обращение в поддержку', width:520 },
    sent
      ? React.createElement('div', { style:{ textAlign:'center', padding:'20px 0' } },
          React.createElement('div', { style:{ width:60, height:60, borderRadius:'50%', background:'color-mix(in srgb, var(--positive) 18%, transparent)', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' } },
            React.createElement(Icon, { name:'check', size:32, color:'var(--positive)' })
          ),
          React.createElement('h3', { style:{ margin:0, fontSize:16, fontWeight:700 } }, 'Отправляем…')
        )
      : React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:14 } },
          React.createElement('div', { style:{ display:'flex', gap:10, padding:'12px 14px', background:'color-mix(in srgb, var(--accent) 8%, transparent)', borderRadius:10 } },
            React.createElement(Icon, { name:'info', size:16, color:'var(--accent)', style:{ marginTop:1, flexShrink:0 } }),
            React.createElement('span', { style:{ fontSize:13, color:'var(--text-primary)', lineHeight:1.55 } },
              'Среднее время ответа — ', React.createElement('b', null, '2 часа'), ' в рабочее время (Пн-Пт 9-19 МСК). Срочные вопросы — Telegram: ',
              React.createElement('a', { href:'#', style:{ color:'var(--accent)', fontWeight:600 } }, '@wildprofit_support')
            )
          ),
          React.createElement(Select, { label:'Тип обращения', value:form.topic, onChange:e=>setForm(f=>({...f,topic:e.target.value})),
            options:[
              {value:'question', label:'Вопрос по работе системы'},
              {value:'bug',      label:'Сообщение об ошибке'},
              {value:'feature',  label:'Предложение по улучшению'},
              {value:'data',     label:'Проблема с данными / синхронизацией'},
              {value:'billing',  label:'Оплата и тарифы'},
            ]
          }),
          React.createElement(Input, { label:'Тема', value:form.subject, onChange:e=>setForm(f=>({...f,subject:e.target.value})), placeholder:'Кратко опишите вопрос' }),
          React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:5 } },
            React.createElement('label', { style:{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' } }, 'Сообщение'),
            React.createElement('textarea', { value:form.message, onChange:e=>setForm(f=>({...f,message:e.target.value})), rows:5, placeholder:'Расскажите подробнее: что произошло, какие действия пытались выполнить, какой ожидался результат…',
              style:{ width:'100%', padding:'10px 12px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', outline:'none' }
            })
          ),
          React.createElement(Input, { label:'Email для ответа', type:'email', value:form.email, onChange:e=>setForm(f=>({...f,email:e.target.value})) }),
          React.createElement('div', { style:{ padding:'10px 14px', background:'var(--bg-base)', borderRadius:8, fontSize:12, color:'var(--text-secondary)' } },
            'К обращению автоматически прикрепляются: версия приложения, ваш кабинет, список подключённых маркетплейсов.'
          ),
          React.createElement('div', { style:{ display:'flex', justifyContent:'flex-end', gap:10 } },
            React.createElement(Button, { variant:'secondary', onClick:onClose }, 'Отмена'),
            React.createElement(Button, { onClick:send, icon:'check' }, 'Отправить обращение')
          )
        )
  );
}

function KnowledgeBaseModal({ open, onClose }) {
  if (!open) return null;
  const topics = [
    { icon:'key',      title:'Подключение маркетплейсов',   desc:'Как получить API-токен WB / Ozon / ЯМ и подключить кабинет' },
    { icon:'database', title:'Связка карточек между МП',     desc:'Объединение SKU в мастер-карточку для общей аналитики' },
    { icon:'package',  title:'Загрузка себестоимости',       desc:'По поставке и по периоду — что выбрать и когда' },
    { icon:'chart',    title:'P&L: как читать',              desc:'Структура отчёта, методология расчёта EBITDA' },
    { icon:'info',     title:'Паттерны выделения',           desc:'Что означают цвета в отчётах: критично / терпимо / норма' },
    { icon:'settings', title:'Нормы по показателям',          desc:'Настройка допустимых % расходов и алертов' },
  ];
  return React.createElement(Modal, { open, onClose, title:'База знаний', width:560 },
    React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
      topics.map(t =>
        React.createElement('div', { key:t.title,
          style:{ display:'flex', gap:14, padding:'14px 16px', borderRadius:10, background:'var(--bg-base)', cursor:'pointer', transition:'background .12s' },
          onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 8%, transparent)',
          onMouseLeave:e=>e.currentTarget.style.background='var(--bg-base)'
        },
          React.createElement('div', { style:{ width:38, height:38, borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
            React.createElement(Icon, { name:t.icon, size:18, color:'var(--accent)' })
          ),
          React.createElement('div', { style:{ flex:1, minWidth:0 } },
            React.createElement('div', { style:{ fontSize:14, fontWeight:600, color:'var(--text-primary)' } }, t.title),
            React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, t.desc)
          ),
          React.createElement(Icon, { name:'chevronRight', size:14, color:'var(--text-secondary)' })
        )
      ),
      React.createElement('div', { style:{ marginTop:8, padding:'14px 16px', textAlign:'center', borderTop:'1px solid var(--border)', fontSize:13, color:'var(--text-secondary)' } },
        'Не нашли ответ? ',
        React.createElement('a', { href:'#', style:{ color:'var(--accent)', fontWeight:600 } }, 'Полная база знаний'), ' · ',
        React.createElement('a', { href:'#', style:{ color:'var(--accent)', fontWeight:600 } }, 'Видео-уроки')
      )
    )
  );
}

function HelpFab() {
  const [open, setOpen] = React.useState(false);
  const [tour, setTour] = React.useState(false);
  const [support, setSupport] = React.useState(false);

  // Auto-launch tour for first-time users
  React.useEffect(() => {
    try {
      if (!localStorage.getItem('wp-tour-done')) {
        setTimeout(() => setTour(true), 700);
      }
    } catch(e){}
  }, []);

  function startTour() { setOpen(false); setTour(true); }
  function openSupport() { setOpen(false); setSupport(true); }

  const menuItems = [
    { icon:'info', label:'Запустить обучение', sub:'8 шагов, ~1 мин', action: startTour, color:'var(--accent)' },
    { icon:'bell', label:'Связаться с поддержкой', sub:'Ответ в течение 2 часов', action: openSupport, color:'var(--warning)' },
  ];

  return React.createElement(React.Fragment, null,
    React.createElement('button', {
      'data-tour':'help-fab',
      onClick: () => setOpen(o => !o),
      style:{
        position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%',
        background: open ? 'var(--text-primary)' : 'var(--accent)', color:'#fff', border:'none', cursor:'pointer',
        boxShadow:'0 6px 24px rgba(0,0,0,0.22)', display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:900, transition:'all .2s', fontSize:24, fontFamily:'inherit',
      }
    },
      open ? React.createElement(Icon, { name:'x', size:22, color:'#fff' }) : '?'
    ),
    open && React.createElement('div', {
      style:{ position:'fixed', bottom:92, right:24, width:300, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:12, boxShadow:'0 12px 40px rgba(0,0,0,0.22)', zIndex:899, animation:'modalIn .15s ease' }
    },
      React.createElement('div', { style:{ padding:'8px 10px 12px', borderBottom:'1px solid var(--border)', marginBottom:8 } },
        React.createElement('div', { style:{ fontSize:15, fontWeight:700, color:'var(--text-primary)' } }, 'Помощь'),
        React.createElement('div', { style:{ fontSize:12, color:'var(--text-secondary)', marginTop:2 } }, 'Чем мы можем помочь?')
      ),
      menuItems.map(it =>
        React.createElement('button', { key:it.label, onClick:it.action,
          style:{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 10px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', textAlign:'left' },
          onMouseEnter:e=>e.currentTarget.style.background='color-mix(in srgb, var(--accent) 8%, transparent)',
          onMouseLeave:e=>e.currentTarget.style.background='transparent'
        },
          React.createElement('div', { style:{ width:36, height:36, borderRadius:8, background:`color-mix(in srgb, ${it.color} 16%, transparent)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
            React.createElement(Icon, { name:it.icon, size:17, color: it.color })
          ),
          React.createElement('div', { style:{ flex:1, minWidth:0 } },
            React.createElement('div', { style:{ fontSize:13, fontWeight:600, color:'var(--text-primary)' } }, it.label),
            React.createElement('div', { style:{ fontSize:11, color:'var(--text-secondary)', marginTop:1 } }, it.sub)
          )
        )
      ),
      React.createElement('div', { style:{ marginTop:6, padding:'8px 10px', fontSize:11, color:'var(--text-secondary)', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' } },
        React.createElement('span', null, 'v1.4.2 · build 2026.05'),
        React.createElement('a', { href:'#', style:{ color:'var(--accent)' } }, 'Changelog')
      )
    ),
    tour && React.createElement(TourOverlay, { onClose: () => setTour(false) }),
    React.createElement(SupportModal, { open: support, onClose: () => setSupport(false) })
  );
}

Object.assign(window, { HelpFab });
