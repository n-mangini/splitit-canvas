// Mapa del prototipo: historia -> pantalla -> issue.
//
// Unica fuente de verdad del canvas. Habla solo el lenguaje del backlog de
// producto (SPLT / GitHub). Los tickets de Linear apuntan hacia aca; este
// archivo nunca apunta hacia Linear.
//
// Es lo unico que hay que mantener cuando se agrega o cambia una pantalla.

export const ISSUES_BASE = 'https://github.com/SplitItLab/dirproy/issues'

export type Story = {
  id: string
  title: string
  issue: number
}

export type Screen = {
  route: string
  title: string
  epic: string
  stories: Story[]
  /** Fuera del canvas por ahora: la pantalla existe pero no se muestra. */
  hidden?: boolean
  /**
   * Arte propio de la pantalla, servido desde `public/`. Va solo lo que el dev
   * no puede obtener de otro lado: ilustraciones y fondos dibujados para el
   * producto. Los iconos no, que salen de un paquete que ya tienen instalado,
   * ni los tokens, que se leen inspeccionando.
   */
  assets?: string[]
}

export const screens: Screen[] = [
  {
    // La landing es la home del front, pero en el prototipo `/` abre el canvas.
    route: '/inicio',
    title: 'Landing',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-018', title: 'Landing page', issue: 18 }],
    assets: [
      '/landing/fondo-desktop.svg',
      '/landing/fondo-mobile.svg',
      '/landing/saldo-por-integrante.png',
    ],
  },
  {
    route: '/register',
    title: 'Registrarse',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-001', title: 'Registrarse', issue: 1 }],
  },
  {
    route: '/login',
    title: 'Iniciar sesión',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-002', title: 'Iniciar sesión', issue: 2 }],
  },
  {
    route: '/profile',
    title: 'Mi cuenta',
    epic: 'Cuenta',
    stories: [
      { id: 'SPLT-003', title: 'Ver y editar mi cuenta', issue: 3 },
      { id: 'SPLT-004', title: 'Cerrar sesión', issue: 4 },
    ],
  },
  {
    route: '/events/new',
    title: 'Crear evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-005', title: 'Crear evento', issue: 5 }],
  },
  {
    route: '/events',
    title: 'Mis eventos',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-006', title: 'Consultar mis eventos', issue: 6 }],
  },
  {
    route: '/events/empty',
    title: 'Mis eventos · vacío',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-006', title: 'Consultar mis eventos', issue: 6 }],
    hidden: true,
  },
  {
    route: '/events/event-1',
    title: 'Detalle de evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-007', title: 'Ver detalle de evento', issue: 7 }],
  },
  {
    route: '/events/event-1/edit',
    title: 'Editar evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-020', title: 'Editar evento', issue: 20 }],
  },
  {
    route: '/events/event-1/delete',
    title: 'Eliminar evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-021', title: 'Eliminar evento', issue: 21 }],
  },
  {
    // La pantalla completa, con gastos y saldos. Su contenido es de historias
    // que todavia no se entregaron, asi que no esta en el canvas: queda
    // parqueada bajo ellas y se muestra cuando les toque. Es la misma pantalla
    // que /events/event-1 con el alcance completo, no una copia.
    route: '/events/event-1/completo',
    title: 'Detalle de evento · completo',
    epic: 'Eventos',
    stories: [
      { id: 'SPLT-011', title: 'Registrar gasto', issue: 11 },
      { id: 'SPLT-012', title: 'Consultar gastos del evento', issue: 12 },
      { id: 'SPLT-015', title: 'Consultar saldo por integrante', issue: 15 },
      { id: 'SPLT-016', title: 'Consultar pagos sugeridos', issue: 16 },
    ],
    hidden: true,
  },
  {
    // Cualquier evento que el usuario no pueda abrir cae aca: no existe, o no
    // es suyo. Comparten pantalla a proposito. El id de la ruta se ve en la
    // barra del navegador, asi que se eligio uno que se lea.
    route: '/events/evento-inexistente',
    title: 'Detalle de evento · sin acceso',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-007', title: 'Ver detalle de evento', issue: 7 }],
    hidden: true,
  },
  {
    // Compartir el enlace es un modal sobre el detalle, como editar y eliminar.
    // Solo lo ve el dueño: un integrante cualquiera no tiene el boton.
    route: '/events/event-1/invitar',
    title: 'Compartir enlace',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
  },
  {
    // El token de la ruta es opaco a proposito: quien entra sin cuenta maneja
    // los gastos del evento, asi que el enlace no puede ser adivinable.
    // Decision del PO del 2026-09-17.
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd',
    title: 'Acceso por enlace',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
    hidden: true,
  },
  {
    // Un enlace que no corresponde a ningun evento: roto, viejo, o de un
    // evento eliminado. Cualquier token que no exista cae aca.
    route: '/join/enlace-invalido',
    title: 'Acceso por enlace · enlace inválido',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
    hidden: true,
  },
  {
    // Entrar sin cuenta tambien pasa por identificarse: si no, el invitado
    // carga gastos en nombre de cualquiera y no tiene saldo propio.
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd/quien-sos',
    title: 'Sin cuenta · quién sos',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 23 }],
  },
  {
    // La salida para quien no esta en la lista que armo el dueño. Es la unica
    // excepcion a que los integrantes los administre el dueño: uno se da de
    // alta a si mismo, y nada mas.
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd/soy-nuevo',
    title: 'Sin cuenta · no estoy en la lista',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 23 }],
    hidden: true,
  },
  {
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd/vincular',
    title: 'Con cuenta · quién sos',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-010', title: 'Acceder al evento con cuenta', issue: 10 }],
  },
  {
    // La cuenta ya tiene integrante en este evento, asi que no se le vuelve a
    // preguntar quien es. El estado sale de la ruta y no de los datos, para que
    // todo el flujo se vea sobre el mismo evento de ejemplo.
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd/vincular/ya-vinculado',
    title: 'Con cuenta · ya estás vinculado',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-010', title: 'Acceder al evento con cuenta', issue: 10 }],
    hidden: true,
  },
  {
    // Sumarse como integrante nuevo llegando con cuenta: la misma salida que
    // tiene quien entra sin cuenta, y ademas queda vinculado.
    route: '/join/r7Qk2Vx9mLpZ4tHnCwB3sd/vincular/soy-nuevo',
    title: 'Con cuenta · no estoy en la lista',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-010', title: 'Acceder al evento con cuenta', issue: 10 }],
    hidden: true,
  },
]

