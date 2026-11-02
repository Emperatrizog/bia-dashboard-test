import sedeCentral from './assets/sede-central.webp'
import sedeNorte from './assets/sede-norte.webp'
import sedeSur from './assets/sede-sur.webp'

// Escenario ficticio. Los totales salen del enunciado; el reparto por sede y por hora es simulado.
export const TARIFA = 800
export const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5] // de apertura a apertura
export const isClosed = (h) => h >= 20 || h < 6

const OPEN_W = [.5, .8, 1, 1.05, .95, .85, 1, 1.05, .9, .85, .95, 1.05, .9, .6]
const OFF_W = [1.7, 1.2, 1, .95, .9, .85, .85, .85, .85, 1.1]

// Reparte un entero según pesos sin perder unidades (mayor residuo).
function allocate(total, w) {
  const sum = w.reduce((a, b) => a + b, 0)
  const raw = w.map((x) => (x / sum) * total)
  const out = raw.map(Math.floor)
  let left = total - out.reduce((a, b) => a + b, 0)
  raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) out[i]++ })
  return out
}

function profile(prev, now, offPrev, offNow) {
  const flat = (offNow - offPrev) / 10
  const offP = allocate(offPrev, OFF_W)
  const prevArr = [...allocate(prev - offPrev, OPEN_W), ...offP]
  const nowArr = [...allocate(now - offNow, OPEN_W), ...offP.map((v) => v + flat)]
  return Object.fromEntries(HOURS.map((h, i) => [h, { prev: prevArr[i], now: nowArr[i] }]))
}

const make = (id, name, prev, now, offPrev, offNow) => ({
  id, name, prev, now, offPrev, offNow, delta: now - prev, offDelta: offNow - offPrev,
  openDelta: now - prev - (offNow - offPrev), hours: profile(prev, now, offPrev, offNow),
})

export const SEDES = [
  make('central', 'Café Central', 2000, 3200, 300, 1140),
  make('norte', 'Café Norte', 2000, 2200, 320, 380),
  make('sur', 'Café Sur', 2000, 2100, 340, 360),
]

const sum = (k) => SEDES.reduce((a, s) => a + s[k], 0)
export const TODAS = {
  id: 'todas', name: 'Todas las sedes', prev: sum('prev'), now: sum('now'), offPrev: sum('offPrev'), offNow: sum('offNow'),
  delta: sum('delta'), offDelta: sum('offDelta'), openDelta: sum('openDelta'),
  hours: Object.fromEntries(HOURS.map((h) => [h, {
    prev: SEDES.reduce((a, s) => a + s.hours[h].prev, 0),
    now: SEDES.reduce((a, s) => a + s.hours[h].now, 0),
  }])),
}
export const getSede = (id) => SEDES.find((s) => s.id === id) ?? TODAS

export const AHORRO = SEDES[0].offDelta * TARIFA // lo que costó de más la noche en Central

export const HIPOTESIS = [
  { id: 'horno', fix: 'lo del horno o el calentador', label: 'Horno', title: 'El horno o el calentador quedan encendidos',
    why: 'El consumo extra es casi igual todas las horas de la noche, como un equipo que nadie apagó.',
    check: 'Al cerrar, revisa si el horno y el calentador quedan apagados.' },
  { id: 'nevera', fix: 'lo de la nevera', label: 'Nevera', title: 'La nevera está trabajando de más',
    why: 'Una puerta mal cerrada o un sello gastado hacen que funcione toda la noche, aunque una nevera siempre gasta algo.',
    check: 'Mira si la puerta sella bien y si el motor para en algún momento.' },
  { id: 'aseo', fix: 'lo del turno de aseo', label: 'Equipos de aseo', title: 'Hay un turno nuevo de aseo o de preparación',
    why: 'Explicaría actividad después del cierre, aunque un turno suele durar pocas horas y este consumo dura diez.',
    check: 'Pregunta al equipo de Café Central si algo cambió en octubre.' },
]

// Histórico mensual simulado por sede. Septiembre y octubre son los del enunciado.
export const MESES = [
  { id: 'jul', name: 'Julio', sedes: { central: 1980, norte: 2010, sur: 1990 } },
  { id: 'ago', name: 'Agosto', sedes: { central: 2020, norte: 1990, sur: 2010 } },
  { id: 'sep', name: 'Septiembre', sedes: { central: 2000, norte: 2000, sur: 2000 } },
  { id: 'oct', name: 'Octubre', sedes: { central: 3200, norte: 2200, sur: 2100 } },
]

// Desglose estimado por inventario. Septiembre suma lo de cada sede; en octubre, lo que falta queda sin asignar.
const eq = (key, name, units, sep, oct) => ({ key, name, units, sep, oct })
export const EQUIPOS = {
  central: [eq('espresso', 'Máquinas de espresso', 2, 520, 610), eq('frio', 'Neveras y vitrinas', 4, 460, 530), eq('horno', 'Hornos', 1, 420, 490), eq('aire', 'Aire acondicionado', 2, 300, 380), eq('luz', 'Iluminación', 24, 180, 210), eq('otros', 'Molinos y otros', 5, 120, 140)],
  norte: [eq('espresso', 'Máquinas de espresso', 2, 540, 580), eq('frio', 'Neveras y vitrinas', 3, 470, 490), eq('horno', 'Hornos', 1, 400, 425), eq('aire', 'Aire acondicionado', 1, 270, 300), eq('luz', 'Iluminación', 18, 200, 210), eq('otros', 'Molinos y otros', 4, 120, 135)],
  sur: [eq('espresso', 'Máquinas de espresso', 1, 510, 535), eq('frio', 'Neveras y vitrinas', 3, 480, 490), eq('horno', 'Hornos', 1, 430, 445), eq('aire', 'Aire acondicionado', 1, 260, 280), eq('luz', 'Iluminación', 16, 200, 205), eq('otros', 'Molinos y otros', 4, 120, 125)],
}
// Render 3D de cada sede.
export const RENDERS = { central: sedeCentral, norte: sedeNorte, sur: sedeSur }
