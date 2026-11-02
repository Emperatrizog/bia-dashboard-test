import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  LuAirVent, LuArrowDown, LuArrowUp, LuBell, LuChartColumn, LuChartNoAxesColumnIncreasing, LuEarth, LuFileText, LuCheck, LuChevronDown, LuCircleHelp, LuClock, LuCoffee, LuCookingPot, LuCopy, LuDownload, LuFlaskConical, LuGlobe, LuHouse, LuLightbulb, LuMapPin, LuMenu,
  LuPanelLeft, LuPlug, LuReceipt, LuRefrigerator, LuRefreshCw, LuSettings, LuSettings2, LuSparkles, LuStore, LuTable2, LuTriangleAlert, LuUndo2, LuUser, LuX, LuZap, 
} from 'react-icons/lu'
import { AHORRO, HIPOTESIS, HOURS, isClosed, EQUIPOS, getSede, MESES, RENDERS, SEDES, TARIFA, TODAS } from './data.js'
import { cop, hourLabel, kwh, num, shortHour } from './format.js'
import cafeteria from './assets/cafeteria.webp'
import biaAvatar from './assets/bia-avatar.webp'
import biaIso from './assets/bia-iso.webp'
import biaLogo from './assets/bia-logo.webp'

const LuFileDollar = (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M12 10.5v8" /><path d="M14.5 12h-3.25a1.5 1.5 0 0 0 0 3h1.5a1.5 1.5 0 0 1 0 3H9.5" />
  </svg>
)

// Menú de Bia. Esta página es el inicio; lo demás no hace parte de la demostración.
const NAV = [
  { label: 'Contraer menú', icon: LuPanelLeft },
  { label: 'Asistente', icon: LuSparkles },
  { label: 'Inicio', icon: LuHouse, current: true },
  { label: 'Alertas', icon: LuBell },
  { label: 'Consumo', icon: LuChartNoAxesColumnIncreasing },
  { label: 'Facturas', icon: LuFileDollar },
  { label: 'Sedes', icon: LuEarth },
  { label: 'Ajustes', icon: LuSettings },
]

const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Hypo() { return <span className="tag tag-hypo"><LuCircleHelp aria-hidden="true" />Por confirmar</span> }

function Term({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (e.key === 'Escape' || (e.type === 'pointerdown' && !ref.current?.contains(e.target))) setOpen(false) }
    addEventListener('keydown', close); addEventListener('pointerdown', close)
    return () => { removeEventListener('keydown', close); removeEventListener('pointerdown', close) }
  }, [open])
  return (
    <span className="term" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="term-btn" aria-expanded={open} aria-label={`Qué significa ${label}`} onClick={() => setOpen(true)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}><LuCircleHelp aria-hidden="true" /></button>
      {open && <span role="tooltip" className="tooltip term-tip">{children}</span>}
    </span>
  )
}