/** Lo que el canvas muestra. */
export const visibleScreens: Screen[] = screens.filter((screen) => !screen.hidden)

export const epics = [...new Set(visibleScreens.map((screen) => screen.epic))]

export function screensOfEpic(epic: string): Screen[] {
  return visibleScreens.filter((screen) => screen.epic === epic)
}


/** Todas las pantallas donde aparece la historia. La primera es su direccion. */
export function screensOfStory(storyId: string): Screen[] {
  const id = storyId.toUpperCase()
  return screens.filter((screen) => screen.stories.some((story) => story.id === id))
}

export function findStory(storyId: string): { story: Story; screen: Screen } | undefined {
  const id = storyId.toUpperCase()
  for (const screen of screens) {
    const story = screen.stories.find((item) => item.id === id)
    if (story) return { story, screen }
  }
  return undefined
}

export const allStories: Story[] = [
  ...new Map(
    visibleScreens.flatMap((screen) => screen.stories).map((story) => [story.id, story])
  ).values(),
].sort((a, b) => a.id.localeCompare(b.id))

/** Arte de todas las pantallas de una historia, sin repetidos. */
export function assetsOfStory(storyId: string): string[] {
  return [...new Set(screensOfStory(storyId).flatMap((screen) => screen.assets ?? []))]
}

export function issueUrl(issue: number): string {
  return `${ISSUES_BASE}/${issue}`
}

/**
 * Direccion dentro del canvas para una pantalla. Todo lo que se clickea en
 * /canvas cae en /canvas/SPLT-XXX: nunca se salta directo a la app.
 */
export function canvasHref(screen: Screen): string {
  const story = screen.stories[0]
  if (!story) return '/canvas'
  const index = screensOfStory(story.id).findIndex((item) => item.route === screen.route)
  return index > 0 ? `/canvas/${story.id}?estado=${index}` : `/canvas/${story.id}`
}
