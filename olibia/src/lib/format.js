// Utilidades de formato y fechas. Los datos usan fechas cortas ("28 oct") sin año.
const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const PERIODS = { oct: 'Octubre 2026', sep: 'Septiembre 2026' };
export const PERIOD_MONTH = { oct: 'Octubre', sep: 'Septiembre' };
// Textos de variación tal como vienen en la base original.
export const DELTA = { oct: '+2 frente a septiembre', sep: '−1 frente a agosto' };
export const MONTH_FULL = { Abr: 'Abril', May: 'Mayo', Jun: 'Junio', Jul: 'Julio', Ago: 'Agosto', Sep: 'Septiembre', Oct: 'Octubre' };
// Etiquetas de la gráfica que corresponden a un periodo con datos completos.
export const LABEL_PERIOD = { Oct: 'oct', Sep: 'sep' };

const parse = (s) => { const [d, m] = s.split(' '); return { day: Number(d), mon: MON.indexOf(m) }; };
export const toShort = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
export const dateValue = (s) => { const { day, mon } = parse(s); return mon * 100 + day; };
// "Hoy" simulado: el 26 del mes del periodo seleccionado.
export const todayFor = (period) => new Date(2026, period === 'oct' ? 9 : 8, 26);
export const todayIso = (period) => `2026-${period === 'oct' ? '10' : '09'}-26`;
export function daysUntil(s, period) {
  const { day, mon } = parse(s);
  return Math.round((new Date(2026, mon, day) - todayFor(period)) / 864e5);
}
export const rel = (n) => (n < -1 ? `hace ${-n} días` : n === -1 ? 'ayer' : n === 0 ? 'hoy' : n === 1 ? 'mañana' : `en ${n} días`);
export const sumValue = (rows) => rows.reduce((s, r) => s + r[2], 0);
