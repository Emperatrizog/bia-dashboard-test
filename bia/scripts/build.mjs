// Empaqueta la app en un solo dist/index.html, listo para abrir o desplegar.
import * as esbuild from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const serve = process.argv.includes('--serve')
const options = {
  entryPoints: ['src/main.jsx'], bundle: true, loader: { '.webp': 'dataurl' }, minify: !serve, format: 'iife',
  jsx: 'automatic', target: 'es2020', outdir: 'dist', write: false,
  define: { 'process.env.NODE_ENV': serve ? '"development"' : '"production"' },
}
const html = readFileSync('index.html', 'utf8')
const write = (result) => {
  const out = (ext) => result.outputFiles.find((f) => f.path.endsWith(ext))?.text ?? ''
  mkdirSync('dist', { recursive: true })
  writeFileSync('dist/index.html', html
    .replace('<!--css-->', () => `<style>${out('.css')}</style>`)
    .replace('<!--js-->', () => `<script>${out('.js').replace(/<\/script/g, '<\\/script')}</script>`))
}
if (serve) {
  const ctx = await esbuild.context({ ...options, plugins: [{ name: 'html', setup: (b) => b.onEnd(write) }] })
  await ctx.watch()
  const { port } = await ctx.serve({ servedir: 'dist', port: 5173 })
  console.log(`Bia en http://localhost:${port}`)
} else {
  write(await esbuild.build(options))
  console.log('Listo: dist/index.html')
}
