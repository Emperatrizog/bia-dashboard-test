import {build} from 'esbuild';
import fs from 'node:fs';
// Cambios respecto a la base: las fotos de prueba se incrustan como data URL (loader) y se enlaza la tipografía.
// Sin conexión, la página sigue funcionando y usa la fuente del sistema.
await build({entryPoints:['src/App.jsx'],bundle:true,minify:true,outdir:'dist',entryNames:'app',loader:{'.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
const js=fs.readFileSync('dist/app.js','utf8').replace(/<\/script/gi,'<\\/script');
const css=fs.readFileSync('dist/app.css','utf8');
const font='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">';
fs.writeFileSync('dist/index.html',`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Olibia · Dashboard comercial</title>${font}<style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`);
