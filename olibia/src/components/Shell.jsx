import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Ui.jsx';
import { PERIODS } from '../lib/format.js';
import { STAGES, OWNERS, CHANNELS } from '../extras.js';

const NAV = [['dash', 'Dashboard', 'Inicio'], ['opp', 'Oportunidades', 'Oport.'], ['emp', 'Empresas', 'Empresas'], ['con', 'Contactos', 'Contactos'], ['rep', 'Reportes', 'Reportes'], ['cfg', 'Configuración', 'Ajustes']];

function UserMenu({ onLogout, collapsed }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null), btn = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const click = (e) => { if (!ref.current || !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') { setOpen(false); if (btn.current) btn.current.focus(); } };
    document.addEventListener('mousedown', click); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className="um" ref={ref}>
      {open && (
        <div className="menu" role="menu">
          <button type="button" role="menuitem" autoFocus onClick={() => { setOpen(false); onLogout(); }}><Icon name="logout" />Cerrar sesión</button>
        </div>
      )}
      <button type="button" className="user" ref={btn} aria-haspopup="menu" aria-expanded={open} data-tt={collapsed ? 'Equipo comercial' : undefined} onClick={() => setOpen(!open)}>
        <span className="av" aria-hidden="true">EC</span>
        <span className="who">Equipo comercial<small>8 miembros</small></span>
        <Icon name="up" />
      </button>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, say }) {
  return (
    <aside className="nav" id="sidebar">
      <button type="button" className="ntog" onClick={onToggle} aria-expanded={!collapsed} aria-controls="sidebar"
        aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        data-tt={collapsed ? 'Expandir menú' : 'Contraer menú'}><Icon name="chev" size={14} /></button>
      <div className="logo"><i aria-hidden="true" /><div>olibia<small>Gestión comercial</small></div></div>
      <nav aria-label="Navegación principal">
        {NAV.map(([icon, label, short], i) => (
          <a key={label} href="#main" className={i === 0 ? 'on' : ''} aria-current={i === 0 ? 'page' : undefined}
            data-tt={collapsed ? label : undefined}
            onClick={(e) => { e.preventDefault(); if (i) say(`${label}: vista pendiente de diseño`); }}>
            <Icon name={icon} /><span className="fl">{label}</span><span className="sl" aria-hidden="true">{short}</span>
          </a>
        ))}
      </nav>
      <UserMenu collapsed={collapsed} onLogout={() => say('Sesión cerrada · demostración')} />
    </aside>
  );
}

export function Header({ period, onPeriod, onExport }) {
  return (
    <div className="row">
      <div><h1>Dashboard comercial</h1><div className="sub">Resumen de resultados y oportunidades</div></div>
      <div className="row hc">
        <label className="sub" htmlFor="period">Periodo</label>
        <select id="period" value={period} onChange={(e) => onPeriod(e.target.value)}>
          {Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="button" className="btn dk" onClick={onExport}>Exportar CSV</button>
      </div>
    </div>
  );
}

export function FilterBar({ f, set, clear }) {
  const chips = [
    f.stage && ['Etapa', f.stage, 'stage'], f.owner && ['Responsable', f.owner, 'owner'], f.channel && ['Canal', f.channel, 'channel'],
    f.minimum && ['Valor', `Desde $${f.minimum} M`, 'minimum'], f.query && ['Búsqueda', `“${f.query}”`, 'query'],
  ].filter(Boolean);
  const sel = (label, key, all, opts) => (
    <label>{label}
      <select value={f[key]} onChange={(e) => set(key, e.target.value)}>
        <option value="">{all}</option>
        {opts.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}
      </select>
    </label>
  );
  return (
    <section className="fcard" aria-label="Filtrar oportunidades abiertas">
      <div className="fl">
        {sel('Etapa', 'stage', 'Todas las etapas', STAGES)}
        {sel('Responsable', 'owner', 'Todos los responsables', OWNERS)}
        {sel('Canal', 'channel', 'Todos los canales', CHANNELS)}
        {sel('Valor mensual', 'minimum', 'Todos los valores', [['30', 'Desde $30 M COP'], ['50', 'Desde $50 M COP']])}
        <button type="button" className="btn" onClick={clear} aria-label="Limpiar filtros" title="Limpiar filtros"><Icon name="filter" /><span className="lbl">Limpiar filtros</span></button>
      </div>
      <div className="act">
        Filtros activos:
        {chips.length ? chips.map(([l, v, k]) => (
          <button type="button" key={k} className="cp" onClick={() => set(k, '')} aria-label={`Quitar filtro ${l}: ${v}`}>{l}: {v} <Icon name="x" size={12} /></button>
        )) : <span className="none">Ninguno</span>}
      </div>
      <p className="scope">Aplican al pipeline, al resumen AI, a las gráficas de oportunidades y a la tabla. Los cierres muestran el total del periodo.</p>
    </section>
  );
}

export function Banner({ onSee, onClose }) {
  return (
    <section className="banner" aria-label="Aviso comercial">
      <span className="bi" aria-hidden="true">!</span>
      <div><strong>Recta final del mes</strong><p>Revisa las oportunidades abiertas y coordina los próximos contactos con tu equipo.</p></div>
      <button type="button" className="btn" onClick={onSee}>Ver negociaciones</button>
      <button type="button" className="btn ic" aria-label="Cerrar banner" onClick={onClose}><Icon name="x" /></button>
    </section>
  );
}
