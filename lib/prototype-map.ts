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
}

export const screens: Screen[] = [
  {
    // La landing es la home del front, pero en el prototipo `/` abre el canvas.
    route: '/inicio',
    title: 'Landing',
    epic: 'Acceso',
    stories: [{ id: 'SPLT-018', title: 'Landing page', issue: 18 }],
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
    hidden: true,
  },
  {
    route: '/events/event-1/empty',
    title: 'Detalle de evento · vacío',
    epic: 'Eventos',
    stories: [{ id: 'SPLT-007', title: 'Ver detalle de evento', issue: 7 }],
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
