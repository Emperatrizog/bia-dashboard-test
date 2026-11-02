import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from './Ui.jsx';
import { COMPANY, ROLE, STAGES, baseActivity } from '../extras.js';
import { PERIOD_MONTH, daysUntil, rel, todayIso } from '../lib/format.js';
import { channelFor } from '../filters.js';

const chipCls = (s) => 'chip' + (s === 'Negociación' ? ' n' : s === 'Propuesta' ? ' p' : s === 'Contacto' ? ' c' : '');
const ACTIONS = [['call', 'Registrar llamada'], ['mail', 'Registrar correo'], ['meet', 'Registrar reunión']];

function Activity({ items }) {
  return items.map((a, i) => (
    <div className="ac" key={i}><Avatar name={a.o} size={32} /><div><b>{a.t}</b><span>{a.s}</span></div><small>{a.w}</small></div>
  ));
}

// Contenedor común del panel lateral. Al abrir lleva el foco al botón de cerrar.
function Shell({ title, onClose, children, labelId }) {
  const close = useRef(null);
  useEffect(() => { if (close.current) close.current.focus(); }, []);
  return (
    <aside className="drw" role="dialog" aria-modal="false" aria-labelledby={labelId}>
      <div className="dh">{title}<button type="button" className="btn ic" ref={close} onClick={onClose} aria-label="Cerrar detalle"><Icon name="x" /></button></div>
      {children}
    </aside>
  );
}

