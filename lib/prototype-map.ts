// Mapa del prototipo: historia -> pantalla -> issue.
//
// Unica fuente de verdad del canvas. Habla solo el lenguaje del backlog de
// producto (SPLT / GitHub). Los tickets de Linear apuntan hacia aca; este
// archivo nunca apunta hacia Linear.
//
// Es lo unico que hay que mantener cuando se agrega o cambia una pantalla.

export const ISSUES_BASE = 'https://github.com/SplitItLab/roadmap/issues'

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

// Las pantallas son las del front oficial (SplitItLab/SplitIt, rama main),
// con sus mismas direcciones. Los estados que el oficial resuelve adentro de
// la pantalla (un modal, una pestaña, una lista vacia) se piden por query:
// ver `lib/canvas-state.ts` y `lib/mock-api.ts`.
const TOKEN = 'r7Qk2Vx9mLpZ4tHnCwB3sd'

export const screens: Screen[] = [
  {
    // La landing es la home del front, pero en el prototipo `/` abre el canvas.
    route: '/inicio',
    title: 'Landing',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-018', title: 'Landing page', issue: 18 }],
    assets: ['/landing/fondo-desktop.svg', '/landing/fondo-mobile.svg'],
  },
  {
    route: '/register',
    title: 'Registrarse',
    epic: 'Acceso',
    stories: [
      { id: 'SPLT-001', title: 'Registrarse', issue: 1 },
      { id: 'SPLT-019', title: 'Ingresar con Google', issue: 19 },
    ],
  },
  {
    route: '/login',
    title: 'Iniciar sesión',
    epic: 'Acceso',
    stories: [
      { id: 'SPLT-002', title: 'Iniciar sesión', issue: 2 },
      { id: 'SPLT-019', title: 'Ingresar con Google', issue: 19 },
    ],
  },
  {
    // Volver de Google sin completar el ingreso: cancelo o rechazo el permiso.
    route: '/login?error=google',
    title: 'Iniciar sesión · Google no completó',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-019', title: 'Ingresar con Google', issue: 19 }],
    hidden: true,
  },
  {
    // Ingresar con Google con un email que ya tiene cuenta con contraseña.
    route: '/login?escenario=cuenta-existente&modal=cuenta-existente',
    title: 'Ingresar con Google · ya tenés una cuenta',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-019', title: 'Ingresar con Google', issue: 19 }],
    hidden: true,
  },
  {
    route: '/perfil',
    title: 'Mi cuenta',
    epic: 'Cuenta',
    stories: [
      { id: 'SPLT-003', title: 'Ver y editar mi cuenta', issue: 3 },
      { id: 'SPLT-004', title: 'Cerrar sesión', issue: 4 },
    ],
  },
  {
    // La cuenta que ingresa con Google no puede cambiar su email.
    route: '/perfil?escenario=google&modal=editar',
    title: 'Mi cuenta · cuenta de Google',
    epic: 'Cuenta',
    stories: [{ id: 'SPLT-019', title: 'Ingresar con Google', issue: 19 }],
    hidden: true,
  },
  {
    route: '/eventos?modal=crear',
    title: 'Crear evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-005', title: 'Crear evento', issue: 5 }],
  },
  {
    route: '/eventos',
    title: 'Mis eventos',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-006', title: 'Consultar mis eventos', issue: 6 }],
  },
  {
    route: '/eventos?escenario=vacio',
    title: 'Mis eventos · vacío',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-006', title: 'Consultar mis eventos', issue: 6 }],
    hidden: true,
  },
  {
    route: '/eventos/1',
    title: 'Detalle de evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-007', title: 'Ver detalle de evento', issue: 7 }],
  },
  {
    route: '/eventos/1?modal=editar',
    title: 'Editar evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-020', title: 'Editar evento', issue: 20 }],
  },
  {
    // Un evento sin gastos se puede eliminar.
    route: '/eventos/4?modal=eliminar',
    title: 'Eliminar evento',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-021', title: 'Eliminar evento', issue: 21 }],
  },
  {
    // Con gastos no: primero hay que borrarlos.
    route: '/eventos/1?modal=eliminar',
    title: 'Eliminar evento · tiene gastos',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-021', title: 'Eliminar evento', issue: 21 }],
    hidden: true,
  },
  {
    route: '/eventos/1?tab=gastos',
    title: 'Detalle de evento · gastos',
    epic: 'Eventos',
    stories: [
      { id: 'SPLT-011', title: 'Registrar gasto', issue: 11 },
      { id: 'SPLT-012', title: 'Consultar gastos del evento', issue: 12 },
      { id: 'SPLT-013', title: 'Modificar gasto', issue: 13 },
      { id: 'SPLT-014', title: 'Eliminar gasto', issue: 14 },
    ],
  },
  {
    // Los gastos llegan de a 20: el resto se pide con «Ver más gastos».
    route: '/eventos/2?tab=gastos',
    title: 'Detalle de evento · más de una página de gastos',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-012', title: 'Consultar gastos del evento', issue: 12 }],
    hidden: true,
  },
  {
    route: '/eventos/1?modal=gasto',
    title: 'Agregar gasto',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-011', title: 'Registrar gasto', issue: 11 }],
    hidden: true,
  },
  {
    route: '/eventos/1?tab=saldos',
    title: 'Detalle de evento · saldos',
    epic: 'Eventos',
    stories: [
      { id: 'SPLT-015', title: 'Consultar saldo por integrante', issue: 15 },
      { id: 'SPLT-016', title: 'Consultar pagos sugeridos', issue: 16 },
    ],
  },
  {
    // Cualquier evento que el usuario no pueda abrir cae aca: no existe, o no
    // es suyo. Comparten pantalla a proposito.
    route: '/eventos/evento-inexistente',
    title: 'Detalle de evento · sin acceso',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-007', title: 'Ver detalle de evento', issue: 7 }],
    hidden: true,
  },
  {
    // Compartir el enlace es un modal sobre el detalle. Solo lo ve el dueño.
    route: '/eventos/1?modal=invitar',
    title: 'Compartir enlace',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
  },
  {
    // El token es opaco a proposito: quien entra sin cuenta maneja los gastos
    // del evento, asi que el enlace no puede ser adivinable.
    route: `/eventos/invitacion/${TOKEN}?escenario=sin-sesion`,
    title: 'Acceso por enlace',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
    hidden: true,
  },
  {
    // Un enlace que no corresponde a ningun evento: roto, viejo, o de un
    // evento eliminado.
    route: '/eventos/invitacion/enlace-invalido',
    title: 'Acceso por enlace · enlace inválido',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-008', title: 'Compartir enlace de acceso al evento', issue: 8 }],
    hidden: true,
  },
  {
    // La entrada sin sesion: con cuenta o sin cuenta.
    route: `/eventos/invitacion/${TOKEN}?escenario=sin-sesion`,
    title: 'Sin cuenta · entrada',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 22 }],
    hidden: true,
  },
  {
    // Entrar sin cuenta tambien pasa por identificarse: si no, el invitado
    // carga gastos en nombre de cualquiera y no tiene saldo propio.
    route: `/eventos/invitacion/${TOKEN}?escenario=sin-sesion&paso=quien-sos`,
    title: 'Sin cuenta · quién sos',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 22 }],
  },
  {
    // Ya entro como invitado desde este dispositivo: vuelve directo.
    route: `/eventos/invitacion/${TOKEN}?escenario=invitado`,
    title: 'Sin cuenta · ya elegiste quién sos',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 22 }],
    hidden: true,
  },
  {
    // Todos ya entraron con su cuenta: sin cuenta no queda a quien elegir.
    route: `/eventos/invitacion/${TOKEN}?escenario=sin-sesion,sin-integrantes&paso=quien-sos`,
    title: 'Sin cuenta · sin integrantes libres',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 22 }],
    hidden: true,
  },
  {
    // El evento visto por el invitado: solo su evento, sin editar ni borrar
    // gastos, y con «Salir» en lugar del menu de la cuenta.
    route: '/eventos/1?escenario=invitado',
    title: 'Sin cuenta · el evento del invitado',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-022', title: 'Acceder al evento sin cuenta', issue: 22 }],
  },
  {
    route: `/eventos/invitacion/${TOKEN}`,
    title: 'Con cuenta · quién sos',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-010', title: 'Acceder al evento con cuenta', issue: 10 }],
  },
  {
    // La cuenta ya tiene integrante en este evento: no se le vuelve a preguntar.
    route: `/eventos/invitacion/${TOKEN}?escenario=ya-vinculado`,
    title: 'Con cuenta · ya estás vinculado',
    epic: 'Invitaciones',
    stories: [{ id: 'SPLT-010', title: 'Acceder al evento con cuenta', issue: 10 }],
    hidden: true,
  },
  {
    // Todos los integrantes ya entraron con su cuenta: no queda ninguno libre.
    route: `/eventos/invitacion/${TOKEN}?escenario=sin-integrantes`,
    title: 'Con cuenta · sin integrantes libres',
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
