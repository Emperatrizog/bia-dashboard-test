// Exportación idéntica a la base: separador ";", BOM UTF-8 y saltos \r\n.
export const CSV_HEADER = ['Empresa', 'Etapa', 'Valor mensual COP millones', 'Responsable', 'Proximo contacto'];
export const buildCsv = (rows) => '﻿' + [CSV_HEADER, ...rows].map((r) => r.join(';')).join('\r\n');

// Descarga local con un enlace temporal (igual que la base). Si la página corre dentro de la demo
// alojada en Claude, usa la capacidad de descargas de la plataforma, que pide confirmación al usuario.
export async function saveCsv(filename, text) {
  if (typeof window !== 'undefined' && window.claude && window.claude.use) {
    const host = await window.claude.use('downloads');
    if (!host) throw new Error('unavailable'); // en la demo alojada, sin descargas no se avisa un éxito falso
    await host.save({ filename, data: text });
    return;
  }
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
