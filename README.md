# Prueba Design Engineer: Bia y Olibia

Dos tareas en React con datos simulados, sin backend ni servicios reales de AI.

**Demo:** https://emperatrizog.github.io/olibia-dashboard/

| Tarea | Demo | Código |
|---|---|---|
| 1. Uplift de Olibia | [Abrir](https://emperatrizog.github.io/olibia-dashboard/olibia/) | [`olibia/`](./olibia) |
| 2. Experiencia para Bia | [Abrir](https://emperatrizog.github.io/bia-app/) | [`bia/`](./bia) |

## Instrucciones

Requiere Node.js 20 o superior.

```sh
npm run setup        # instala las dependencias de ambas tareas
npm run dev:olibia   # Olibia en http://localhost:3000
npm run dev:bia      # Bia en http://localhost:5173
npm run test:olibia  # pruebas de paridad de Olibia
npm run build        # compila ambas y actualiza docs/
```

La carpeta `docs/` contiene la página de acceso y ambas demos ya compiladas. Para publicarla en GitHub Pages: *Settings → Pages → Deploy from a branch → rama `main`, carpeta `/docs`*.

---

# Tarea 1: Olibia

Parte del dashboard React entregado y lo transforma en diseño, estructura e interacción, conservando el significado de los datos y las acciones útiles.

## Qué probar
1. **Cambiar de periodo** con el selector, o haciendo clic en la barra «Sep» de Cierres por mes. Septiembre trae sus propias oportunidades, etapas y fechas.
2. **Filtrar** desde los selectores, desde el buscador de la tabla o haciendo clic en una etapa o un canal de las gráficas. Los filtros activos aparecen como chips que se quitan uno a uno.
3. **Explorar una oportunidad** con «Ver»: se abre un panel lateral sin perder el dashboard. Prueba «Marcar seguimiento realizado», registrar una acción y avanzar de etapa.
4. **Abrir un ejecutivo** desde Cierres por ejecutivo, desde la tabla o desde el detalle de una oportunidad.
5. **Teclado y movimiento:** `Tab` desde el inicio (enlace «Saltar al contenido»), `Esc` para cerrar el panel (el foco vuelve a donde estabas) y las barras de las gráficas son botones. Con «reducir movimiento» activado en el sistema se desactivan las animaciones.
6. **Estados:** carga inicial, resumen AI recalculándose, filtros sin resultados, y exportación del CSV con confirmación.
7. **Móvil:** por debajo de 800 px el menú pasa a una barra inferior con etiquetas; por debajo de 640 px la tabla pasa a tarjetas y el panel ocupa casi toda la pantalla.

## Decisiones
Pasé de un tablero plano a un cuadro de mando que se lee en el orden de las decisiones: filtros fijos, indicadores, resumen AI, rendimiento y pipeline. Uso verde profundo con lima solo donde importa (la meta, el periodo actual y las acciones principales); el resto queda en calma. Separé «Rendimiento comercial» (depende del periodo) de «Análisis del pipeline» (depende de los filtros), porque la base los mezclaba y obligaba a leer una nota para saber qué se filtraba. Las barras usan una escala con referencia explícita, el total en vista, así cuatro etapas con dos oportunidades ya no parecen metas cumplidas. Las gráficas filtran, las filas abren un panel lateral que no hace perder el contexto y cada acción se confirma. Todo se puede operar con teclado y sin hover; hay estados de carga, vacío y error, y el movimiento se reduce si el sistema lo pide. Conservé datos, filtros, canales, CSV y acciones de la base. Los cambios de etapa, fecha y seguimiento viven solo durante la sesión.

## Qué se conserva de la base
`olibia/src/data.js` y `src/filters.js` están sin cambios. | Elemento | Comportamiento original conservado |
|---|---|
| Periodos | Octubre y Septiembre, cada uno con sus oportunidades, etiquetas e histórico |
| Canal | Calculado con `channelFor` |
| Filtros | Etapa, responsable, canal y valor («Desde $30 M / $50 M»), combinables, más búsqueda global |
| Limpiar filtros | También borra la búsqueda |
| Banner | «Ver negociaciones» filtra por esa etapa; se puede cerrar |
| Resumen AI | Simulado, con textos distintos si hay o no negociaciones y mensaje para vista vacía |
| CSV | Separador `;`, BOM UTF-8, `\r\n`, archivo `olibia-{periodo}.csv`, solo las filas filtradas |
| Seguimiento | «Marcar seguimiento realizado», solo durante la sesión |

`npm run test:olibia` verifica que se mantienen.

## Añadido sobre la base
Menú lateral contraíble (el estado se recuerda en el navegador) con sesión y cierre de sesión (solo Dashboard está diseñado; el resto avisa «vista pendiente»), filtros activos, panel de detalle con pestañas, vista de ejecutivo con comparación Octubre / Septiembre (datos reales de `owners`), tooltips accesibles, tabla ordenable, estados de carga, vacío y error, y fotos de prueba de los ejecutivos con opción de cambiarlas durante la sesión.

Los datos del detalle (descripción, contacto, archivos, historial) y «última actividad» son simulados y viven en `src/extras.js`; no alteran los datos base.

## Estructura
- `src/App.jsx`: estado, filtros globales y composición.
- `src/components/`: `Shell` (menú, encabezado, filtros, banner), `Panels` (KPIs, resumen AI, tabla), `Charts`, `Drawer` (detalle de oportunidad y de ejecutivo), `Ui` (íconos, avatares, tooltip, avisos).
- `src/lib/`: formato de fechas y exportación CSV.
- `src/data.js`, `src/filters.js`: base original, sin cambios.
- `src/extras.js`: datos simulados complementarios.
- `build.mjs`: compilación y HTML autónomo (se añadió el cargador de imágenes y el enlace a la tipografía).
- `tests/parity.mjs`: pruebas de paridad con la base.

## Herramientas y AI
React 19 y esbuild (los de la base), sin librerías adicionales. Diseñé e iteré el diseño con Claude (Anthropic) como asistente: exploración de layout, prototipo HTML, portado a componentes React y pruebas en navegador. Las fotos de los ejecutivos son imágenes de prueba aportadas por mí.

## Qué refiné personalmente
Partí de la propuesta inicial y la dirigí hacia una versión más clara y amable:

- **Visual:** volví al tamaño de tipografía y al radio de borde de la primera versión, cambié el verde lima de «Cierres del mes» por blanco y reemplacé los avatares ilustrados por fotos reales de los ejecutivos.
- **Estructura:** fijé la barra de filtros arriba por utilidad, puse el selector de periodo con título como en la base, reordené los indicadores (meta, cierres, valor, oportunidades), separé las gráficas por periodo y por filtros, y pedí escala compartida en las barras.
- **Interacción:** que cualquier ejecutivo abra su detalle, quitar el menú de tres puntos y dejar solo «Ver», tooltips blancos con sombra suave, ícono de engranaje, menú de cierre de sesión y menú lateral contraíble.
- **Criterio:** revisé el diseño contra los criterios de la prueba y decidí portarlo al proyecto React entregado sin perder funcionalidad.
- **Calidad:** detecté y pedí corregir detalles, como una barra que se sobreponía a los filtros, el «Meta del mes» del menú que no existía en la base y la vista móvil (tabla, barra inferior y avisos).

## Tiempo dedicado
**Unas 8 horas en total**, repartidas en varias tandas a lo largo de día y medio:

- **~4 h de UX:** entender y organizar la estructura a partir de mi sketch de baja fidelidad, decidir la jerarquía de la información (indicadores, gráficas, tabla y detalle) y revisar el diseño contra los criterios de la prueba.
- **~4 h de desarrollo e iteración con Claude:** prototipos y adaptación al proyecto React entregado sin perder funcionalidad, pruebas en navegador y ajustes de detalle (menú contraíble, vista móvil, tooltips y estados).

## Limitaciones
- Datos ficticios y estado solo de sesión: al recargar, vuelve todo al origen.
- Solo «Dashboard» está diseñado en el menú; Oportunidades, Empresas, Contactos, Reportes y Configuración muestran un aviso.
- Los periodos con datos completos son Octubre y Septiembre; los demás meses de la gráfica solo muestran su cierre histórico.
- La tipografía Plus Jakarta Sans se carga desde Google Fonts; sin conexión se usa la del sistema.

---

# Tarea 2: Bia

Una página para que una persona que administra tres cafeterías entienda por qué subió su factura y qué hacer.

## Qué probar
1. **Entender la factura:** las tres cifras y «¿Qué está pasando?». «Ver detalles» lleva a los hallazgos y los resalta.
2. **Cambiar de mes** con el selector del encabezado o comparar meses en Consumo por sede.
3. **Explorar por sede:** elige una sede para actualizar la gráfica. «Ver más» abre su consumo por equipo.
4. **Explorar por hora:** recorre la gráfica con el mouse o las flechas, o cámbiala por una tabla.
5. **Posibles causas:** ábrelas desde Hallazgos, confírmalas o descártalas. Si descartas las tres, cambia la recomendación.
6. **Exportar factura:** descarga un CSV de ejemplo con confirmación.
7. **Estados:** el botón «Estados de demo», al pie de la página, muestra carga, error y falta de datos.
8. **Móvil:** menú hamburguesa y cifras en un slide. Con «reducir movimiento» activado, las animaciones se reducen al mínimo.

## Decisiones
Prioricé que una persona sin conocimientos de energía entienda en segundos qué pasó: la factura subió porque aumentó el consumo, no la tarifa. Por eso el encabezado responde antes de pedir que se explore. Luego, tres tarjetas guían la lectura: en qué sede subió, a qué hora y qué significa. Los hallazgos terminan en una recomendación concreta, y las posibles causas se abren en un modal para confirmarlas o descartarlas.

Separé hechos de hipótesis: el consumo nocturno sin explicar queda sin asignar y el ahorro siempre es condicional. Puse la expresividad en los renders de las cafeterías, que conectan los datos con un negocio real, y mantuve sobrias las cifras y las gráficas. El color tiene significado: verde para abierto, morado para cerrado y coral para los aumentos. Las transiciones muestran qué cambió, y todo funciona con teclado, en móvil y con movimiento reducido.

Mantuve el siguiente paso como una sola recomendación, sin lista de tareas, porque la persona tiene pocos minutos para decidir.

## Herramientas y AI
React 19, esbuild, react-icons e Inter. Diseñé e iteré con Claude (Anthropic) como asistente, a partir de un sketch propio y de referencias visuales tomadas de bia.app: implementación en React, alternativas de diseño, borradores de texto y pruebas en navegador. Los renders de las cafeterías son imágenes aportadas por mí.

## Qué refiné personalmente
La estructura a partir del sketch, el encabezado y los renders, la jerarquía tipográfica y los espaciados, los colores de la gráfica y la simplificación de los hallazgos.

## Tiempo dedicado
**Unas 6,5 horas en total:** 2 horas de investigación y UX para definir el sketch y los datos, y unas 4,5 horas de construcción y refinamiento con Claude.

## Limitaciones
- **Datos:** del enunciado salen la factura, el consumo, la tarifa y los 1.200 de los 1.500 kWh adicionales en una sede. El resto es un supuesto coherente: julio y agosto, el reparto de las otras sedes, el horario, el perfil por hora, los 840 kWh de Café Central con el local cerrado y el consumo por equipo. Los $672.000 de ahorro posible salen de 840 kWh × $800.
- **Menú:** solo Inicio está diseñado. Las demás opciones avisan que no están incluidas.
- **Detalle por hora:** existe solo para octubre.
- **Sesión:** las respuestas sobre las causas se pierden al recargar.
