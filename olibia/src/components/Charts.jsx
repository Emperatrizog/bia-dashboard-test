import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from './Ui.jsx';
import { MONTH_FULL, LABEL_PERIOD } from '../lib/format.js';

// Cierres por mes: barras con línea de meta. La última barra es el periodo seleccionado.
// Si la barra corresponde al otro periodo con datos (Sep/Oct), sirve para cambiar de periodo.
export function MonthsChart({ labels, values, period, onPeriod, goal = 10 }) {
  // Se dibuja a escala real (1 unidad = 1 px) para que la tipografía y las barras no crezcan con el ancho de la tarjeta.
  const box = useRef(null);
  const [W, setW] = useState(360);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width); if (w > 0) setW(w); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 150, bw = W / values.length, BAR = Math.min(40, Math.max(22, bw * 0.5));
  const last = values.length - 1;
  return (
    <div className="mwrap" ref={box}>
    <svg className="months" width={W} height={H + 26} viewBox={`0 0 ${W} ${H + 26}`} role="group" aria-label="Cierres por mes y meta de diez cierres">
      <line className="goal" x1="0" x2={W} y1="10" y2="10" />
      {values.map((v, i) => {
        const h = (v / goal) * (H - 10), x = i * bw + (bw - BAR) / 2, y = H - h;
        const full = MONTH_FULL[labels[i]] || labels[i];
        const target = LABEL_PERIOD[labels[i]];
        const go = target && target !== period ? target : null;
        const common = {
          className: 'mbar' + (i === last ? ' cur' : '') + (go ? ' go' : ''), tabIndex: 0,
          'data-tt': full, 'data-td': `${v} cierres · ${v * 10}% de la meta de ${goal}${go ? ' · clic para ver este periodo' : ''}`,
        };
        const body = (
          <>
            <rect x={x} y={y} width={BAR} height={h} rx="6" />
            <text className="mv" x={x + BAR / 2} y={y - 6} textAnchor="middle">{v}</text>
            <text x={x + BAR / 2} y={H + 18} textAnchor="middle">{labels[i]}</text>
          </>
        );
        return go ? (
          <g key={labels[i]} {...common} role="button" aria-label={`${full}: ${v} cierres, ${v * 10}% de la meta. Ver este periodo`}
            onClick={() => onPeriod(go)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPeriod(go); } }}>{body}</g>
        ) : (
          <g key={labels[i]} {...common} role="img" aria-label={`${full}: ${v} cierres, ${v * 10}% de la meta`}>{body}</g>
        );
      })}
    </svg>
    </div>
  );
}

// Oportunidades por etapa: la barra completa equivale al total de oportunidades en vista.
export function StageBars({ counts, total, value, onToggle }) {
  return (
    <div className="stk">
      {counts.map(([name, n, sum]) => (
        <button type="button" key={name} className={'hb' + (value === name ? ' sel' : '')} aria-pressed={value === name}
          onClick={() => onToggle(name)} data-tt={name} data-td={`${n} oportunidades · $${sum} M · clic para filtrar`}
          aria-label={`${name}: ${n} oportunidades${total ? `, ${Math.round((n / total) * 100)}%` : ''}`}>
          <span>{name}</span>
          <div className="tr"><i style={{ width: `${total && n ? Math.max((n / total) * 100, 3) : 0}%` }} /></div>
          <b>{n}<small> · {total ? Math.round((n / total) * 100) : 0}%</small></b>
        </button>
      ))}
    </div>
  );
}

// Origen: la altura completa equivale al total de oportunidades en vista.
export function OriginColumns({ counts, total, value, onToggle }) {
  return (
    <div className="cols">
      {counts.map(([name, n, sum]) => (
        <button type="button" key={name} className={'col' + (value === name ? ' sel' : '')} aria-pressed={value === name}
          onClick={() => onToggle(name)} data-tt={name} data-td={`${n} oportunidades · $${sum} M · clic para filtrar`}
          aria-label={`${name}: ${n} oportunidades`}>
          <div className="t"><b>{n}</b><i style={{ height: `${total ? (n / total) * 100 : 0}%` }} /></div>
          <span>{name}</span><small>{total ? Math.round((n / total) * 100) : 0}%</small>
        </button>
      ))}
    </div>
  );
}

// Cierres por ejecutivo: la barra completa equivale a los cierres del periodo.
export function ExecBars({ names, owners, closed, active, onOpen }) {
  const max = Math.max(...owners);
  return (
    <div className="stk">
      {names.map((name, i) => (
        <button type="button" key={name} data-fid={`exe:${name}`} className={'ej' + (active === name ? ' sel' : '')}
          onClick={(e) => onOpen(name, e.currentTarget)} aria-label={`${name}: ${owners[i]} cierres. Ver detalle`}
          data-tt={name} data-td={`${owners[i]} cierres · ${Math.round((owners[i] / closed) * 100)}% del total · clic para ver detalle`}>
          <Avatar name={name} size={38} />
          <span>{name}</span>
          <div className="tr"><i className={owners[i] === max ? 'lead' : ''} style={{ width: `${(owners[i] / closed) * 100}%` }} /></div>
          <b>{owners[i]}<small> · {Math.round((owners[i] / closed) * 100)}%</small></b>
        </button>
      ))}
    </div>
  );
}
