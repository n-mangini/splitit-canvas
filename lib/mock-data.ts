import { Event, User, Expense, Participant, Balance, Settlement } from './types'

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Nicolas',
  email: 'nicolas@email.com',
  avatar: undefined
}

/**
 * Quien llega por un enlace de invitacion. No es el usuario de siempre a
 * proposito: el dueño ya esta adentro del evento, asi que las pantallas de
 * invitacion no se pueden ver desde su cuenta.
 */
export const mockInvitedUser: User = {
  id: 'user-4',
  name: 'Sofia',
  email: 'sofia@email.com',
  avatar: undefined
}

// Mock participants
//
// El orden es el del evento de ejemplo: primero el dueño y despues el resto.
// Francisco no tiene cuenta a proposito — es el integrante que queda libre
// para vincular cuando alguien entra por el enlace con su cuenta.
const mockParticipants: Participant[] = [
  { id: 'p-1', name: 'Nicolas', userId: 'user-1', email: 'nicolas@email.com', isGuest: false },
  { id: 'p-2', name: 'Francisco', isGuest: true },
  { id: 'p-3', name: 'Lucas', userId: 'user-3', email: 'lucas@email.com', isGuest: false },
  { id: 'p-4', name: 'Marcos', userId: 'user-2', email: 'marcos@email.com', isGuest: false },
]

const [nicolas, francisco, lucas, marcos] = mockParticipants

// Gastos de la juntada: el evento de ejemplo de todo el prototipo.
const asadoExpenses: Expense[] = [
  {
    id: 'exp-1',
    eventId: 'event-1',
    name: 'Carne y achuras',
    amount: 32000,
    paidBy: 'p-1',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-03-16',
    category: 'food',
    createdAt: '2024-03-16T11:00:00Z'
  },
  {
    id: 'exp-2',
    eventId: 'event-1',
    name: 'Bebidas',
    amount: 14500,
    paidBy: 'p-4',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-03-16',
    category: 'food',
    createdAt: '2024-03-16T12:30:00Z'
  },
  {
    id: 'exp-3',
    eventId: 'event-1',
    name: 'Carbon y leña',
    amount: 6800,
    paidBy: 'p-3',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-03-16',
    category: 'other',
    createdAt: '2024-03-16T13:00:00Z'
  },
  {
    id: 'exp-4',
    eventId: 'event-1',
    name: 'Ensaladas y pan',
    amount: 9200,
    paidBy: 'p-2',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-03-16',
    category: 'food',
    createdAt: '2024-03-16T13:20:00Z'
  },
  {
    id: 'exp-5',
    eventId: 'event-1',
    name: 'Postre y helado',
    amount: 7400,
    paidBy: 'p-1',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-03-16',
    category: 'food',
    createdAt: '2024-03-16T17:00:00Z'
  },
]

// Mock expenses for apartment
const aptExpenses: Expense[] = [
  {
    id: 'exp-6',
    eventId: 'event-2',
    name: 'Alquiler Enero',
    amount: 150000,
    paidBy: 'p-1',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-01',
    category: 'accommodation',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'exp-7',
    eventId: 'event-2',
    name: 'Luz',
    amount: 8500,
    paidBy: 'p-2',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-10',
    category: 'utilities',
    createdAt: '2024-01-10T12:00:00Z'
  },
  {
    id: 'exp-8',
    eventId: 'event-2',
    name: 'Internet',
    amount: 4500,
    paidBy: 'p-3',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-05',
    category: 'utilities',
    createdAt: '2024-01-05T15:00:00Z'
  },
]

