// Paridad con la base: los datos, los filtros, los canales y el CSV conservan su significado original.
// Ejecutar: npm test
import assert from 'node:assert/strict';
import { data } from '../src/data.js';
import { filterRows, channelFor } from '../src/filters.js';
import { buildCsv, CSV_HEADER } from '../src/lib/csv.js';
import { sumValue } from '../src/lib/format.js';

let n = 0;
const t = (name, fn) => { fn(); n += 1; console.log('✓', name); };

t('los cierres por ejecutivo suman los cierres del periodo', () => {
  for (const p of ['oct', 'sep']) assert.equal(data[p].owners.reduce((a, b) => a + b, 0), data[p].closed);
});
t('octubre: 8 oportunidades, $338 M, 2 en negociación con $143 M', () => {
  const rows = data.oct.rows;
  assert.equal(rows.length, 8);
  assert.equal(sumValue(rows), 338);
  const neg = filterRows(rows, { stage: 'Negociación' });
  assert.equal(neg.length, 2);
  assert.equal(sumValue(neg), 143);
});
t('canal de origen: se calcula con channelFor (4 / 3 / 1 en octubre)', () => {
  const rows = data.oct.rows;
  const by = (c) => rows.filter((r) => channelFor(r, rows) === c).length;
  assert.deepEqual([by('Outbound'), by('Referidos'), by('Inbound')], [4, 3, 1]);
  assert.equal(filterRows(rows, { channel: 'Inbound' })[0][0], 'Industrias Atlas');
});
t('filtro de valor: desde $30 M y desde $50 M', () => {
  const rows = data.oct.rows;
  assert.equal(filterRows(rows, { minimum: '30' }).length, 5);
  assert.equal(filterRows(rows, { minimum: '50' }).length, 3);
});
t('los filtros se combinan y la búsqueda ignora mayúsculas', () => {
  const rows = data.oct.rows;
  assert.equal(filterRows(rows, { owner: 'Ana López', stage: 'Propuesta' }).length, 1);
  assert.equal(filterRows(rows, { query: 'ATLAS' }).length, 1);
  assert.equal(filterRows(rows, { query: 'zzz' }).length, 0);
});
t('septiembre usa sus propias oportunidades, etiquetas y fechas', () => {
  assert.equal(data.sep.rows.length, 6);
  assert.deepEqual(data.sep.labels, ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']);
  assert.ok(data.sep.rows.every((r) => r[4].endsWith('sep')));
});
t('CSV: BOM, separador ";" y saltos \\r\\n, igual que la base', () => {
  const rows = data.oct.rows;
  const original = '﻿' + [['Empresa', 'Etapa', 'Valor mensual COP millones', 'Responsable', 'Proximo contacto'], ...rows].map((r) => r.join(';')).join('\r\n');
  assert.equal(buildCsv(rows), original);
  assert.deepEqual(CSV_HEADER, ['Empresa', 'Etapa', 'Valor mensual COP millones', 'Responsable', 'Proximo contacto']);
});

console.log(`\n${n} pruebas correctas`);
