
// ── Shared: ThemeContext, Icons, UI primitives, Mock data ──────────────────

const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('wp-theme') || 'light');
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('wp-theme', theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return React.createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

function useTheme() { return React.useContext(ThemeContext); }

// ── Toast ────────────────────────────────────────────────────────────────────
const ToastContext = React.createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const addToast = React.useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return React.createElement(ToastContext.Provider, { value: addToast },
    children,
    React.createElement('div', { style: { position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 } },
      toasts.map(t => React.createElement('div', {
        key: t.id,
        style: {
          background: t.type === 'error' ? 'var(--negative)' : t.type === 'warning' ? 'var(--warning)' : 'var(--positive)',
          color: '#fff', padding:'12px 20px', borderRadius:10, fontSize:14,
          boxShadow:'0 4px 16px rgba(0,0,0,0.15)', animation:'slideUp .25s ease',
          display:'flex', alignItems:'center', gap:10, minWidth:260
        }
      }, React.createElement('span', null, t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '⚠'), t.msg))
    )
  );
}

function useToast() { return React.useContext(ToastContext); }

// ── Icons (inline SVG) ───────────────────────────────────────────────────────
const ICONS = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  chart: 'M5 3v16h16v2H3V3h2zm14.293 2.293 1.414 1.414L16 11.414l-3-3-4.707 4.707-1.414-1.414L13 5.586l3 3 3.293-3.293z',
  folder: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  clipboard: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  user: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z',
  sun: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z',
  moon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
  chevronDown: 'M7 10l5 5 5-5z',
  chevronRight: 'M10 17l5-5-5-5v10z',
  chevronUp: 'M7 14l5-5 5 5z',
  arrowUp: 'M7 14l5-5 5 5H7z',
  arrowDown: 'M7 10l5 5 5-5H7z',
  search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  eyeOff: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  x: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  upload: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  filter: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
  key: 'M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  alertTriangle: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  trendingUp: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  trendingDown: 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
  package: 'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V8h14v11H5zm8.45-9l-3.45 3.44-1.45-1.44-1.55 1.55 3 3 5-5z',
  database: 'M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.59 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm6 13.68c-.46.45-2.37 1.32-6 1.32s-5.54-.87-6-1.32V15.1c1.26.69 3.28 1.1 6 1.1s4.74-.41 6-1.1v1.58zm0-4c-.46.45-2.37 1.32-6 1.32s-5.54-.87-6-1.32v-1.58c1.26.69 3.28 1.1 6 1.1s4.74-.41 6-1.1v1.58zm-6-2.58c-3.63 0-5.54-.87-6-1.32V7.32C7.46 7.77 9.37 8.1 12 8.1s4.54-.33 6-1.1v1.78c-.46.45-2.37 1.32-6 1.32z',
};

function Icon({ name, size = 20, color, style = {} }) {
  const d = ICONS[name];
  if (!d) return null;
  return React.createElement('svg', {
    viewBox:'0 0 24 24', width:size, height:size,
    fill: color || 'currentColor', style:{ flexShrink:0, ...style }
  }, React.createElement('path', { d }));
}