// Mock events
//
// «Juntada Asado» es el evento de ejemplo de todo el prototipo: es el que se
// abre en el detalle, el que tiene gastos y el que se comparte por enlace. Los
// demas existen por un caso que el primero no puede mostrar — un evento ajeno,
// uno creado con lo minimo, uno donde ya no queda integrante libre.
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Juntada Asado',
    description: 'Asado del sabado en casa de Nicolas',
    createdBy: 'user-1',
    participants: [nicolas, francisco, lucas, marcos],
    expenses: asadoExpenses,
    createdAt: '2024-03-14T08:00:00Z',
    inviteCode: 'r7Qk2Vx9mLpZ4tHnCwB3sd',
    currency: 'ARS',
    icon: 'food'
  },
  {
    id: 'event-2',
    name: 'Depto compartido',
    description: 'Gastos mensuales del departamento',
    createdBy: 'user-1',
    participants: [nicolas, francisco, lucas, marcos],
    expenses: aptExpenses,
    createdAt: '2024-01-01T10:00:00Z',
    inviteCode: 'Yp3Nf8KdQm1XvTzR6bLhJw',
    currency: 'ARS',
    icon: 'home'
  },
  {
    // Evento ajeno: el usuario participa pero no lo creo. Sin este caso no se
    // puede ver el criterio #2 de SPLT-006.
    id: 'event-3',
    name: 'Cumple de Ana',
    description: 'Fiesta de cumpleanos',
    createdBy: 'user-2',
    participants: [nicolas, francisco, lucas, marcos],
    expenses: [],
    createdAt: '2024-02-01T10:00:00Z',
    inviteCode: 'a9WcEu5TnQbK2ZyM7xRdFs',
    currency: 'ARS',
    icon: 'party'
  },
  {
    // El evento creado con lo minimo: sin descripcion y sin icono elegido.
    // Los dos son opcionales, asi que el listado tiene que saber dibujar la
    // card sin ese renglon, y el icono cae en el neutro.
    id: 'event-4',
    name: 'Salida del sabado',
    createdBy: 'user-1',
    participants: [nicolas, francisco, lucas, marcos],
    expenses: [],
    createdAt: '2024-02-14T20:00:00Z',
    inviteCode: 'Jq4Hs8ZvB6nTgLmPkXr2Wd',
    currency: 'ARS',
  },
]

/** El evento de un enlace de invitacion, o nada si el enlace no corresponde a ninguno. */
export function findEventByInviteCode(code: string): Event | undefined {
  return mockEvents.find((event) => event.inviteCode === code)
}

// Calculate balances for an event
export function calculateBalances(event: Event): Balance[] {
  const balances: Map<string, Balance> = new Map()
  
  // Initialize balances for all participants
  event.participants.forEach(p => {
    balances.set(p.id, {
      participantId: p.id,
      participantName: p.name,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0
    })
  })
  
  // Calculate totals
  event.expenses.forEach(expense => {
    const shareAmount = expense.amount / expense.splitBetween.length
    
    // Add to payer's totalPaid
    const payerBalance = balances.get(expense.paidBy)
    if (payerBalance) {
      payerBalance.totalPaid += expense.amount
    }
    
    // Add to each participant's totalOwed
    expense.splitBetween.forEach(participantId => {
      const balance = balances.get(participantId)
      if (balance) {
        balance.totalOwed += shareAmount
      }
    })
  })
  
  // Calculate net balance
  balances.forEach(balance => {
    balance.netBalance = balance.totalPaid - balance.totalOwed
  })
  
  return Array.from(balances.values())
}

// Calculate optimized settlements
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = []
  
  // Separate debtors and creditors
  const debtors = balances.filter(b => b.netBalance < 0).map(b => ({
    ...b,
    amount: Math.abs(b.netBalance)
  }))
  const creditors = balances.filter(b => b.netBalance > 0).map(b => ({
    ...b,
    amount: b.netBalance
  }))
  
  // Sort by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)
  
  // Simple greedy algorithm for settlements
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    
    const amount = Math.min(debtor.amount, creditor.amount)
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.participantId,
        fromName: debtor.participantName,
        to: creditor.participantId,
        toName: creditor.participantName,
        amount: Math.round(amount * 100) / 100,
        settled: false
      })
    }
    
    debtor.amount -= amount
    creditor.amount -= amount
    
    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }
  
  return settlements
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Get category info
export const categoryInfo: Record<string, { label: string; color: string }> = {
  food: { label: 'Comida', color: 'bg-orange-500' },
  transport: { label: 'Transporte', color: 'bg-blue-500' },
  accommodation: { label: 'Alojamiento', color: 'bg-purple-500' },
  entertainment: { label: 'Entretenimiento', color: 'bg-pink-500' },
  shopping: { label: 'Compras', color: 'bg-green-500' },
  utilities: { label: 'Servicios', color: 'bg-yellow-500' },
  other: { label: 'Otro', color: 'bg-gray-500' }
}

// Generate invite link
export function getInviteLink(inviteCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/join/${inviteCode}`
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format date
export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

// Format relative date
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} dias`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return formatDate(dateString)
}