// Detalle de una oportunidad: resumen, actividad, archivos y acciones de seguimiento.
export function OpportunityDrawer({ row, all, period, done, log, last, onClose, onFollowup, onAction, onExe }) {
  const [tab, setTab] = useState('r');
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [name, stage, value, owner, next] = row;
  const info = COMPANY[name];
  const nextStage = STAGES[STAGES.indexOf(stage) + 1];
  const days = daysUntil(next, period);
  const acts = [...log, ...baseActivity(last, owner)];
  const submit = (e) => { e.preventDefault(); onAction({ type, note: note.trim(), date }); setNote(''); setDate(''); setType('call'); };
  return (
    <Shell labelId="detailTitle" onClose={onClose}
      title={<div><h2 id="detailTitle">{name}</h2><div className="sub">Oportunidad · <span className={chipCls(stage)}>{stage}</span></div></div>}>
      <div className="tabs" role="tablist" aria-label="Secciones del detalle">
        {[['r', 'Resumen'], ['a', 'Actividad'], ['f', 'Archivos']].map(([k, l]) => (
          <button type="button" role="tab" key={k} aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'r' && (
        <div role="tabpanel">
          <div className="mg">
            <div><span>Valor mensual estimado</span><b>${value} M</b><small>millones COP</small></div>
            <div><span>Próximo contacto</span><b>{next} 2026</b><small>{rel(days)}</small></div>
            <div><span>Responsable</span>
              <button type="button" className="lk who" data-fid={`exe:${owner}:d`} onClick={(e) => onExe(owner, e.currentTarget)} aria-label={`${owner}, ver detalle`}><Avatar name={owner} size={32} /><span><b>{owner}</b><small>{ROLE[owner]}</small></span></button></div>
            <div><span>Canal de origen</span><b>{channelFor(row, all)}</b><small>Contacto: {info.contact}</small></div>
          </div>
          <h3>Descripción</h3><p>{info.desc}</p>
          <div className="sg"><b>✦ Sugerencia AI</b>Se recomienda realizar el seguimiento antes del {next} para mantener el impulso en la etapa de {stage.toLowerCase()}.</div>
          <h3>Seguimiento</h3>
          <button type="button" className="btn lm full" disabled={done} onClick={onFollowup}>Marcar seguimiento realizado</button>
          <p role="status" className="status">{done ? 'Seguimiento registrado en esta sesión.' : ''}</p>
          <form className="fm" onSubmit={submit}>
            <h3>Registrar otra acción</h3>
            <label htmlFor="act-type">Tipo de acción</label>
            <select id="act-type" value={type} onChange={(e) => setType(e.target.value)}>
              {ACTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              {nextStage && <option value="advance">Avanzar a {nextStage}</option>}
            </select>
            <label htmlFor="act-note">Nota (opcional)</label>
            <textarea id="act-note" maxLength={500} placeholder="Escribe un comentario..." value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="cn">{note.length}/500</div>
            <label htmlFor="act-date">Próximo contacto (opcional)</label>
            <input id="act-date" type="date" min={todayIso(period)} value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="submit" className="btn dk full">Guardar acción</button>
          </form>
          <div className="row"><h3>Actividad reciente</h3><button type="button" className="link" onClick={() => setTab('a')}>Ver todo</button></div>
          <Activity items={acts.slice(0, 3)} />
        </div>
      )}
      {tab === 'a' && <div role="tabpanel"><Activity items={acts} /></div>}
      {tab === 'f' && (
        <div role="tabpanel">
          {stage === 'Propuesta' || stage === 'Negociación'
            ? <><div className="fi"><span>Propuesta comercial.pdf</span><small>1,2 MB</small></div><div className="fi"><span>Términos y condiciones.docx</span><small>84 KB</small></div></>
            : <p className="empty">Aún no hay archivos para esta oportunidad.</p>}
        </div>
      )}
    </Shell>
  );
}

// Detalle de un ejecutivo: cierres, comparación entre periodos (datos reales de data.js) y sus oportunidades abiertas.
export function ExecutiveDrawer({ name, index, data, period, all, onClose, onOpen, onPhoto }) {
  const file = useRef(null);
  const mine = all.filter((r) => r[3] === name);
  const sum = mine.reduce((s, r) => s + r[2], 0);
  const d = data[period];
  const cmp = [['Septiembre', data.sep.owners[index]], ['Octubre', data.oct.owners[index]]];
  const top = Math.max(...Object.values(data).flatMap((p) => p.owners));
  return (
    <Shell labelId="exeTitle" onClose={onClose}
      title={<div className="who"><Avatar name={name} size={56} /><div><h2 id="exeTitle">{name}</h2><div className="sub">{ROLE[name]}</div></div></div>}>
      <div className="pad"><input ref={file} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) onPhoto(name, e.target.files[0]); e.target.value = ''; }} />
        <button type="button" className="btn" onClick={() => file.current.click()}>Cambiar foto</button></div>
      <div className="mg">
        <div><span>Cierres en {PERIOD_MONTH[period].toLowerCase()}</span><b>{d.owners[index]}</b><small>{Math.round((d.owners[index] / d.closed) * 100)}% del total del equipo</small></div>
        <div><span>Oportunidades abiertas</span><b>{mine.length}</b><small>${sum} M / mes en pipeline</small></div>
      </div>
      <h3>Cierres por periodo</h3>
      <div className="cmp">{cmp.map(([l, v]) => (
        <div key={l} className="cm" data-tt={l} data-td={`${v} cierres`}><div className="tk"><i style={{ height: `${(v / top) * 100}%` }} /></div><b>{v}</b><span>{l}</span></div>
      ))}</div>
      <p className="sub">Escala compartida entre ejecutivos y periodos.</p>
      <h3>Oportunidades abiertas</h3>
      {mine.length ? mine.map((r) => (
        <button type="button" className="fi btnrow" key={r[0]} data-fid={`row:${r[0]}:e`} onClick={(e) => onOpen(r, e.currentTarget)} aria-label={`Ver ${r[0]}`}>
          <span>{r[0]}</span><span className={chipCls(r[1])}>{r[1]}</span><small>${r[2]} M</small>
        </button>
      )) : <p className="empty">Sin oportunidades abiertas en este periodo.</p>}
    </Shell>
  );
}
