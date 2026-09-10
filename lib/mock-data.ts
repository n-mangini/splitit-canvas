import { Event, User, Expense, Participant, Balance, Settlement } from './types'

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Nicolas',
  email: 'nicolas@email.com',
  avatar: undefined
}

// Mock participants
const mockParticipants: Participant[] = [
  { id: 'p-1', name: 'Nicolas', userId: 'user-1', email: 'nicolas@email.com', isGuest: false },
  { id: 'p-2', name: 'Marcos', userId: 'user-2', email: 'marcos@email.com', isGuest: false },
  { id: 'p-3', name: 'Lucas', userId: 'user-3', email: 'lucas@email.com', isGuest: false },
  { id: 'p-4', name: 'Francisco', isGuest: true },
]

// Mock expenses for trip
const tripExpenses: Expense[] = [
  {
    id: 'exp-1',
    eventId: 'event-1',
    name: 'Hotel 3 noches',
    amount: 45000,
    paidBy: 'p-1',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-15',
    category: 'accommodation',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'exp-2',
    eventId: 'event-1',
    name: 'Cena grupal',
    amount: 12500,
    paidBy: 'p-2',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-15',
    category: 'food',
    createdAt: '2024-01-15T21:00:00Z'
  },
  {
    id: 'exp-3',
    eventId: 'event-1',
    name: 'Alquiler auto',
    amount: 28000,
    paidBy: 'p-3',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-14',
    category: 'transport',
    createdAt: '2024-01-14T09:00:00Z'
  },
  {
    id: 'exp-4',
    eventId: 'event-1',
    name: 'Entradas museo',
    amount: 6000,
    paidBy: 'p-4',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-16',
    category: 'entertainment',
    createdAt: '2024-01-16T11:00:00Z'
  },
  {
    id: 'exp-5',
    eventId: 'event-1',
    name: 'Supermercado',
    amount: 8500,
    paidBy: 'p-1',
    splitBetween: ['p-1', 'p-2', 'p-3', 'p-4'],
    date: '2024-01-16',
    category: 'food',
    createdAt: '2024-01-16T18:00:00Z'
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
    splitBetween: ['p-1', 'p-2', 'p-3'],
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
    splitBetween: ['p-1', 'p-2', 'p-3'],
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
    splitBetween: ['p-1', 'p-2', 'p-3'],
    date: '2024-01-05',
    category: 'utilities',
    createdAt: '2024-01-05T15:00:00Z'
  },
]

// Mock events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Viaje a Bariloche',
    description: 'Vacaciones de verano con amigos',
    createdBy: 'user-1',
    participants: mockParticipants.slice(0, 4),
    expenses: tripExpenses,
    createdAt: '2024-01-10T08:00:00Z',
    inviteCode: 'BARI2024',
    currency: 'ARS',
    icon: 'plane'
  },
  {
    id: 'event-2',
    name: 'Depto compartido',
    description: 'Gastos mensuales del departamento',
    createdBy: 'user-1',
    participants: mockParticipants.slice(0, 3),
    expenses: aptExpenses,
    createdAt: '2024-01-01T10:00:00Z',
    inviteCode: 'DEPTO01',
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
    participants: mockParticipants,
    expenses: [],
    createdAt: '2024-02-01T10:00:00Z',
    inviteCode: 'ANA2024',
    currency: 'ARS',
    icon: 'party'
  },
  {
    // El evento creado con lo minimo: sin descripcion y sin icono elegido.
    // Los dos son opcionales, asi que el listado tiene que saber dibujar la
    // card sin ese renglon, y el icono cae en el neutro.
    id: 'event-4',
    name: 'Asado del viernes',
    createdBy: 'user-1',
    participants: mockParticipants.slice(0, 2),
    expenses: [],
    createdAt: '2024-02-14T20:00:00Z',
    inviteCode: 'ASADO24',
    currency: 'ARS',
  },
]

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
