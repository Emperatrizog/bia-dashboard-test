import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { data } from './data';
import { filterRows, channelFor } from './filters';
import { OWNERS, STAGES, CHANNELS, COMPANY } from './extras';
import { buildCsv, saveCsv } from './lib/csv';
import { sumValue, toShort } from './lib/format';
import { PhotosContext, TooltipLayer, Toast } from './components/Ui';
import { Sidebar, Header, FilterBar, Banner } from './components/Shell';
import { Kpis, AiSummary, OpportunitiesTable } from './components/Panels';
import { MonthsChart, StageBars, OriginColumns, ExecBars } from './components/Charts';
import { OpportunityDrawer, ExecutiveDrawer } from './components/Drawer';
import './styles.css';

const EMPTY = { query: '', stage: '', owner: '', channel: '', minimum: '' };
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function App() {
  const [period, setPeriod] = useState('oct');
  const [f, setF] = useState(EMPTY);
  const [sel, setSel] = useState(null); // { type: 'row' | 'exe', name }
  const [done, setDone] = useState({});
  const [log, setLog] = useState({});
  const [ov, setOv] = useState({}); // cambios de sesión por oportunidad: etapa, fecha, última actividad
  const [banner, setBanner] = useState(true);
  const [notice, setNotice] = useState('');
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [navClosed, setNavClosed] = useState(() => { try { return localStorage.getItem('olibia-nav') === '1'; } catch (e) { return false; } });
  const ret = useRef(null), noticeTimer = useRef(null), firstBusy = useRef(true);

  const d = data[period];
  // Filas efectivas del periodo: datos base + cambios de la sesión. Los canales se calculan sobre esta misma lista.
  const eff = useMemo(() => d.rows.map((r) => {
    const o = ov[period + r[0]];
    return o && (o.stage || o.date) ? [r[0], o.stage || r[1], r[2], r[3], o.date || r[4]] : r;
  }), [d, ov, period]);
  const rows = useMemo(() => filterRows(eff, f), [eff, f]);
  const total = sumValue(rows);
  const lastOf = useCallback((r) => (ov[period + r[0]] && ov[period + r[0]].last) || COMPANY[r[0]].last, [ov, period]);

  const say = useCallback((m) => {
    setNotice(m);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2800);
  }, []);

  // Carga inicial simulada y esqueleto breve del Resumen AI cuando cambian los datos visibles.
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);
  const sig = period + '|' + rows.map((r) => r[0] + r[1]).join(',');
  useEffect(() => {
    if (firstBusy.current) { firstBusy.current = false; return undefined; }
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 450);
    return () => clearTimeout(t);
  }, [sig]);

  const selRow = sel && sel.type === 'row' ? eff.find((r) => r[0] === sel.name) : null;
  const panel = (sel && sel.type === 'exe') || selRow ? sel : null;

  const open = (type, name, el) => {
    if (!sel) ret.current = el && el.dataset ? el.dataset.fid : null;
    setSel({ type, name });
  };
  const close = useCallback(() => {
    setSel(null);
    const fid = ret.current; ret.current = null;
    setTimeout(() => {
      const el = fid && document.querySelector(`[data-fid="${fid}"]`);
      if (el) el.focus();
    }, 0);
  }, []);
  useEffect(() => {
    if (!panel) return undefined;
    const key = (e) => { if (e.key === 'Escape' && !document.querySelector('.menu')) close(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [panel, close]);

  const toggleNav = () => setNavClosed((v) => { const n = !v; try { localStorage.setItem('olibia-nav', n ? '1' : '0'); } catch (e) { /* sin almacenamiento */ } return n; });
  const setFilter = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleFilter = (k, v) => setF((p) => ({ ...p, [k]: p[k] === v ? '' : v }));
  const clear = () => setF(EMPTY);
  const changePeriod = (p) => { setPeriod(p); setNotice(''); };
  const seeNegotiations = () => {
    setF({ ...EMPTY, stage: 'Negociación' });
    setTimeout(() => {
      const t = document.getElementById('tabla');
      if (t) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    }, 30);
  };

  async function exportCSV() {
    if (!rows.length) { say('No hay datos para exportar con estos filtros.'); return; }
    try {
      await saveCsv(`olibia-${period}.csv`, buildCsv(rows));
      say('CSV exportado con las oportunidades filtradas.');
    } catch (e) {
      say(e && e.code === 'declined' ? 'Exportación cancelada.' : 'No se pudo exportar el CSV. Inténtalo de nuevo.');
    }
  }

  const patch = (key, p) => setOv((o) => ({ ...o, [key]: { ...o[key], ...p } }));
  const addLog = (key, entry) => setLog((l) => ({ ...l, [key]: [entry, ...(l[key] || [])] }));
  const followup = () => {
    const key = period + selRow[0];
    setDone((x) => ({ ...x, [key]: true }));
    addLog(key, { t: 'Seguimiento realizado', s: 'Marcado desde el detalle.', w: 'ahora', o: selRow[3] });
    say('Seguimiento registrado en esta sesión.');
  };
  const action = ({ type, note, date }) => {
    const key = period + selRow[0], p = {};
    const label = { call: ['Llamada', 'Llamada registrada'], mail: ['Correo', 'Correo registrado'], meet: ['Reunión', 'Reunión registrada'] }[type];
    let title;
    if (type === 'advance') { p.stage = STAGES[STAGES.indexOf(selRow[1]) + 1]; title = `Etapa actualizada: ${p.stage}`; }
    else { p.last = label[0]; title = label[1]; }
    if (date) p.date = toShort(date);
    patch(key, p);
    addLog(key, { t: title, s: note || 'Sin nota.', w: 'ahora', o: selRow[3] });
    say('Acción guardada.');
  };
  const onPhoto = (name, file) => {
    if (!file.type.startsWith('image/')) { say('Selecciona un archivo de imagen.'); return; }
    if (file.size > 4e6) { say('La imagen es muy pesada (máximo 4 MB).'); return; }
    const r = new FileReader();
    r.onload = () => { setPhotos((p) => ({ ...p, [name]: r.result })); say(`Foto actualizada: ${name}`); };
    r.readAsDataURL(file);
  };

  const stageCounts = STAGES.map((n) => { const a = rows.filter((r) => r[1] === n); return [n, a.length, sumValue(a)]; });
  const channelCounts = CHANNELS.map((c) => { const a = rows.filter((r) => channelFor(r, eff) === c); return [c, a.length, sumValue(a)]; });
  const emptyViz = (
    <div className="empty vz"><p>Sin oportunidades con estos filtros.</p><button type="button" className="btn" onClick={clear}>Limpiar filtros</button></div>
  );

  return (
    <PhotosContext.Provider value={photos}>
      <a className="skip" href="#main">Saltar al contenido</a>
      <div className={'app' + (panel ? ' dr' : '') + (navClosed ? ' nc' : '')}>
        <Sidebar collapsed={navClosed} onToggle={toggleNav} say={say} />
        <main id="main" tabIndex={-1}>
          <header className="top">
            <Header period={period} onPeriod={changePeriod} onExport={exportCSV} />
            <FilterBar f={f} set={setFilter} clear={clear} />
          </header>
          <div className={'wrap' + (loading ? ' ld' : '')} aria-busy={loading}>
            {banner && <Banner onSee={seeNegotiations} onClose={() => setBanner(false)} />}
            <Kpis period={period} closed={d.closed} count={rows.length} total={total} />
            <AiSummary rows={rows} total={total} busy={busy} onSee={seeNegotiations} />

            <div className="grp">
              <div className="gh"><b>Rendimiento comercial</b><span>Depende del periodo seleccionado</span></div>
              <section className="ch">
                <div className="card dkc">
                  <div className="row"><div><h2>Cierres por mes · Equipo completo</h2><div className="sub">Barras: cierres · Línea discontinua: meta</div></div><span className="tag inv">Meta: 10</span></div>
                  <div className="viz"><MonthsChart labels={d.labels} values={d.history} period={period} onPeriod={changePeriod} /></div>
                  <div className="sub">Clic en una barra para ver ese periodo</div>
                </div>
                <div className="card">
                  <h2>Cierres por ejecutivo <small>Total del periodo</small></h2>
                  <ExecBars names={OWNERS} owners={d.owners} closed={d.closed} active={sel && sel.type === 'exe' ? sel.name : null} onOpen={(n, el) => open('exe', n, el)} />
                  <p className="sub cap">La barra completa equivale a los {d.closed} cierres del periodo. Clic en un ejecutivo para ver su detalle.</p>
                </div>
              </section>
            </div>

            <div className="grp">
              <div className="gh"><b>Análisis del pipeline</b><span>Depende de los filtros aplicados</span></div>
              <section className="ch">
                <div className="card">
                  <h2>Oportunidades por etapa</h2>
                  {rows.length ? <StageBars counts={stageCounts} total={rows.length} value={f.stage} onToggle={(v) => toggleFilter('stage', v)} /> : emptyViz}
                  <p className="sub cap">Oportunidades abiertas según los filtros. La barra completa equivale al total en vista ({rows.length}).</p>
                </div>
                <div className="card">
                  <h2>Origen de oportunidades abiertas</h2>
                  {rows.length ? <OriginColumns counts={channelCounts} total={rows.length} value={f.channel} onToggle={(v) => toggleFilter('channel', v)} /> : emptyViz}
                  <p className="sub cap">La altura completa equivale al total en vista ({rows.length}). Clic en una columna para filtrar.</p>
                </div>
              </section>
            </div>

            <OpportunitiesTable rows={rows} query={f.query} onQuery={(v) => setFilter('query', v)} selected={selRow ? selRow[0] : null}
              lastOf={lastOf} onOpen={(r, el) => open('row', r[0], el)} onExe={(n, el) => open('exe', n, el)} onClear={clear} />
            <p className="foot">Datos ficticios para el ejercicio de diseño · Sin conexión a sistemas de Bia/Olibia</p>
          </div>
        </main>
        {selRow && (
          <OpportunityDrawer key={period + selRow[0]} row={selRow} all={eff} period={period} done={!!done[period + selRow[0]]}
            log={log[period + selRow[0]] || []} last={lastOf(selRow)} onClose={close} onFollowup={followup} onAction={action}
            onExe={(n, el) => open('exe', n, el)} />
        )}
        {sel && sel.type === 'exe' && (
          <ExecutiveDrawer key={sel.name} name={sel.name} index={OWNERS.indexOf(sel.name)} data={data} period={period} all={eff}
            onClose={close} onOpen={(r, el) => open('row', r[0], el)} onPhoto={onPhoto} />
        )}
      </div>
      <div className="vh" aria-live="polite">{loading ? '' : `${rows.length} oportunidades abiertas en vista, valor ${total} millones de pesos.`}</div>
      <TooltipLayer />
      <Toast msg={notice} />
    </PhotosContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
