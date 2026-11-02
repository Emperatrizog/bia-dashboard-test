import React, { createContext, useContext, useEffect, useRef } from 'react';
import ana from '../assets/ana-lopez.jpg';
import carlos from '../assets/carlos-ruiz.jpg';
import laura from '../assets/laura-diaz.jpg';
import mateo from '../assets/mateo-gil.jpg';

// Fotos de prueba incrustadas en el bundle. El usuario puede reemplazarlas durante la sesión.
const FACES = { 'Ana López': ana, 'Carlos Ruiz': carlos, 'Laura Díaz': laura, 'Mateo Gil': mateo };
export const PhotosContext = createContext({});

export function Avatar({ name, size = 32 }) {
  const photos = useContext(PhotosContext);
  return <img className="avatar" src={photos[name] || FACES[name]} width={size} height={size} alt="" />;
}

const PATHS = {
  dash: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  opp: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/>',
  emp: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4"/>',
  con: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  rep: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cfg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  tgt: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  fol: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  usd: '<path d="M12 3v18M16 7.5C15 6 13.5 5.5 12 5.5c-2 0-3.5 1-3.5 2.5s1.5 2.2 3.5 2.7 3.5 1.2 3.5 2.8-1.5 2.5-3.5 2.5c-1.6 0-3.2-.6-4-2"/>',
  chk: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  chev: '<path d="M15 6l-6 6 6 6"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
export const Icon = ({ name, size = 18 }) => (
  <svg className="i" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] }} />
);

// Tooltip global: lee data-tt (título) y data-td (detalle). Aparece con mouse y con foco de teclado
// (solo :focus-visible), y se oculta con Esc. El contenido nunca es la única vía a la información.
export function TooltipLayer() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let cur = null;
    const fill = (t) => { el.firstChild.textContent = t.dataset.tt || ''; el.lastChild.textContent = t.dataset.td || ''; };
    const place = (x, y) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      el.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + 'px';
      el.style.top = (y + h + 24 > window.innerHeight ? y - h - 14 : y + 18) + 'px';
    };
    const hide = () => { cur = null; el.style.opacity = 0; };
    const over = (e) => {
      const t = e.target.closest && e.target.closest('[data-tt]');
      if (!t) { if (cur) hide(); return; }
      cur = t; fill(t); el.style.opacity = 1; place(e.clientX, e.clientY);
    };
    const move = (e) => { if (cur) place(e.clientX, e.clientY); };
    const fin = (e) => {
      const t = e.target.closest && e.target.closest('[data-tt]');
      if (t && e.target.matches(':focus-visible')) {
        cur = t; fill(t); el.style.opacity = 1;
        const r = t.getBoundingClientRect(); place(r.left, r.bottom - 12);
      }
    };
    const key = (e) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('mouseover', over);
    document.addEventListener('mousemove', move);
    document.addEventListener('focusin', fin);
    document.addEventListener('focusout', hide);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mouseover', over); document.removeEventListener('mousemove', move);
      document.removeEventListener('focusin', fin); document.removeEventListener('focusout', hide);
      document.removeEventListener('keydown', key);
    };
  }, []);
  return <div id="tip" ref={ref} role="tooltip" aria-hidden="true"><b /><span /></div>;
}

// Confirmaciones breves. Conserva el último texto para que la salida sea suave.
export function Toast({ msg }) {
  const last = useRef('');
  if (msg) last.current = msg;
  return <div className={'toast' + (msg ? ' on' : '')} role="status" aria-live="polite">{last.current}</div>;
}
