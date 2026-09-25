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
| `/join/[code]` | entrada por invitacion |
| `/(app)/events`, `/events/new`, `/events/[id]`, `/profile` | la app, dentro de `AppShell` |

Estados vacios como `/events/empty` son rutas propias, para poder linkearlas desde el canvas.

**Nunca dejar una pantalla en `/`**: su iframe cargaria el canvas dentro de si mismo.

## Donde viven las reglas

Este archivo no repite valores — se desactualizan sin que nadie lo note. Dice donde mirar:

| Si vas a... | Leelo primero |
|---|---|
| dibujar un input o un boton primario | `lib/form-styles.ts` — **manda sobre cualquier cosa que dibujes a mano** |
| usar colores, radios o tipografia | `app/globals.css` (`:root` y `@theme inline`) |
| armar una card | la utilidad `.splitit-card` en `app/globals.css` |
| usar un componente de UI | `components/ui/` — shadcn ya instalado, no traer otra libreria |
| poner un icono | `lucide-react`; los de evento estan tipados en `lib/event-icons.ts` |
| necesitar datos | `lib/mock-data.ts` (`mockEvents`, `calculateBalances`, `formatCurrency`, `getInitials`) y `lib/types.ts` |
| sumar o mover una pantalla del canvas | `lib/prototype-map.ts` — unica fuente de verdad del mapa |
| construir una pantalla nueva | la skill `construir-pantalla` de `splitit-agents` |

Antes de escribir estilos nuevos, buscar si ya existen:

```bash
grep -rn "primaryButtonClass\|fieldClass\|splitit-card" components app
```

## Convenciones que no estan en ningun archivo

- **Verde = recibe, violeta = debe.** Saldo en cero, texto neutro. Vale en toda la app.
- **Mobile primero.** Se revisa a 390px de ancho antes que en desktop.
- La navegacion de la app vive en `AppShell` (logo + menu). Las pantallas de acceso y la
  landing tienen su propia cabecera y no lo usan.
- Los componentes compartidos entre dos pantallas se extraen a `components/` — el `Logo`
  salio de ahi cuando la landing necesito el mismo que `AppShell`.

## Que no hacer

- No cerrar issues desde una PR de este repo.
- No inventar un boton o un input propio pudiendo usar `lib/form-styles.ts`.
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
   test que ahora cubre el bug.

Cada bug arreglado deja su test: asi la suite crece con bugs reales y el mismo bug
no vuelve.
