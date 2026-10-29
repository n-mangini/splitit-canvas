# SplitIt · prototipo

## Qué es este repo

Un **prototipo navegable** de SplitIt: pantallas reales, datos de ejemplo, sin backend.
Existe para que el equipo pueda *ver* cada historia del backlog antes de construirla, y
reemplaza al Figma como referencia visual.

**No es el incremento.** No se despliega a produccion, no se extiende: el equipo lo
reimplementa en el front real. De ahi salen dos reglas que no se negocian:

- Las PR de este repo **nunca cierran issues** de `SplitItLab/roadmap`. Nada de `Closes`,
  `Fixes` ni `Resolves` — se nombra la historia como texto (`SPLT-018`) y listo. La historia
  la cierra el PO cuando el equipo la implementa en el front.
- Lo que se construye aca es **descartable**. El esfuerzo tiene que seguir a *cuantas
  decisiones de producto carga* lo que se esta haciendo. Una pantalla que define un flujo
  merece iteracion; un fondo decorativo se mira y se aprueba a ojo.

## El producto

Gastos compartidos entre amigos. El usuario crea un **evento** (un viaje, un cumple), suma
**gastos** con quien pago y entre quienes se divide, y ve los **saldos** de cada integrante.
Los invitados entran por link, sin crear cuenta.

Copy de la interfaz **siempre en español**.

## Como se navega

La raiz abre el canvas, no la app:

| Ruta | Que es |
|---|---|
| `/` | redirige a `/canvas` |
| `/canvas` | la grilla de artboards, agrupada por epica |
| `/canvas/SPLT-XXX` | la ficha de una historia: su pantalla + link a los criterios |
| `/inicio` | la landing (vive fuera de `/` justamente porque `/` es del canvas) |
| `/login`, `/register` | acceso |
| `/eventos`, `/eventos/[id]`, `/perfil` | la app, con las mismas rutas que el front oficial |
| `/eventos/invitacion/[token]` | entrada por invitacion |
| `/join/[token]/...` | pasos de invitacion que el front oficial todavia no tiene |

Los estados que el front oficial resuelve dentro de la pantalla se piden por query para
poder linkearlos desde el canvas: `?modal=crear|editar|eliminar|invitar|gasto`,
`?tab=saldos|integrantes`, `?escenario=vacio|sin-sesion|sin-integrantes|ya-vinculado`.

**Nunca dejar una pantalla en `/`**: su iframe cargaria el canvas dentro de si mismo.

## De donde salen las pantallas

Las pantallas ya implementadas son **copia del front oficial** (`SplitItLab/SplitIt`,
`web/` en `main`): `components/`, `components/ui/`, `lib/` y `app/globals.css` se copian
tal cual. Para volver a sincronizar se copian de nuevo esos archivos y se reaplican los
agregados del canvas, que son pocos y estan marcados con un comentario `Canvas:`.

| Si vas a... | Leelo primero |
|---|---|
| tocar los datos de ejemplo o un escenario | `lib/mock-api.ts` — responde las rutas de la API real; `lib/api.ts` lo usa en vez de la red |
| abrir un estado desde la direccion | `lib/canvas-state.ts` |
| usar colores, radios o tipografia | `app/globals.css` (el del front oficial) |
| usar un componente de UI | `components/ui/` — los mismos del front oficial, no traer otra libreria |
| sumar o mover una pantalla del canvas | `lib/prototype-map.ts` — unica fuente de verdad del mapa |
| construir una pantalla nueva | la skill `construir-pantalla` de `splitit-agents` |

Una historia que el front oficial todavia no tiene se construye con sus mismos componentes
(como el boton de Google de SPLT-019 o `/join/...` de SPLT-022), para que se vea parte de
la misma app.

## Convenciones que no estan en ningun archivo

- **Mobile primero.** Se revisa a 390px de ancho antes que en desktop.
- Lo que ya esta en el front oficial no se rediseña aca: si hay que cambiarlo, se cambia
  alla y se vuelve a copiar.

## Que no hacer

- No cerrar issues desde una PR de este repo.
- No inventar un boton o un input propio pudiendo usar los de `components/ui/`.
- No agregar dependencias de UI: shadcn + lucide alcanzan.
- No usar capturas de pantalla como contenido del canvas. El canvas muestra pantallas vivas.
- No dejar una pantalla del prototipo en `/`.
- No mostrar avance de desarrollo en el canvas: eso vive en la herramienta del PM.
- No hablarle al PO de archivos ni de componentes. Se reporta lo que se ve en pantalla y que
  criterio cierra.

## Reportes de QA desde Slack

Los bugs se reportan con Ybug (el boton flotante, solo en el deploy) y llegan a
`#qa-splitit`. Ahi alguien etiqueta a `@Claude` en el hilo. Este es el trabajo:

1. **Entender el reporte.** El mensaje de Ybug trae un resumen y un link; si el link
   no abre, trabajar con lo que dice el hilo. Si no alcanza para reproducir, pedir en
   el hilo los pasos que faltan. No adivinar.
2. **Ubicar la historia.** La URL del reporte lleva a la pantalla; `lib/prototype-map.ts`
   dice de que historia es, y la issue en `SplitItLab/roadmap` tiene sus criterios.
3. **Clasificar**, y decirlo en el hilo antes de tocar nada:
   - **Bug**: la pantalla contradice un criterio de aceptacion, o esta objetivamente
     rota (no carga, un boton no hace nada, un numero mal calculado). Se arregla.
   - **Cambio de alcance**: "estaria bueno que...", o algo que ningun criterio pide.
     No se toca: se responde que es decision del PO y se termina.
   - **No reproducible**: se dice que se probo y se piden mas datos.
4. **Test primero.** Escribir en `e2e/` un test que reproduzca el bug y **falle**,
   nombrado por el flujo y con la historia en un comentario, como
   `e2e/detalle-evento.spec.ts`. Correrlo y confirmar que falla por el bug y no
   por el armado del test.
5. **Arreglar lo minimo.** Solo el bug: nada de refactors ni limpieza al pasar.
   Correr `pnpm test:e2e` completo; tiene que pasar todo.
6. **Commitear y subir la rama.** El PR se abre solo al subirla (lo abre un
   workflow, no una persona): no usar el boton del hilo. Por eso el primer commit
   de la rama lleva el titulo del PR, `Ybug #<N>: <que se arreglo>` (con `N` el
   numero del reporte, el `#1` de `[splitit-canvas] #1`), y en el cuerpo la
   historia, el criterio, el test que lo cubre y el link al hilo. Sin `Closes`
   (ver arriba). Nunca se mergea desde la sesion.
7. **Cerrar en el hilo**: que historia y que criterio, que se cambio, y el nombre del
   test que ahora cubre el bug. Avisar que el PR se abre solo desde la rama y **no
   sugerir el boton "Create PR"** ni pedirle a nadie que abra el PR.

Cada bug arreglado deja su test: asi la suite crece con bugs reales y el mismo bug
no vuelve.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
