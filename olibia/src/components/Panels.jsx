import React, { useMemo, useState } from 'react';
import { Avatar, Icon } from './Ui.jsx';
import { DELTA, dateValue } from '../lib/format.js';
import { STAGES } from '../extras.js';

export function Kpis({ period, closed, count, total }) {
  return (
    <section className="kpis" aria-label="Indicadores principales">
      <div className="kpi dk"><span>Meta comercial</span><i className="ico"><Icon name="tgt" /></i><strong>{closed * 10}%</strong>
        <div className="pb" role="progressbar" aria-valuenow={closed * 10} aria-valuemin="0" aria-valuemax="100" aria-label="Avance de la meta comercial"><i style={{ width: `${closed * 10}%` }} /></div>
        <em>De 10 cierres mensuales</em></div>
      <div className="kpi"><span>Cierres del mes</span><i className="ico"><Icon name="chk" /></i><strong>{closed}</strong><em>{DELTA[period]}</em></div>
      <div className="kpi"><span>Valor del pipeline</span><i className="ico"><Icon name="usd" /></i><strong>${total}<small>M</small></strong><em>COP millones / mes</em></div>
      <div className="kpi"><span>Oportunidades abiertas</span><i className="ico"><Icon name="fol" /></i><strong>{count}</strong><em>Según los filtros</em></div>
    </section>
  );
}

// Resumen simulado a partir de las filas visibles (sin servicio de AI). Muestra un esqueleto breve al cambiar los datos.
export function AiSummary({ rows, total, busy, onSee }) {
  const neg = rows.filter((r) => r[1] === 'Negociación');
  const negTotal = neg.reduce((s, r) => s + r[2], 0);
  return (
    <section className="card ai" aria-label="Resumen AI">
      <div className="tx">
        <div className="row start"><h2><span className="spark" aria-hidden="true">✦</span>Resumen AI</h2><span className="tag">Vista de demostración</span></div>
        <div aria-live="polite" aria-busy={busy}>
          {busy ? <><span className="sk" /><span className="sk s" /></> : rows.length ? (
            <>
              <p>Hay <strong>{rows.length} oportunidades abiertas</strong> en esta vista, por un valor mensual estimado de <strong>${total} millones COP</strong>. {neg.length ? `${neg.length} están en negociación y concentran $${negTotal} millones COP del pipeline.` : 'Ninguna de las oportunidades visibles está en negociación.'}</p>
              <p><strong>Siguiente paso sugerido:</strong> revisar {neg.length ? 'las negociaciones pendientes' : 'las próximas fechas de contacto'} y confirmar responsables.</p>
            </>
          ) : <p>No hay oportunidades con estos filtros. Prueba ampliando la selección.</p>}
        </div>
        <p className="scope">Resumen simulado a partir de los datos visibles; no utiliza un servicio de AI.</p>
      </div>
      <button type="button" className="btn lm" onClick={onSee}>Ver negociaciones <Icon name="arrow" size={16} /></button>
    </section>
  );
}

const COLS = [['n', 'Empresa'], ['e', 'Etapa'], ['v', 'Valor mensual · COP M'], ['o', 'Responsable'], ['d', 'Próximo contacto'], ['l', 'Última actividad']];
const chipCls = (s) => 'chip' + (s === 'Negociación' ? ' n' : s === 'Propuesta' ? ' p' : s === 'Contacto' ? ' c' : '');

export function OpportunitiesTable({ rows, query, onQuery, selected, lastOf, onOpen, onExe, onClear }) {
  const [sort, setSort] = useState({ k: null, dir: 1 });
  const sorted = useMemo(() => {
    if (!sort.k) return rows;
    const val = { n: (r) => r[0], e: (r) => STAGES.indexOf(r[1]), v: (r) => r[2], o: (r) => r[3], d: (r) => dateValue(r[4]), l: (r) => lastOf(r) }[sort.k];
    return [...rows].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [rows, sort, lastOf]);
  const toggle = (k) => setSort((s) => (s.k === k ? { k, dir: -s.dir } : { k, dir: 1 }));
  return (
    <section className="card" id="tabla" aria-label="Oportunidades abiertas">
      <div className="row">
        <h2>Oportunidades abiertas <small>{rows.length} en vista</small></h2>
        <input type="search" aria-label="Buscar empresa" placeholder="Buscar empresa..." value={query} onChange={(e) => onQuery(e.target.value)} />
      </div>
      <div className="tw">
        <table>
          <thead><tr>
            {COLS.map(([k, label]) => (
              <th key={k} aria-sort={sort.k === k ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>
                <button type="button" className="th" onClick={() => toggle(k)}>{label}{sort.k === k ? (sort.dir > 0 ? ' ↑' : ' ↓') : ''}</button>
              </th>
            ))}
            <th>Detalle</th>
          </tr></thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r[0]} className={selected === r[0] ? 'sel' : ''}>
                <td className="nm">{r[0]}</td>
                <td data-label="Etapa"><span className={chipCls(r[1])}>{r[1]}</span></td>
                <td data-label="Valor mensual">${r[2]} M</td>
                <td data-label="Responsable"><button type="button" className="lk" data-fid={`exe:${r[3]}:t${r[0]}`} aria-label={`${r[3]}, ver detalle`} onClick={(e) => onExe(r[3], e.currentTarget)}><Avatar name={r[3]} size={24} />{r[3]}</button></td>
                <td data-label="Próximo contacto">{r[4]}</td>
                <td data-label="Última actividad"><span className="la"><span className="dot" />{lastOf(r)}</span></td>
                <td className="ta"><button type="button" className="btn" data-fid={`row:${r[0]}`} aria-label={`Ver ${r[0]}`} onClick={(e) => onOpen(r, e.currentTarget)}>Ver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty"><p>No se encontraron oportunidades{query ? ` para «${query}»` : ' con estos filtros'}.</p><button type="button" className="btn" onClick={onClear}>Limpiar filtros{query ? ' y búsqueda' : ''}</button></div>
      )}
    </section>
  );
}