// ── UI Primitives ────────────────────────────────────────────────────────────
function Badge({ children, variant = 'default', style: extraStyle = {} }) {
  const colors = {
    default: { background:'var(--accent)', color:'#fff' },
    success: { background:'color-mix(in srgb, var(--positive) 15%, transparent)', color:'var(--positive)' },
    danger: { background:'color-mix(in srgb, var(--negative) 15%, transparent)', color:'var(--negative)' },
    warning: { background:'color-mix(in srgb, var(--warning) 15%, transparent)', color:'var(--warning)' },
    neutral: { background:'var(--border)', color:'var(--text-secondary)' },
  };
  return React.createElement('span', {
    style: { ...colors[variant], padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap', ...extraStyle }
  }, children);
}

function Button({ children, variant = 'primary', size = 'md', onClick, disabled, style: ex = {}, icon }) {
  const base = { display:'inline-flex', alignItems:'center', gap:6, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', border:'none', borderRadius:8, transition:'all .15s', opacity: disabled ? .6 : 1, fontFamily:'inherit', whiteSpace:'nowrap' };
  const sizes = { sm: { padding:'6px 12px', fontSize:13 }, md: { padding:'9px 18px', fontSize:14 }, lg: { padding:'12px 24px', fontSize:15 } };
  const variants = {
    primary: { background:'var(--accent)', color:'#fff' },
    secondary: { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border)' },
    ghost: { background:'transparent', color:'var(--text-secondary)', border:'none' },
    danger: { background:'var(--negative)', color:'#fff' },
  };
  return React.createElement('button', { onClick, disabled, style:{ ...base, ...sizes[size], ...variants[variant], ...ex } },
    icon && React.createElement(Icon, { name:icon, size:15 }),
    children
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, error, suffix, prefix, style: ex = {}, ...props }) {
  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:5 } },
    label && React.createElement('label', { style:{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' } }, label),
    React.createElement('div', { style:{ position:'relative', display:'flex', alignItems:'center' } },
      prefix && React.createElement('span', { style:{ position:'absolute', left:12, color:'var(--text-secondary)', fontSize:14, pointerEvents:'none' } }, prefix),
      React.createElement('input', {
        type, value, onChange, placeholder, ...props,
        style: {
          width:'100%', height:40, padding: `0 ${suffix ? 40 : 12}px 0 ${prefix ? 36 : 12}px`,
          background:'var(--bg-card)', border:'1px solid ' + (error ? 'var(--negative)' : 'var(--border)'),
          borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none', boxSizing:'border-box',
          fontFamily:'inherit', ...ex
        }
      }),
      suffix && React.createElement('span', { style:{ position:'absolute', right:12, color:'var(--text-secondary)', fontSize:13, pointerEvents:'none' } }, suffix)
    ),
    error && React.createElement('span', { style:{ fontSize:12, color:'var(--negative)' } }, error)
  );
}

function Select({ label, value, onChange, options = [], style: ex = {} }) {
  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:5 } },
    label && React.createElement('label', { style:{ fontSize:13, fontWeight:500, color:'var(--text-secondary)' } }, label),
    React.createElement('select', {
      value, onChange,
      style: { height:40, padding:'0 32px 0 12px', appearance:'none', WebkitAppearance:'none', MozAppearance:'none', backgroundColor:'var(--bg-card)', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%236B7A99' d='M0 0l5 6 5-6z'/></svg>")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none', fontFamily:'inherit', cursor:'pointer', ...ex }
    }, options.map(o => React.createElement('option', { key: o.value ?? o, value: o.value ?? o }, o.label ?? o)))
  );
}

