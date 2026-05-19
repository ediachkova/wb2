
// ── Auth Pages ────────────────────────────────────────────────────────────────

function AuthLayout({ children }) {
  const { theme, toggle } = useTheme();
  return React.createElement('div', {
    style:{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }
  },
    React.createElement('button', {
      onClick:toggle, style:{ position:'fixed', top:20, right:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }
    }, React.createElement(Icon, { name: theme==='dark'?'sun':'moon', size:18 })),
    React.createElement('div', { style:{ width:'100%', maxWidth:420 } },
      React.createElement('div', { style:{ textAlign:'center', marginBottom:32 } },
        React.createElement('div', { style:{ width:44, height:44, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' } },
          React.createElement(Icon, { name:'trendingUp', size:24, color:'#fff' })
        ),
        React.createElement('h1', { style:{ fontSize:24, fontWeight:800, color:'var(--text-primary)', margin:0 } }, 'Wild Profit'),
        React.createElement('p', { style:{ fontSize:14, color:'var(--text-secondary)', marginTop:6 } }, 'Аналитика для маркетплейсов')
      ),
      children
    )
  );
}

function LoginPage({ setPage }) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resetMode, setResetMode] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);

  function login(e) {
    e.preventDefault();
    if (!email || !pw) { setError('Заполните все поля'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      setLoading(false);
      if (email === 'demo@wildprofit.ru' && pw === 'demo1234') { setPage('dashboard'); }
      else setError('Неверный email или пароль');
    }, 1000);
  }

  function sendReset(e) {
    e.preventDefault();
    setResetSent(true);
  }

  return React.createElement(AuthLayout, null,
    React.createElement(Card, null,
      React.createElement('h2', { style:{ fontSize:20, fontWeight:700, marginTop:0, marginBottom:24, color:'var(--text-primary)' } }, 'Вход в систему'),
      error && React.createElement('div', { style:{ marginBottom:16 } }, React.createElement(Alert, { type:'error' }, error)),
      React.createElement('form', { onSubmit:login, style:{ display:'flex', flexDirection:'column', gap:14 } },
        React.createElement(Input, { label:'Email', type:'email', value:email, onChange:e=>setEmail(e.target.value), placeholder:'demo@wildprofit.ru' }),
        React.createElement(Input, { label:'Пароль', type:'password', value:pw, onChange:e=>setPw(e.target.value), placeholder:'••••••••' }),
        React.createElement('div', { style:{ textAlign:'right' } },
          React.createElement('button', { type:'button', onClick:()=>setResetMode(r=>!r), style:{ background:'none', border:'none', color:'var(--accent)', fontSize:13, cursor:'pointer', fontFamily:'inherit' } }, 'Забыли пароль?')
        ),
        resetMode && !resetSent && React.createElement('div', { style:{ background:'var(--bg-base)', borderRadius:10, padding:14, display:'flex', flexDirection:'column', gap:10 } },
          React.createElement('p', { style:{ margin:'0 0 8px', fontSize:13, color:'var(--text-secondary)' } }, 'Введите email для сброса пароля:'),
          React.createElement(Input, { type:'email', value:resetEmail, onChange:e=>setResetEmail(e.target.value), placeholder:'email@example.com' }),
          React.createElement(Button, { onClick:sendReset, size:'sm' }, 'Отправить ссылку')
        ),
        resetSent && React.createElement(Alert, { type:'success' }, 'Ссылка для сброса пароля отправлена на ' + resetEmail),
        React.createElement('button', { type:'submit', disabled:loading,
          style:{ padding:'11px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor: loading?'not-allowed':'pointer', opacity: loading?.7:1, fontFamily:'inherit', marginTop:4 }
        }, loading ? 'Входим…' : 'Войти'),
        React.createElement('p', { style:{ textAlign:'center', fontSize:13, color:'var(--text-secondary)', marginTop:4 } },
          'Нет аккаунта? ',
          React.createElement('button', { type:'button', onClick:()=>setPage('register'), style:{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:13 } }, 'Зарегистрироваться')
        )
      ),
      React.createElement('div', { style:{ marginTop:16, padding:'10px 14px', background:'var(--bg-base)', borderRadius:8, fontSize:12, color:'var(--text-secondary)', textAlign:'center' } },
        'Демо-вход: demo@wildprofit.ru / demo1234'
      )
    )
  );
}

function RegisterPage({ setPage }) {
  const [form, setForm] = React.useState({ email:'', pw:'', pw2:'', agree:false });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  function validate() {
    const e = {};
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Некорректный email';
    if (form.pw.length < 8) e.pw = 'Минимум 8 символов';
    if (form.pw !== form.pw2) e.pw2 = 'Пароли не совпадают';
    if (!form.agree) e.agree = 'Необходимо согласие';
    return e;
  }

  function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); setPage('dashboard'); }, 1200);
  }

  return React.createElement(AuthLayout, null,
    React.createElement(Card, null,
      React.createElement('h2', { style:{ fontSize:20, fontWeight:700, marginTop:0, marginBottom:24 } }, 'Создать аккаунт'),
      React.createElement('form', { onSubmit:submit, style:{ display:'flex', flexDirection:'column', gap:14 } },
        React.createElement(Input, { label:'Email', type:'email', value:form.email, onChange:e=>setForm(f=>({...f,email:e.target.value})), placeholder:'you@company.ru', error:errors.email }),
        React.createElement(Input, { label:'Пароль', type:'password', value:form.pw, onChange:e=>setForm(f=>({...f,pw:e.target.value})), placeholder:'Минимум 8 символов', error:errors.pw }),
        React.createElement(Input, { label:'Подтверждение пароля', type:'password', value:form.pw2, onChange:e=>setForm(f=>({...f,pw2:e.target.value})), placeholder:'Повторите пароль', error:errors.pw2 }),
        React.createElement('label', { style:{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' } },
          React.createElement('input', { type:'checkbox', checked:form.agree, onChange:e=>setForm(f=>({...f,agree:e.target.checked})), style:{ marginTop:2, accentColor:'var(--accent)', width:16, height:16, cursor:'pointer', flexShrink:0 } }),
          React.createElement('span', { style:{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 } },
            'Я принимаю ',
            React.createElement('a', { href:'#', style:{ color:'var(--accent)' } }, 'условия использования'),
            ' и ',
            React.createElement('a', { href:'#', style:{ color:'var(--accent)' } }, 'политику конфиденциальности')
          )
        ),
        errors.agree && React.createElement('span', { style:{ fontSize:12, color:'var(--negative)' } }, errors.agree),
        React.createElement('button', { type:'submit', disabled:loading,
          style:{ padding:'11px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor: loading?'not-allowed':'pointer', opacity:loading?.7:1, fontFamily:'inherit', marginTop:4 }
        }, loading ? 'Создаём аккаунт…' : 'Создать аккаунт'),
        React.createElement('p', { style:{ textAlign:'center', fontSize:13, color:'var(--text-secondary)', marginTop:4 } },
          'Уже есть аккаунт? ',
          React.createElement('button', { type:'button', onClick:()=>setPage('login'), style:{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:13 } }, 'Войти')
        )
      )
    )
  );
}

Object.assign(window, { LoginPage, RegisterPage });