function Rail() {
  return (
    <nav className="rail" aria-label="Menú">
      <div className="rail-top">
        <img className="rail-logo" src={biaIso} alt="Bia" />
        <ul>
          {NAV.map(({ label, icon: Icon, current }) => (
            <li key={label} className={current ? '' : 'rail-off'}>
              {current ? (
                <a href="#resumen" className="rail-link is-on" aria-current="page" aria-label={label}>
                  <Icon aria-hidden="true" /><span className="rail-tip" aria-hidden="true">{label}</span>
                </a>
              ) : (
                <button type="button" className="rail-link" tabIndex={-1} aria-disabled="true" aria-label={`${label}, no incluido en esta demostración`}>
                  <Icon aria-hidden="true" /><span className="rail-tip" aria-hidden="true">{label}: no incluido aquí</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <img className="rail-user" src={biaAvatar} alt="Cuenta de Alex" />
    </nav>
  )
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btn = useRef(null)
  useEffect(() => { if (open) ref.current?.showModal() }, [open])
  const close = () => { ref.current?.close(); setOpen(false); btn.current?.focus() }
  const go = (e) => {
    e.preventDefault()
    close()
    requestAnimationFrame(() => scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' }))
  }
  return (
    <div className="m-bar">
      <button type="button" className="m-burger" ref={btn} aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><LuMenu aria-hidden="true" /></button>
      <img className="m-logo" src={biaLogo} alt="Bia" />
      {open && (
        <dialog ref={ref} className="m-menu" aria-label="Menú" onCancel={(e) => { e.preventDefault(); close() }} onClick={(e) => { if (e.target === ref.current) close() }}>
          <div className="m-menu-in">
            <div className="m-menu-head">
              <img className="m-logo" src={biaLogo} alt="Bia" />
              <button type="button" className="icon-btn" onClick={close} aria-label="Cerrar menú"><LuX aria-hidden="true" /></button>
            </div>
            <ul>
              {NAV.filter((n) => n.label !== 'Contraer menú').map(({ current, label, icon: Icon }) => (
                <li key={label}>
                  {current ? (
                    <a href="#resumen" className="m-link is-on" aria-current="page" onClick={go}><Icon aria-hidden="true" />{label}</a>
                  ) : (
                    <span className="m-link is-off"><Icon aria-hidden="true" />{label}<small>No incluido</small></span>
                  )}
                </li>
              ))}
            </ul>
            <p className="m-user"><img className="rail-user" src={biaAvatar} alt="" /><span><b>Alex</b>3 cafeterías</span></p>
          </div>
        </dialog>
      )}
    </div>
  )
}

function useTween(target) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (prefersReduced() || from.current === target) { setV(target); from.current = target; return undefined }
    const a = from.current
    const t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 380)
      const cur = a + (target - a) * (1 - (1 - k) ** 3)
      setV(cur); from.current = cur
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}

function Stat({ label, icon: Icon, term, n, fmt, unit, delta, ok, down }) {
  const value = fmt(useTween(n))
  return (
    <div className="stat glass">
      <dt><span>{label}{term}</span>{Icon && <Icon className="stat-ico" aria-hidden="true" />}</dt>
      <dd className="stat-value">{value}{unit && <small> {unit}</small>}</dd>
      <dd className={ok || down ? 'delta delta-ok' : 'delta'}>{ok ? <LuCheck aria-hidden="true" /> : down ? <LuArrowDown aria-hidden="true" /> : <LuArrowUp aria-hidden="true" />}{delta}</dd>
    </div>
  )
}

const signed = (n, fmt) => `${n >= 0 ? '+' : '−'}${fmt(n)}`
const pct = (n) => `${String(Math.round(Math.abs(n) * 10) / 10).replace('.', ',')}%`
const monthTotals = (id) => {
  const i = MESES.findIndex((m) => m.id === id)
  const kwhOf = (m) => Object.values(m.sedes).reduce((a, b) => a + b, 0)
  const now = kwhOf(MESES[i]), prev = kwhOf(MESES[i - 1])
  return { name: MESES[i].name, prevName: MESES[i - 1].name, now, prev, d: now - prev, p: ((now - prev) / prev) * 100 }
}

function ExportButton({ month, notify }) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const run = () => {
    setBusy(true)
    setTimeout(() => {
      const t = monthTotals(month)
      const file = `factura-${t.name.toLowerCase()}.csv`
      const csv = `Concepto;${t.prevName};${t.name}\nConsumo (kWh);${t.prev};${t.now}\nTarifa ($/kWh);${TARIFA};${TARIFA}\nFactura ($);${t.prev * TARIFA};${t.now * TARIFA}\n`
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url; a.download = file; a.click()
      URL.revokeObjectURL(url)
      setBusy(false)
      setDone(true)
      setTimeout(() => setDone(false), 1800)
      notify(`Factura exportada: ${file}`)
    }, 700)
  }
  return (
    <button type="button" className="btn btn-top" onClick={run} disabled={busy}>
      {busy ? <LuRefreshCw className="spin" aria-hidden="true" /> : done ? <LuCheck className="pop" aria-hidden="true" /> : <LuDownload aria-hidden="true" />}{busy ? 'Exportando' : done ? 'Exportada' : 'Exportar factura'}
    </button>
  )
}

const STAT_NAMES = ['Factura actual', 'Consumo total', 'Tarifa energética']

function Banner({ month, setMonth, notify }) {
  const slider = useRef(null)
  const flash = useRef()
  const verDetalles = () => {
    const card = document.getElementById('plan')
    if (!card) return
    card.scrollIntoView({ block: 'nearest', behavior: prefersReduced() ? 'auto' : 'smooth' })
    card.focus({ preventScroll: true })
    card.classList.add('is-flash')
    clearTimeout(flash.current)
    flash.current = setTimeout(() => card.classList.remove('is-flash'), 2200)
  }
  const [slide, setSlide] = useState(0)
  const onSlide = () => {
    const el = slider.current
    const cards = el.children
    if (!cards.length) return
    const step = cards[1].offsetLeft - cards[0].offsetLeft
    setSlide(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 ? cards.length - 1 : Math.round(el.scrollLeft / step))
  }
  const goSlide = (i) => {
    const el = slider.current
    el.scrollTo({ left: el.children[i].offsetLeft - el.children[0].offsetLeft, behavior: prefersReduced() ? 'auto' : 'smooth' })
  }
  const t = monthTotals(month)
  const up = t.d > 0
  const big = t.p >= 5
  const summary = big
    ? `Tu factura subió ${cop(t.d * TARIFA)} porque consumiste más.`
    : `Tu factura casi no cambió frente a ${t.prevName.toLowerCase()}: ${signed(t.d * TARIFA, cop)}.`
  return (
    <header className="hero" id="resumen">
      <div className="hero-top">
        <p className="hello">¡Buenos días, Alex!</p>
        <div className="hero-actions">
          <Select id="mes-factura" label="Mes de la factura" value={month} onChange={setMonth} options={MESES.slice(1).map((m) => ({ value: m.id, label: m.name }))} />
          <ExportButton month={month} notify={notify} />
        </div>
      </div>
      <div className="hero-bg" aria-hidden="true"><div className="hero-scrim" /><img src={cafeteria} alt="" /></div>
      <div className="hero-body">
        <h1>Así va tu energía en {t.name.toLowerCase()}</h1>
        <dl className="stats" ref={slider} onScroll={onSlide}>
          <Stat label="Factura actual" icon={LuReceipt} n={t.now * TARIFA} fmt={cop} delta={`${pct(t.p)}, ${signed(t.d * TARIFA, cop)}`} down={!up} />
          <Stat label="Consumo total" icon={LuZap} term={<Term label="kWh"><b>kWh</b> es la unidad con la que se mide y se cobra la energía. Un equipo de 1.000 vatios encendido una hora gasta 1 kWh.</Term>} n={t.now} fmt={num} unit="kWh" delta={`${pct(t.p)}, ${signed(t.d, kwh)}`} down={!up} />
          <Stat label="Tarifa energética" term={<Term label="tarifa">La <b>tarifa</b> es lo que pagas por cada kWh. Si no sube, el aumento viene de cuánto consumiste.</Term>} n={TARIFA} fmt={cop} unit="/kWh" delta="No hay cambios" ok />
        </dl>
        <div className="slide-dots">
          {STAT_NAMES.map((n, i) => <button key={n} type="button" className={i === slide ? 'is-on' : ''} aria-label={`Ver ${n}`} aria-current={i === slide ? 'true' : undefined} onClick={() => goSlide(i)}><i /></button>)}
        </div>
        <p className="whatsup"><LuLightbulb aria-hidden="true" /><span><b>¿Qué está pasando?</b> {summary} <button type="button" className="text-cta" onClick={verDetalles}>Ver detalles</button></span></p>
      </div>
    </header>
  )
}

function Select({ id, label, value, onChange, options, dot, prefix }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const btn = useRef(null)
  const menu = useRef(null)
  const current = options.find((o) => o.value === value)
  const enabled = (i) => !options[i]?.disabled
  const show = () => { setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen(true) }
  const pick = (o) => { if (o.disabled) return; onChange(o.value); setOpen(false); btn.current?.focus() }
  const move = (dir, from = active) => {
    let i = from + dir
    while (i >= 0 && i < options.length && !enabled(i)) i += dir
    if (i >= 0 && i < options.length) setActive(i)
  }
  // Alinea el menú con el borde del select que deje más espacio, para que nunca se salga de la pantalla.
  useLayoutEffect(() => {
    if (!open || !menu.current || !btn.current) return
    const b = btn.current.getBoundingClientRect()
    const w = menu.current.offsetWidth
    const vw = document.documentElement.clientWidth
    const fitsLeft = b.left + w <= vw - 8
    menu.current.style.left = fitsLeft ? '0' : 'auto'
    menu.current.style.right = fitsLeft ? 'auto' : '0'
  }, [open])
  useEffect(() => {
    if (!open) return
    const extra = (menu.current?.getBoundingClientRect().bottom ?? 0) + 12 - innerHeight
    if (extra > 0) scrollBy({ top: extra, behavior: prefersReduced() ? 'auto' : 'smooth' })
    const away = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    addEventListener('pointerdown', away)
    return () => removeEventListener('pointerdown', away)
  }, [open])
  const onKey = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show() }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Home') { e.preventDefault(); move(1, -1) }
    else if (e.key === 'End') { e.preventDefault(); move(-1, options.length) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(options[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false) }
    else if (e.key === 'Tab') setOpen(false)
  }
  return (
    <div className={open ? 'select is-open' : 'select'} ref={root}>
      <button type="button" id={id} ref={btn} className="select-btn" role="combobox" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-menu`} aria-activedescendant={open ? `${id}-${options[active]?.value}` : undefined}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKey}>
        {dot && <i className={`dot ${dot}`} aria-hidden="true" />}
        {prefix && <span className="select-prefix">{prefix}</span>}
        <span aria-hidden={current?.short ? true : undefined}>{current?.short ?? current?.label}</span>{current?.short && <span className="sr">{current.label}</span>}
        <LuChevronDown className="select-chev" aria-hidden="true" />
      </button>
      {open && (
        <ul className="select-menu" id={`${id}-menu`} ref={menu} role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li key={o.value} id={`${id}-${o.value}`} role="option" aria-selected={o.value === value} aria-disabled={o.disabled || undefined}
              className={`select-opt${i === active ? ' is-active' : ''}${o.disabled ? ' is-off' : ''}`}
              onPointerEnter={() => enabled(i) && setActive(i)} onClick={() => pick(o)}>
              <span>{o.label}</span>{o.value === value && <LuCheck aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Sedes({ sede, setSede, onDetail, from, setFrom, to, setTo }) {
  const iFrom = MESES.findIndex((m) => m.id === from), iTo = MESES.findIndex((m) => m.id === to)
  const A = MESES[iFrom], B = MESES[iTo]
  const rows = SEDES.map((s) => ({ s, a: A.sedes[s.id], b: B.sedes[s.id], d: B.sedes[s.id] - A.sedes[s.id] }))
  const scale = Math.max(...rows.flatMap((r) => [r.a, r.b]))
  return (
    <section className="card" id="sedes" aria-labelledby="t-sedes">
      <div className="block-head">
        <h2 id="t-sedes"><LuStore aria-hidden="true" />Comparativa por sede</h2>
        <div className="month-pair">
          <Select id="mes-desde" dot="dot-before" label="Mes de comparación" value={from} onChange={setFrom} options={MESES.map((m, i) => ({ value: m.id, label: m.name, short: m.name.slice(0, 3), disabled: i >= iTo }))} />
          <Select id="mes-hasta" dot="dot-now" label="Mes actual" value={to} onChange={setTo} options={MESES.map((m, i) => ({ value: m.id, label: m.name, short: m.name.slice(0, 3), disabled: i <= iFrom }))} />
        </div>
      </div>
      <ul className="sedes">
        {rows.map(({ s, a, b, d }) => (
          <li key={s.id} className={sede === s.id ? 'sede is-on' : 'sede'}>
            <button type="button" className="sede-head" aria-pressed={sede === s.id} onClick={() => setSede(sede === s.id ? 'todas' : s.id)}>
              <span className="sede-title"><b>{s.name}</b><em className={d > 0 ? 'sede-delta up' : 'sede-delta down'}>{d >= 0 ? '+' : '−'}{kwh(d)}</em></span>
              <span className="sede-bars">
                {[[B, b, 'sbar-now'], [A, a, 'sbar-prev']].map(([m, val, cls]) => (
                  <span key={cls} className="sbar-row">
                    <span className="sbar-month" title={m.name}><span aria-hidden="true">{m.name.slice(0, 3)}</span><span className="sr">{m.name}</span></span>
                    <span className="sbar-track"><span className={`sbar ${cls}`} style={{ width: `${(val / scale) * 100}%` }} /></span>
                    <span className="sbar-val">{kwh(val)}</span>
                  </span>
                ))}
              </span>
            </button>
            <button type="button" className="link-btn sede-more" onClick={(e) => onDetail(s.id, e.currentTarget)} aria-label={`Ver más de ${s.name}`}>Ver más</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function niceMax(v) { const steps = [50, 100, 150, 200, 300, 400, 500]; return steps.find((x) => x >= v) ?? v }

function Horas({ sede, setSede, hour, setHour, noData, otherMonth, onResetDemo, onDetail }) {
  const s = getSede(sede)
  const [table, setTable] = useState(false)
  const [tip, setTip] = useState(false)
  const plot = useRef(null)
  const card = useRef(null)
  const firstSede = useRef(true)
  useEffect(() => {
    if (firstSede.current) { firstSede.current = false; return undefined }
    const el = card.current
    el?.classList.add('is-updated')
    const t = setTimeout(() => el?.classList.remove('is-updated'), 700)
    return () => clearTimeout(t)
  }, [sede])
  const top = niceMax(Math.max(...HOURS.map((h) => Math.max(s.hours[h].now, s.hours[h].prev))))
  const pick = (e) => {
    const r = plot.current.getBoundingClientRect()
    const i = Math.max(0, Math.min(23, Math.floor(((e.clientX - r.left) / r.width) * 24)))
    if (HOURS[i] !== hour) setHour(HOURS[i])
  }
  const onKey = (e) => {
    const i = HOURS.indexOf(hour)
    const go = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowUp: i + 1, ArrowDown: i - 1, Home: 0, End: 23, PageUp: i + 6, PageDown: i - 6 }[e.key]
    if (go === undefined) return
    e.preventDefault(); setHour(HOURS[Math.max(0, Math.min(23, go))])
  }
  const idx = HOURS.indexOf(hour)
  const v = s.hours[hour]
  const tipLeft = Math.min(84, Math.max(16, ((idx + .5) / 24) * 100))
  return (
    <section className="card card-chart" id="horas" ref={card} aria-labelledby="t-horas">
      <div className="block-head head-top">
        <div><h2 id="t-horas"><LuChartColumn aria-hidden="true" />Comportamiento energético</h2><p className="card-sub">kWh por hora en octubre</p></div>
        {!noData && (
          <button type="button" className="pill-btn" onClick={() => setTable((t) => !t)}>
            {table ? <LuChartColumn aria-hidden="true" /> : <LuTable2 aria-hidden="true" />}{table ? 'Ver como gráfica' : 'Ver como tabla'}
          </button>
        )}
      </div>

      {noData ? (
        <div className="empty">
          <LuClock aria-hidden="true" />
          <h3>{otherMonth ? `No hay detalle por hora de ${otherMonth.toLowerCase()}` : 'Todavía no hay datos por hora de octubre'}</h3>
          <p>{otherMonth ? 'Este detalle se guarda solo para el último mes. El resumen por sede sí está disponible.' : 'El medidor envía este detalle cada 24 horas. Mientras llega, el resumen por sede ya está completo.'}</p>
          <button type="button" className="btn" onClick={onResetDemo}>{otherMonth ? 'Ver octubre' : 'Ver el último detalle disponible'}</button>
        </div>
      ) : (
        <>
          <div className="chart-tools">
            {table ? <p className="table-note">Suma de todos los días del mes</p> : (
              <div className="legend view-swap">
                <span><i className="dot l-open" />Abierto</span>
                <span><i className="dot l-closed" />Cerrado</span>
                <span><i className="l-prev" />Septiembre</span>
              </div>
            )}
            <Select id="sede-horas" label="Sede de la gráfica" value={sede} onChange={setSede} options={[TODAS, ...SEDES].map((x) => ({ value: x.id, label: x.id === 'todas' ? 'Todas las sedes' : x.name }))} />
          </div>
          {table ? (
            <div className="view-swap table-view">
              <div className="table-wrap" tabIndex={0} role="region" aria-label={`Tabla de consumo por hora de ${s.name}`}>
                <table>
                  <caption className="sr">Consumo por hora de {s.name}, en kWh, sumando todos los días del mes</caption>
                  <thead><tr><th scope="col">Hora</th><th scope="col">Estado</th><th scope="col">Sep</th><th scope="col">Oct</th><th scope="col">Cambio</th></tr></thead>
                  <tbody>{HOURS.map((h) => {
                    const d = s.hours[h].now - s.hours[h].prev
                    return <tr key={h} className={h === hour ? 'is-sel' : ''}><td>{hourLabel(h)}</td><td>{isClosed(h) ? 'Cerrado' : 'Abierto'}</td><td>{kwh(s.hours[h].prev)}</td><td>{kwh(s.hours[h].now)}</td><td className={d > 0 ? 'up' : ''}>{d > 0 ? '+' : d < 0 ? '−' : ''}{kwh(d)}</td></tr>
                  })}</tbody>
                </table>
              </div>
            </div>
          ) : (
          <div className="view-swap chart-view">
          <div className="chart">
            <div className="yaxis" aria-hidden="true">
              {[1, .5, 0].map((t) => <span key={t} style={{ bottom: `${t * 100}%` }}>{num(top * t)}<em>{t === 1 ? ' kWh' : ''}</em></span>)}
            </div>
            <div className="plot" ref={plot} tabIndex={0} role="slider" aria-label={`Consumo por hora de ${s.name}. Usa las flechas para cambiar de hora.`}
              aria-valuemin={0} aria-valuemax={23} aria-valuenow={idx} aria-valuetext={`${hourLabel(hour)}: ${num(v.now)} kWh en octubre y ${num(v.prev)} en septiembre`}
              onKeyDown={onKey} onFocus={() => setTip(true)} onBlur={() => setTip(false)} onPointerEnter={() => setTip(true)} onPointerLeave={(e) => { if (e.pointerType !== 'touch') setTip(false) }}
              onPointerMove={pick} onPointerDown={pick}>
              <div className="closed-band" aria-hidden="true"><span>Local cerrado</span></div>
              {[1, .5].map((t) => <i key={t} className="gridline" style={{ bottom: `${t * 100}%` }} />)}
              <div className="bars" aria-hidden="true">
                {HOURS.map((h, i) => {
                  const d = s.hours[h]
                  return (
                    <div key={h} className={`bar-col ${h === hour ? 'is-sel' : ''}`}>
                      <i className={isClosed(h) ? 'bar bar-closed' : 'bar'} style={{ height: `${(d.now / top) * 100}%`, animationDelay: `${i * 14}ms` }} />
                      <i className="bar-prev" style={{ bottom: `${(d.prev / top) * 100}%` }} />
                    </div>
                  )
                })}
              </div>
              {tip && (
                <div className="tooltip chart-tip" style={{ left: `${tipLeft}%` }} aria-hidden="true">
                  <b>{hourLabel(hour)}</b><span>Octubre: {num(v.now)} kWh</span><span>Septiembre: {num(v.prev)} kWh</span>
                </div>
              )}
            </div>
            <div className="xaxis" aria-hidden="true">
              {[0, 6, 12, 18, 23].map((i) => <span key={i} style={{ left: `${((i + .5) / 24) * 100}%` }}>{shortHour(HOURS[i])}</span>)}
            </div>
          </div>
          </div>
          )}
        </>
      )}
    </section>
  )
}

const EQUIPO_ICON = { espresso: LuCoffee, horno: LuCookingPot, frio: LuRefrigerator, aire: LuAirVent, luz: LuLightbulb, otros: LuPlug }

const UNIDAD = { luz: 'luminarias', otros: 'aparatos' }

function Drawer({ id, onClose }) {
  const ref = useRef(null)
  const [closing, setClosing] = useState(false)
  useEffect(() => { ref.current?.showModal() }, [])
  const s = getSede(id)
  const finish = () => { ref.current?.close(); onClose() }
  const close = () => { if (prefersReduced()) return finish(); setClosing(true); setTimeout(finish, 200) }
  const equipos = EQUIPOS[id].map((q) => ({ ...q, d: q.oct - q.sep }))
  const sinAsignar = { key: 'sin', name: 'Sin asignar a un equipo', sub: 'Con el local cerrado', sep: 0, oct: s.offDelta, d: s.offDelta, off: true }
  const filas = [...equipos, sinAsignar].sort((a, b) => b.oct - a.oct)
  return (
    <dialog ref={ref} className={closing ? 'drawer is-closing' : 'drawer'} aria-labelledby="drawer-t" onCancel={(e) => { e.preventDefault(); close() }} onClick={(e) => { if (e.target === ref.current) close() }}>
      <div className="drawer-in">
        <div className="drawer-head">
          <h2 id="drawer-t">{s.name}</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Cerrar detalle"><LuX aria-hidden="true" /></button>
        </div>

        <div className="sede-render"><img src={RENDERS[id]} alt={`Render de ${s.name}`} /></div>

        <section aria-labelledby="d-equipos" className="d-equipos">
          <h3 id="d-equipos" className="h3-lg">Consumo por equipo</h3>
          <ul className="equipos">
            {filas.map((f, i) => {
              const Icon = f.off ? LuCircleHelp : EQUIPO_ICON[f.key]
              return (
                <li key={f.key} className={f.off ? 'equipo is-off' : 'equipo'} style={{ animationDelay: `${120 + i * 35}ms` }}>
                  <Icon className="equipo-ico" aria-hidden="true" />
                  <span className="equipo-name"><b>{f.name}</b><span>{f.off ? f.sub : `${f.units} ${UNIDAD[f.key] ?? (f.units === 1 ? 'equipo' : 'equipos')}`}</span></span>
                  <span className="equipo-val"><b>{num(f.oct)} <small>kWh</small></b><span className={f.d > 0 ? 'up' : ''}>+{kwh(f.d)}</span></span>
                </li>
              )
            })}
          </ul>
          <p className="d-unit">Consumo estimado de octubre según el inventario de la sede, y aumento frente a septiembre. El total es {kwh(s.now)}.</p>
        </section>
      </div>
    </dialog>
  )
}

function CausasModal({ status, setStatus, onClose }) {
  const ref = useRef(null)
  const [closing, setClosing] = useState(false)
  useEffect(() => { ref.current?.showModal() }, [])
  const finish = () => { ref.current?.close(); onClose() }
  const close = () => { if (prefersReduced()) return finish(); setClosing(true); setTimeout(finish, 160) }
  const last = useRef(null)
  const responder = (h, next) => { last.current = h.id; setStatus((st) => ({ ...st, [h.id]: next })) }
  useEffect(() => {
    if (last.current) ref.current?.querySelector(`[data-causa="${last.current}"] button`)?.focus()
  }, [status])
  const allOut = HIPOTESIS.every((h) => status[h.id] === 'no')
  return (
    <dialog ref={ref} className={closing ? 'modal is-closing' : 'modal'} aria-labelledby="causas-t" onCancel={(e) => { e.preventDefault(); close() }} onClick={(e) => { if (e.target === ref.current) close() }}>
      <div className="modal-in">
        <div className="modal-head">
          <div>
            <h2 id="causas-t">Posibles causas</h2>
            <p>Café Central, consumo con el local cerrado. Ninguna está comprobada: márcalas cuando las revises.</p>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Cerrar posibles causas"><LuX aria-hidden="true" /></button>
        </div>
        <ul className="causas" aria-live="polite">
          {HIPOTESIS.map((h) => {
            const st = status[h.id]
            return (
              <li key={h.id} data-causa={h.id} className={`causa st-${st}`}>
                <b>{h.title}</b>
                <span>{st === 'no' ? 'La descartaste.' : st === 'si' ? 'La confirmaste.' : h.why}</span>
                {st === 'pend' && <span className="causa-check">{h.check}</span>}
                <span className="causa-actions">
                  {st === 'pend' ? (
                    <>
                      <button type="button" className="pill-btn" onClick={() => responder(h, 'si')}><LuCheck aria-hidden="true" />Lo confirmé</button>
                      <button type="button" className="pill-btn" onClick={() => responder(h, 'no')}><LuX aria-hidden="true" />La descarté</button>
                    </>
                  ) : (
                    <button type="button" className="link-btn" onClick={() => responder(h, 'pend')}><LuUndo2 aria-hidden="true" />Cambiar respuesta</button>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
        {allOut && <p className="modal-note">Descartaste las tres. Conviene pedir una revisión eléctrica en Café Central.</p>}
      </div>
    </dialog>
  )
}

function Hallazgos({ from, to, status, setStatus }) {
  const [causas, setCausas] = useState(false)
  const opener = useRef(null)
  const A = MESES.find((m) => m.id === from), B = MESES.find((m) => m.id === to)
  const rows = SEDES.map((x) => ({ x, d: B.sedes[x.id] - A.sedes[x.id] }))
  const total = rows.reduce((a, r) => a + r.d, 0)
  const top = rows.reduce((a, r) => (r.d > a.d ? r : a))
  const isOct = to === 'oct'
  const confirmed = HIPOTESIS.find((h) => status[h.id] === 'si')
  const allOut = HIPOTESIS.every((h) => status[h.id] === 'no')
  return (
    <section className="card card-ai" id="plan" tabIndex={-1} aria-labelledby="t-plan">
      <div className="block-head"><h2 id="t-plan"><LuSparkles aria-hidden="true" />Hallazgos de Bia</h2></div>
      <ul className="findings">
        <li>
          <h3><LuMapPin aria-hidden="true" />Dónde</h3>
          {total >= 300
            ? <p>{top.x.name} concentra {num(top.d)} de los {num(total)} kWh adicionales ({Math.round((top.d / total) * 100)}%), unos {cop(top.d * TARIFA)} de la factura.</p>
            : <p>Entre {A.name.toLowerCase()} y {B.name.toLowerCase()} el consumo casi no cambió: {total >= 0 ? '+' : '−'}{kwh(total)} entre las tres sedes.</p>}
        </li>
        {isOct && (
          <>
            <li>
              <h3><LuClock aria-hidden="true" />Cuándo</h3>
              <p>Frente a septiembre, 840 de los 1.200 kWh extra de Café Central ocurrieron con el local cerrado, parejos toda la noche.</p>
            </li>
            <li>
              <h3><LuCircleHelp aria-hidden="true" />Por qué</h3>
              <p>{confirmed ? `Marcaste una causa: ${confirmed.label.toLowerCase()}.` : 'La causa aún no se conoce.'} <button type="button" className="link-btn inline" ref={opener} aria-haspopup="dialog" onClick={() => setCausas(true)}>Ver posibles causas</button></p>
            </li>
          </>
        )}
      </ul>
      {isOct ? (
        <div className="next">
          <h3>Recomendación</h3>
          <p>{allOut ? 'Pide una revisión eléctrica en Café Central, porque el consumo nocturno sigue sin explicación.' : `Revisa al cerrar qué queda encendido en Café Central. Si las noches vuelven al nivel de septiembre, podrías recuperar hasta ${cop(AHORRO)} al mes.`}</p>
        </div>
      ) : (
        <div className="next"><p>El detalle de horario y las posibles causas están disponibles al comparar con octubre.</p></div>
      )}
      {causas && <CausasModal status={status} setStatus={setStatus} onClose={() => { setCausas(false); opener.current?.focus() }} />}
    </section>
  )
}

function Skeleton() {
  return (
    <div className="skeleton" role="status" aria-label="Cargando tu factura">
      <i className="skel-banner" />
      <div className="skel-row"><i /><i /><i /></div>
    </div>
  )
}

function ErrorView({ onRetry }) {
  return (
    <div className="error-view" role="alert">
      <LuTriangleAlert aria-hidden="true" />
      <h1>No se pudo cargar tu factura de octubre</h1>
      <p>La conexión con los medidores se interrumpió. Tus datos no se perdieron. Reintenta para volver a cargarlos.</p>
      <button type="button" className="btn" onClick={onRetry}><LuRefreshCw aria-hidden="true" />Reintentar</button>
    </div>
  )
}

function DemoStates({ state, setState }) {
  const [open, setOpen] = useState(false)
  const opts = [['ready', 'Datos completos'], ['loading', 'Cargando'], ['error', 'Error de conexión'], ['nodata', 'Sin datos por hora']]
  return (
    <div className="demo">
      {open && (
        <fieldset className="demo-pop">
          <legend>Estado de la página</legend>
          {opts.map(([v, l]) => <label key={v}><input type="radio" id={`demo-${v}`} name="demo" checked={state === v} onChange={() => setState(v)} />{l}</label>)}
        </fieldset>
      )}
      <button type="button" className="demo-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}><LuSettings2 aria-hidden="true" />Estados de demo</button>
    </div>
  )
}

export function App() {
  const [state, setState] = useState('loading')
  const [sede, setSede] = useState('central')
  const [hour, setHour] = useState(23)
  const [month, setMonthState] = useState('oct')
  const [cmpFrom, setCmpFrom] = useState('sep')
  const [cmpTo, setCmpTo] = useState('oct')
  const setMonth = (id) => { setMonthState(id); setCmpTo(id); setCmpFrom(MESES[MESES.findIndex((m) => m.id === id) - 1].id) }
  const [status, setStatus] = useState({ horno: 'pend', nevera: 'pend', aseo: 'pend' })
  const [toast, setToast] = useState(null)
  const [drawer, setDrawer] = useState(null)
  const opener = useRef(null)
  const toastTimer = useRef()

  useEffect(() => { const t = setTimeout(() => setState((s) => (s === 'loading' ? 'ready' : s)), 800); return () => clearTimeout(t) }, [])
  const notify = useCallback((msg, undo) => {
    setToast({ msg, undo }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 5000)
  }, [])
  const retry = () => { setState('loading'); setTimeout(() => setState('ready'), 900) }
  const changeDemo = (v) => { setState(v); if (v === 'loading') setTimeout(() => setState((s) => (s === 'loading' ? 'ready' : s)), 2500) }
  const showContent = state === 'ready' || state === 'nodata'

  const goHours = () => document.getElementById('horas')?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' })

  const openDetail = (id, el) => { opener.current = el; setSede(id); setDrawer(id) }
  const closeDetail = () => { setDrawer(null); opener.current?.focus() }
  const toastEl = (
    <div className="toast-slot" aria-live="polite">
      {toast && (
        <div className="toast"><span>{toast.msg}</span>
          {toast.undo && <button type="button" onClick={() => { toast.undo(); setToast(null) }}>Deshacer</button>}
        </div>
      )}
    </div>
  )
  return (
    <div className="app">
      <a className="skip" href="#resumen">Saltar al contenido</a>
      <Rail />
      <MobileMenu />
      <main className="main">
        {state === 'error' && <ErrorView onRetry={retry} />}
        {state === 'loading' && <Skeleton />}
        {showContent && (
          <>
            <Banner month={month} setMonth={setMonth} notify={notify} />
            <div className="report-head">
              <div><h2>Analicemos tu consumo</h2><p className="card-sub">Descubre dónde y cuándo aumentó el consumo y qué puedes hacer al respecto.</p></div>
            </div>
            <div className="cards">
              <Sedes sede={sede} setSede={setSede} onDetail={openDetail} from={cmpFrom} setFrom={setCmpFrom} to={cmpTo} setTo={setCmpTo} />
              <Horas sede={sede} setSede={setSede} hour={hour} setHour={setHour} noData={state === 'nodata' || month !== 'oct'} otherMonth={month !== 'oct' ? monthTotals(month).name : null} onResetDemo={() => { setMonth('oct'); setState('ready') }} onDetail={openDetail} />
              <Hallazgos from={cmpFrom} to={cmpTo} status={status} setStatus={setStatus} />
            </div>
          </>
        )}
        <footer className="foot">
          <p className="footnote">Escenario ficticio con datos simulados. El reparto por sede y hora es un supuesto de esta demostración.</p>
          <DemoStates state={state} setState={changeDemo} />
        </footer>
      </main>
      {drawer && <Drawer id={drawer} onClose={closeDetail} />}
      {toastEl}
    </div>
  )
}