function Toggle({ checked, onChange, label }) {
  return React.createElement('label', { style:{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' } },
    React.createElement('div', {
      onClick: () => onChange(!checked),
      style: { width:40, height:22, borderRadius:11, background: checked ? 'var(--accent)' : 'var(--border)', position:'relative', transition:'background .2s', cursor:'pointer', flexShrink:0 }
    },
      React.createElement('div', { style:{ position:'absolute', top:3, left: checked ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' } })
    ),
    label && React.createElement('span', { style:{ fontSize:14, color:'var(--text-primary)' } }, label)
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return React.createElement('div', {
    style: { position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 },
    onClick: onClose
  },
    React.createElement('div', {
      onClick: e => e.stopPropagation(),
      style: { background:'var(--bg-card)', borderRadius:14, padding:28, width, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.25)', animation:'modalIn .2s ease' }
    },
      React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 } },
        React.createElement('h2', { style:{ fontSize:18, fontWeight:700, color:'var(--text-primary)', margin:0 } }, title),
        React.createElement('button', { onClick:onClose, style:{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:4 } }, React.createElement(Icon, { name:'x', size:20 }))
      ),
      children
    )
  );
}

function Card({ children, style: ex = {}, className }) {
  return React.createElement('div', {
    className,
    style: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, ...ex }
  }, children);
}

function SortableHeader({ label, column, sortCol, sortDir, onSort, align = 'left', borderLeft = false, highlight = false }) {
  const active = sortCol === column;
  return React.createElement('th', {
    onClick: () => onSort(column),
    style: { padding:'10px 14px', fontSize:12, fontWeight:600, color: highlight ? 'var(--accent)' : 'var(--text-secondary)', textTransform:'uppercase', letterSpacing:.4, cursor:'pointer', userSelect:'none', textAlign:align, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', borderLeft: borderLeft ? '3px solid color-mix(in srgb, var(--text-secondary) 30%, var(--border))' : undefined }
  },
    React.createElement('span', { style:{ display:'inline-flex', alignItems:'center', gap:4 } },
      label,
      active && React.createElement(Icon, { name: sortDir === 'asc' ? 'chevronUp' : 'chevronDown', size:14 })
    )
  );
}

function Skeleton({ width = '100%', height = 16, style: ex = {} }) {
  return React.createElement('div', { style:{ width, height, borderRadius:6, background:'var(--border)', animation:'pulse 1.4s ease infinite', ...ex } });
}

function Alert({ type = 'warning', title, children, action }) {
  const cfg = {
    warning: { bg:'color-mix(in srgb, var(--warning) 12%, transparent)', border:'var(--warning)', icon:'alertTriangle', color:'var(--warning)' },
    error: { bg:'color-mix(in srgb, var(--negative) 12%, transparent)', border:'var(--negative)', icon:'alertTriangle', color:'var(--negative)' },
    info: { bg:'color-mix(in srgb, var(--accent) 12%, transparent)', border:'var(--accent)', icon:'info', color:'var(--accent)' },
    success: { bg:'color-mix(in srgb, var(--positive) 12%, transparent)', border:'var(--positive)', icon:'check', color:'var(--positive)' },
  };
  const c = cfg[type];
  return React.createElement('div', { style:{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:12 } },
    React.createElement(Icon, { name:c.icon, size:18, color:c.color, style:{ marginTop:1, flexShrink:0 } }),
    React.createElement('div', { style:{ flex:1 } },
      title && React.createElement('div', { style:{ fontWeight:600, color:'var(--text-primary)', marginBottom:3 } }, title),
      React.createElement('div', { style:{ fontSize:14, color:'var(--text-secondary)' } }, children)
    ),
    action
  );
}

// ── Formatters ───────────────────────────────────────────────────────────────
function fmtRub(n) {
  if (n == null) return '—';
  const abs = Math.abs(n);
  const s = abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return (n < 0 ? '−' : '') + '₽\u00A0' + s;
}
function fmtPct(n, decimals = 1) { if (n == null) return '—'; return (n >= 0 ? '' : '−') + Math.abs(n).toFixed(decimals) + '%'; }
function fmtNum(n) { if (n == null) return '—'; return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); }
function marginColor(v) { return v > 0 ? 'var(--positive)' : v < 0 ? 'var(--negative)' : 'var(--text-secondary)'; }

// ── Mock Data ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:1, sku:'WP-0041', mpSku:'12345678', name:'Носки махровые мужские 40-46', cat:'Одежда', brand:'СокоТекс', status:'active', margin:18.4, sales:1240, salesRub:892000, returns:62, cost:410000, opex:180000, marginRub:302000, logistics:8.2, storage:3.1, ads:4.5, commission:11.2, acceptance:1.1, marginUnit:244 },
  { id:2, sku:'WP-0042', mpSku:'12345679', name:'Футболка базовая унисекс XS-XL', cat:'Одежда', brand:'StyleBase', status:'active', margin:22.1, sales:890, salesRub:1340000, returns:45, cost:610000, opex:210000, marginRub:520000, logistics:6.8, storage:2.4, ads:5.1, commission:10.8, acceptance:0.9, marginUnit:584 },
  { id:3, sku:'WP-0043', mpSku:'12345680', name:'Чехол для iPhone 15 Pro силикон', cat:'Аксессуары', brand:'CoverPlus', status:'active', margin:-3.2, sales:560, salesRub:280000, returns:98, cost:180000, opex:92000, marginRub:-8960, logistics:14.1, storage:5.2, ads:8.9, commission:12.4, acceptance:1.8, marginUnit:-16 },
  { id:4, sku:'WP-0044', mpSku:'12345681', name:'Перчатки зимние флис S-XL', cat:'Аксессуары', brand:'WarmHand', status:'active', margin:31.5, sales:420, salesRub:630000, returns:18, cost:250000, opex:87000, marginRub:198450, logistics:5.4, storage:1.8, ads:3.2, commission:9.8, acceptance:0.7, marginUnit:472 },
  { id:5, sku:'WP-0045', mpSku:'12345682', name:'Рюкзак городской 20л', cat:'Сумки', brand:'UrbanPack', status:'active', margin:14.8, sales:310, salesRub:930000, returns:22, cost:560000, opex:158000, marginRub:137740, logistics:9.3, storage:4.1, ads:6.7, commission:11.5, acceptance:1.4, marginUnit:444 },
  { id:6, sku:'WP-0046', mpSku:'12345683', name:'Термос 500мл нержавейка', cat:'Товары для дома', brand:'ThermoMax', status:'active', margin:26.3, sales:680, salesRub:1088000, returns:31, cost:540000, opex:149000, marginRub:286144, logistics:7.1, storage:2.9, ads:4.8, commission:10.2, acceptance:1.1, marginUnit:421 },
  { id:7, sku:'WP-0047', mpSku:'12345684', name:'Крем для рук увлажняющий 75мл', cat:'Косметика', brand:'SkinCare', status:'inactive', margin:8.2, sales:220, salesRub:154000, returns:14, cost:98000, opex:43000, marginRub:12628, logistics:11.8, storage:3.6, ads:7.2, commission:13.1, acceptance:2.0, marginUnit:57 },
  { id:8, sku:'WP-0048', mpSku:'12345685', name:'Шапка вязаная one size', cat:'Одежда', brand:'WoolTime', status:'active', margin:19.7, sales:540, salesRub:486000, returns:28, cost:240000, opex:86000, marginRub:95742, logistics:6.9, storage:2.3, ads:3.8, commission:10.4, acceptance:0.8, marginUnit:177 },
  { id:9, sku:'WP-0049', mpSku:'12345686', name:'Маска для сна хлопок', cat:'Товары для сна', brand:'DreamCo', status:'active', margin:42.1, sales:1100, salesRub:440000, returns:33, cost:140000, opex:44000, marginRub:185240, logistics:4.2, storage:1.4, ads:2.9, commission:8.7, acceptance:0.6, marginUnit:168 },
  { id:10, sku:'WP-0050', mpSku:'12345687', name:'Органайзер для ящика 30x20', cat:'Товары для дома', brand:'HomeOrder', status:'active', margin:-1.8, sales:380, salesRub:228000, returns:55, cost:162000, opex:66000, marginRub:-4104, logistics:12.4, storage:4.8, ads:7.1, commission:11.9, acceptance:1.6, marginUnit:-11 },
  { id:11, sku:'WP-0051', mpSku:'12345688', name:'Ремень кожаный мужской', cat:'Аксессуары', brand:'LeatherPro', status:'active', margin:28.9, sales:195, salesRub:390000, returns:9, cost:195000, opex:60000, marginRub:112710, logistics:5.8, storage:2.1, ads:4.4, commission:10.0, acceptance:0.9, marginUnit:578 },
  { id:12, sku:'WP-0052', mpSku:'12345689', name:'Наушники TWS вкладыши', cat:'Электроника', brand:'SoundFree', status:'active', margin:11.3, sales:280, salesRub:840000, returns:41, cost:560000, opex:128000, marginRub:94920, logistics:8.6, storage:3.4, ads:9.2, commission:12.8, acceptance:1.5, marginUnit:339 },
];

const WEEKLY = [
  { week:'Нед. 1 (3-9 мар)', sales:980000, profit:182000, margin:18.6, returns:52, ads:48000, logistics:74000, price:1240 },
  { week:'Нед. 2 (10-16 мар)', sales:1120000, profit:224000, margin:20.0, returns:61, ads:52000, logistics:84000, price:1240 },
  { week:'Нед. 3 (17-23 мар)', sales:890000, profit:142000, margin:16.0, returns:48, ads:61000, logistics:68000, price:1190 },
  { week:'Нед. 4 (24-30 мар)', sales:1340000, profit:295000, margin:22.0, returns:44, ads:58000, logistics:98000, price:1190 },
  { week:'Нед. 5 (31мар-6апр)', sales:1050000, profit:199000, margin:19.0, returns:57, ads:55000, logistics:81000, price:1250 },
  { week:'Нед. 6 (7-13 апр)', sales:1280000, profit:268000, margin:20.9, returns:63, ads:70000, logistics:95000, price:1250 },
  { week:'Нед. 7 (14-20 апр)', sales:1410000, profit:310000, margin:22.0, returns:50, ads:75000, logistics:104000, price:1300 },
  { week:'Нед. 8 (21-27 апр)', sales:1560000, profit:359000, margin:23.0, returns:59, ads:82000, logistics:116000, price:1300 },
];

const CHART_DAILY = Array.from({length:30}, (_, i) => {
  const day = i + 1;
  const base = 45000 + Math.sin(i * .4) * 12000;
  const revenue = Math.round(base + Math.random() * 8000);
  const profit = Math.round(revenue * (0.16 + Math.random() * 0.08));
  return { day: `${day} апр`, revenue, profit };
});

const PNL_ROWS = [
  { id:'revenue', label:'Выручка', type:'header', jan:4820000, feb:5140000, mar:5680000, apr:6120000, may:5940000, jun:6380000, q1:15640000, q2:18440000, year:62580000, pct:100 },
  { id:'varexp', label:'Переменные расходы', type:'section', jan:-2890000, feb:-3090000, mar:-3410000, apr:-3670000, may:-3570000, jun:-3830000, q1:-9390000, q2:-11070000, year:-37560000, pct:60.0 },
  { id:'commission', label:'  Комиссия МП', type:'child', jan:-530000, feb:-565000, mar:-625000, apr:-673000, may:-653000, jun:-702000, q1:-1720000, q2:-2028000, year:-6882000, pct:11.0 },
  { id:'logistics', label:'  Логистика', type:'child', jan:-386000, feb:-411000, mar:-454000, apr:-490000, may:-475000, jun:-510000, q1:-1251000, q2:-1475000, year:-5006000, pct:8.0 },
  { id:'cost', label:'  Себестоимость', type:'child', jan:-1638000, feb:-1748000, mar:-1931000, apr:-2081000, may:-2020000, jun:-2169000, q1:-5317000, q2:-6270000, year:-21277000, pct:34.0 },
  { id:'storage', label:'  Хранение', type:'child', jan:-145000, feb:-154000, mar:-170000, apr:-183000, may:-178000, jun:-191000, q1:-469000, q2:-552000, year:-1874000, pct:3.0 },
  { id:'ads', label:'  Реклама', type:'child', jan:-191000, feb:-212000, mar:-230000, apr:-243000, may:-244000, jun:-258000, q1:-633000, q2:-745000, year:-2521000, pct:4.0 },
  { id:'margprofit', label:'Маржинальная прибыль', type:'header', jan:1930000, feb:2050000, mar:2270000, apr:2450000, may:2370000, jun:2550000, q1:6250000, q2:7370000, year:25020000, pct:40.0 },
  { id:'fixexp', label:'Постоянные расходы', type:'section', jan:-620000, feb:-620000, mar:-620000, apr:-650000, may:-650000, jun:-650000, q1:-1860000, q2:-1950000, year:-7620000, pct:12.2 },
  { id:'payroll', label:'  ФОТ', type:'child', jan:-320000, feb:-320000, mar:-320000, apr:-350000, may:-350000, jun:-350000, q1:-960000, q2:-1050000, year:-4020000, pct:6.4 },
  { id:'rent', label:'  Аренда', type:'child', jan:-180000, feb:-180000, mar:-180000, apr:-180000, may:-180000, jun:-180000, q1:-540000, q2:-540000, year:-2160000, pct:3.5 },
  { id:'soft', label:'  Программное обеспечение', type:'child', jan:-120000, feb:-120000, mar:-120000, apr:-120000, may:-120000, jun:-120000, q1:-360000, q2:-360000, year:-1440000, pct:2.3 },
  { id:'ebitda', label:'EBITDA', type:'header', jan:1310000, feb:1430000, mar:1650000, apr:1800000, may:1720000, jun:1900000, q1:4390000, q2:5420000, year:17400000, pct:27.8 },
  { id:'tax', label:'Налог (6% УСН)', type:'child', jan:-289000, feb:-308000, mar:-341000, apr:-367000, may:-356000, jun:-383000, q1:-938000, q2:-1106000, year:-3755000, pct:6.0 },
  { id:'netprofit', label:'Чистая прибыль', type:'header', jan:1021000, feb:1122000, mar:1309000, apr:1433000, may:1364000, jun:1517000, q1:3452000, q2:4314000, year:13645000, pct:21.8 },
];

const OPERATIONS = [
  { id:1, dateDDS:'2026-04-01', dateOPU:'2026-04-01', mp:'Wildberries', article:'Реклама', type:'expense', amount:-48000, account:'Расч. счёт', comment:'Продвижение апрель' },
  { id:2, dateDDS:'2026-04-02', dateOPU:'2026-04-02', mp:'Ozon', article:'Логистика', type:'expense', amount:-32000, account:'Расч. счёт', comment:'' },
  { id:3, dateDDS:'2026-04-03', dateOPU:'2026-04-01', mp:'Wildberries', article:'Поступление выручки', type:'income', amount:620000, account:'Расч. счёт', comment:'Еженедельное перечисление' },
  { id:4, dateDDS:'2026-04-05', dateOPU:'2026-04-05', mp:'—', article:'ФОТ', type:'expense', amount:-320000, account:'Расч. счёт', comment:'Зарплата март' },
  { id:5, dateDDS:'2026-04-07', dateOPU:'2026-04-07', mp:'Яндекс Маркет', article:'Хранение', type:'expense', amount:-18500, account:'Расч. счёт', comment:'' },
  { id:6, dateDDS:'2026-04-10', dateOPU:'2026-04-10', mp:'Wildberries', article:'Поступление выручки', type:'income', amount:890000, account:'Расч. счёт', comment:'Еженедельное перечисление' },
  { id:7, dateDDS:'2026-04-12', dateOPU:'2026-04-12', mp:'—', article:'Аренда', type:'expense', amount:-180000, account:'Расч. счёт', comment:'Офис апрель' },
  { id:8, dateDDS:'2026-04-15', dateOPU:'2026-04-15', mp:'Ozon', article:'Реклама', type:'expense', amount:-65000, account:'Расч. счёт', comment:'Performance апрель' },
  { id:9, dateDDS:'2026-04-17', dateOPU:'2026-04-17', mp:'Wildberries', article:'Поступление выручки', type:'income', amount:1040000, account:'Расч. счёт', comment:'Еженедельное перечисление' },
  { id:10, dateDDS:'2026-04-20', dateOPU:'2026-04-20', mp:'—', article:'ПО', type:'expense', amount:-12000, account:'Карта', comment:'Wild Profit подписка' },
  { id:11, dateDDS:'2026-04-22', dateOPU:'2026-04-22', mp:'Яндекс Маркет', article:'Поступление выручки', type:'income', amount:380000, account:'Расч. счёт', comment:'' },
  { id:12, dateDDS:'2026-04-24', dateOPU:'2026-04-24', mp:'Wildberries', article:'Реклама', type:'expense', amount:-82000, account:'Расч. счёт', comment:'Буст апрель нед.4' },
];

const NORMS = [
  { id:'logistics', label:'Логистика', norm:8, fact:8.1 },
  { id:'storage', label:'Хранение', norm:4, fact:2.9 },
  { id:'ads', label:'Реклама', norm:5, fact:6.2 },
  { id:'cost', label:'Себестоимость', norm:34, fact:33.8 },
  { id:'commission', label:'Комиссия маркетплейса', norm:11, fact:11.2 },
];

Object.assign(window, {
  ThemeContext, ThemeProvider, useTheme,
  ToastProvider, useToast,
  Icon, Badge, Button, Input, Select, Toggle, Modal, Card, SortableHeader, Skeleton, Alert,
  fmtRub, fmtPct, fmtNum, marginColor,
  PRODUCTS, WEEKLY, CHART_DAILY, PNL_ROWS, OPERATIONS, NORMS,
});
