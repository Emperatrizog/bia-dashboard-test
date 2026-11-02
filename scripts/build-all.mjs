// Compila ambas tareas y copia cada demo a docs/, la carpeta que publica GitHub Pages.
import { execSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'

for (const project of ['olibia', 'bia']) {
  execSync('npm run build', { cwd: project, stdio: 'inherit' })
  copyFileSync(`${project}/dist/index.html`, `docs/${project}/index.html`)
}
console.log('Demos actualizadas en docs/')
