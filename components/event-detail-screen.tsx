'use client'

import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Pencil,
  Plus,
  ReceiptText,
  SearchX,
  Share2,
  Trash2,
  UsersRound,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'
import {
  calculateBalances,
  calculateSettlements,
  formatCurrency,
  formatDate,
  mockCurrentUser,
  mockEvents,
} from '@/lib/mock-data'
import { getExchangeRates } from '@/lib/exchange'
import { EmptyState } from '@/components/empty-state'
import { EventBadge } from '@/components/event-badge'
import { PersonAvatar } from '@/components/person-avatar'
import { Event, Expense } from '@/lib/types'

const supportedCurrencies = ['ARS', 'USD', 'EUR', 'BRL', 'UYU', 'CLP'] as const

type TabValue = 'expenses' | 'balances' | 'members'

const tabs: { value: TabValue; label: string }[] = [
  { value: 'expenses', label: 'Gastos' },
  { value: 'balances', label: 'Saldos' },
  { value: 'members', label: 'Integrantes' },
]

function ExpenseIcon() {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-soft-primary text-primary">
      <ReceiptText className="size-5" />
    </div>
  )
}

function TopTabs({ active, onChange }: { active: TabValue; onChange: (value: TabValue) => void }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-5 lg:gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative pb-3 text-sm font-black transition-colors',
              active === tab.value ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {tab.label}
            {active === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExpenseCard({
  expense,
  paidBy,
  currency,
  onEdit,
  onDelete,
}: {
  expense: Expense
  paidBy?: string
  currency: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="splitit-card w-full p-4">
      <div className="flex items-center gap-3">
        <ExpenseIcon />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black text-foreground">{expense.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(expense.date)}</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">Pago {paidBy ?? 'Sin asignar'}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-black text-primary">{formatCurrency(expense.amount, currency)}</p>
          {expense.originalCurrency && expense.originalAmount !== undefined && (
            <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
              {formatCurrency(expense.originalAmount, expense.originalCurrency)} {expense.originalCurrency}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              aria-label={`Editar ${expense.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-secondary hover:bg-soft-secondary hover:text-secondary"
                  aria-label={`Eliminar ${expense.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[24px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Estas seguro que queres eliminar este gasto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a eliminar {expense.name}. Esta accion tambien actualiza los saldos del evento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[18px]">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-[18px] bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={onDelete}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </article>
  )
}

function SuggestedPaymentCard({
  from,
  to,
  amount,
  currency,
}: {
  from: string
  to: string
  amount: number
  currency: string
}) {
  return (
    <article className="splitit-card p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <PersonAvatar name={from} size="sm" tone="owes" className="sm:size-11 sm:text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">{from}</p>
          <p className="hidden text-xs font-semibold text-muted-foreground sm:block">debe pagar</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
        <PersonAvatar name={to} size="sm" tone="receives" className="sm:size-11 sm:text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">{to}</p>
          <p className="hidden text-xs font-semibold text-muted-foreground sm:block">debe recibir</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-black text-primary">{formatCurrency(amount, currency)}</p>
          <ChevronRight className="ml-auto mt-2 hidden h-5 w-5 text-muted-foreground sm:block" />
        </div>
      </div>
    </article>
  )
}

function MemberBalanceRow({ name, amount, currency }: { name: string; amount: number; currency: string }) {
  const status = amount > 0 ? 'recibe' : amount < 0 ? 'debe' : 'en cero'

  return (
    <article className="flex items-center gap-3 rounded-[20px] bg-card p-3">
      <PersonAvatar name={name} size="sm" tone={amount > 0 ? 'receives' : amount < 0 ? 'owes' : 'neutral'} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-foreground">{name}</p>
        <span
          className={cn(
            'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-black',
            status === 'recibe' && 'bg-soft-primary text-primary',
            status === 'debe' && 'bg-soft-secondary text-secondary',
            status === 'en cero' && 'bg-muted text-muted-foreground'
          )}
        >
          {status}
        </span>
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-black',
          amount > 0 && 'text-primary',
          amount < 0 && 'text-secondary',
          amount === 0 && 'text-foreground'
        )}
      >
        {amount > 0 ? '+' : ''}
        {formatCurrency(amount, currency)}
      </p>
    </article>
  )
}

/**
 * `full` es el alcance de la pantalla.
 *
 * Apagado, se ve lo que entrega SPLT-007: el encabezado del evento, la
 * navegacion entre las tres secciones, y la lista de integrantes. Las
 * secciones Gastos y Saldos quedan con su titulo y nada mas — su contenido
 * es de otras historias (SPLT-011/012 y SPLT-015/016) y todavia no se
 * entrego.
 *
 * Encendido, se ve la pantalla completa. Vive en una ruta que el canvas no
 * muestra, para no perderla mientras esas historias no llegan. Es la misma
 * pantalla, no una copia: no se pueden desincronizar.
 */
export function EventDetailScreen({
  eventId,
  empty = false,
  initialTab = 'expenses',
  full = false,
}: {
  eventId: string
  empty?: boolean
  initialTab?: TabValue
  full?: boolean
}) {
  const event = mockEvents.find((item) => item.id === eventId)
  if (!event) {
    /*
      No existe (SPLT-007 #13) o no es suyo (#12). Comparten pantalla a
      proposito: asi nadie con un link ajeno confirma que ese evento existe.
      Antes esto caia en el primer evento del mock y un link roto se veia
      igual que uno bueno.
    */
    return (
      <EmptyState
        icon={SearchX}
        title="No encontramos este evento"
        description="Puede que lo hayan eliminado, que el link este incompleto, o que no estes invitado. Revisa el link con quien te lo compartio."
        action={
          <Link href="/events">
            <Button className={cn(primaryButtonClass, 'px-5')}>Ir a mis eventos</Button>
          </Link>
        }
      />
    )
  }

  return (
    <EventDetail
      event={event}
      empty={empty}
      initialTab={initialTab}
      full={full}
    />
  )
}

function EventDetail({
  event,
  empty,
  initialTab,
  full,
}: {
  event: Event
  empty: boolean
  initialTab: TabValue
  full: boolean
}) {
  const [expenses, setExpenses] = useState<Expense[]>(empty ? [] : event.expenses)
  const [participants, setParticipants] = useState<Event['participants']>(event.participants)
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCurrency, setExpenseCurrency] = useState(event.currency)
  const [expensePaidBy, setExpensePaidBy] = useState(participants[0]?.id ?? '')
  const [expenseError, setExpenseError] = useState('')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState('')
  const needsConversion = expenseCurrency !== event.currency
  const isExpenseFormOpen = isAddExpenseOpen || editingExpenseId !== null
  const amountNumber = Number(expenseAmount)
  const isValidAmount = Number.isFinite(amountNumber) && amountNumber > 0
  const conversionRate =
    needsConversion && rates && rates[expenseCurrency] && rates[event.currency]
      ? rates[event.currency] / rates[expenseCurrency]
      : null
  const convertedAmount =
    needsConversion && isValidAmount && conversionRate ? amountNumber * conversionRate : null

  useEffect(() => {
    if (!isExpenseFormOpen || !needsConversion || rates) return
    let cancelled = false
    setRatesLoading(true)
    setRatesError('')
    getExchangeRates()
      .then((fetched) => {
        if (!cancelled) setRates(fetched)
      })
      .catch((error: Error) => {
        if (!cancelled) setRatesError(error.message)
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isExpenseFormOpen, needsConversion, rates])

  const isEventOwner = event.createdBy === mockCurrentUser.id
  const eventSnapshot = { ...event, expenses }
  const balances = calculateBalances(eventSnapshot)
  const settlements = calculateSettlements(balances)
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0)
  const resetExpenseForm = () => {
    setExpenseName('')
    setExpenseAmount('')
    setExpenseCurrency(event.currency)
    setExpensePaidBy(participants[0]?.id ?? '')
    setExpenseError('')
  }

  const getExpenseFormPayload = () => {
    setExpenseError('')

    const amount = Number(expenseAmount)

    if (!expenseName.trim()) {
      setExpenseError('Ingresa un nombre para el gasto')
      return null
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setExpenseError('Ingresa un monto valido')
      return null
    }

    if (!expensePaidBy) {
      setExpenseError('Selecciona quien pago')
      return null
    }

    let storedAmount = amount
    let originalAmount: number | undefined
    let originalCurrency: string | undefined
    let exchangeRate: number | undefined

    if (needsConversion) {
      if (ratesLoading) {
        setExpenseError('Esperando el tipo de cambio...')
        return null
      }
      if (!rates || !conversionRate) {
        setExpenseError(ratesError || 'No se pudo obtener el tipo de cambio')
        return null
      }
      storedAmount = Math.round(amount * conversionRate * 100) / 100
      originalAmount = amount
      originalCurrency = expenseCurrency
      exchangeRate = conversionRate
    }

    return {
      name: expenseName.trim(),
      amount: storedAmount,
      paidBy: expensePaidBy,
      splitBetween: participants.map((participant) => participant.id),
      originalAmount,
      originalCurrency,
      exchangeRate,
    }
  }

  const handleAddExpense = (formEvent: FormEvent) => {
    formEvent.preventDefault()
    const payload = getExpenseFormPayload()
    if (!payload) return

    setExpenses((current) => [
      {
        id: `exp-local-${Date.now()}`,
        eventId: event.id,
        name: payload.name,
        amount: payload.amount,
        paidBy: payload.paidBy,
        splitBetween: payload.splitBetween,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        originalAmount: payload.originalAmount,
        originalCurrency: payload.originalCurrency,
        exchangeRate: payload.exchangeRate,
      },
      ...current,
    ])
    resetExpenseForm()
    setIsAddExpenseOpen(false)
  }

  const openEditExpense = (expense: Expense) => {
    setExpenseName(expense.name)
    setExpenseAmount(String(expense.originalAmount ?? expense.amount))
    setExpenseCurrency(expense.originalCurrency ?? event.currency)
    setExpensePaidBy(expense.paidBy)
    setExpenseError('')
    setEditingExpenseId(expense.id)
  }

  const closeEditExpense = () => {
    setEditingExpenseId(null)
    resetExpenseForm()
  }

  const handleUpdateExpense = (formEvent: FormEvent) => {
    formEvent.preventDefault()
    if (!editingExpenseId) return

    const payload = getExpenseFormPayload()
    if (!payload) return

    setExpenses((current) =>
      current.map((expense) =>
        expense.id === editingExpenseId
          ? {
              ...expense,
              name: payload.name,
              amount: payload.amount,
              paidBy: payload.paidBy,
              splitBetween: payload.splitBetween,
              originalAmount: payload.originalAmount,
              originalCurrency: payload.originalCurrency,
              exchangeRate: payload.exchangeRate,
            }
          : expense
      )
    )
    closeEditExpense()
  }

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId))
    if (editingExpenseId === expenseId) {
      closeEditExpense()
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="space-y-5 lg:rounded-[32px] lg:border lg:border-border lg:bg-card lg:p-6 lg:shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between">
          <Link href="/events" className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Las acciones van juntas a la derecha: el justify-between del
              contenedor separa la flecha de volver de todas ellas. */}
          <div className="flex items-center gap-2">
            {/* La puerta de entrada a editar (SPLT-020) y eliminar (SPLT-021)
                el evento. Las dos historias estan entregadas, asi que desde el
                detalle se llega a ellas. */}
            <Link
              href={`/events/${event.id}/edit`}
              aria-label="Editar evento"
              className="flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-colors hover:text-primary"
            >
              <Pencil className="size-5" />
            </Link>
            <Link
              href={`/events/${event.id}/delete`}
              aria-label="Eliminar evento"
              className="flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-colors hover:text-destructive"
            >
              <Trash2 className="size-5" />
            </Link>

            {/* Invitar es SPLT-008: el enlace se muestra en un modal sobre el
                detalle, igual que editar y eliminar. Solo lo ve el dueño, que
                es el unico que puede generar el enlace de acceso. */}
            {isEventOwner && (
              <Link
                href={`/events/${event.id}/invitar`}
                className={cn(primaryButtonClass, 'flex items-center gap-2 bg-primary px-4 hover:bg-primary/90')}
              >
                <Share2 className="size-4" />
                Invitar
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <EventBadge icon={event.icon} size="title" />
            <div>
              <h1 className="text-2xl font-black text-foreground lg:text-4xl">{event.name}</h1>
              {event.description && (
                <p className="mt-1 max-w-xl text-sm font-semibold text-muted-foreground lg:text-base">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <TopTabs active={activeTab} onChange={setActiveTab} />
      </header>

      {activeTab === 'expenses' && (
        <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-foreground lg:text-3xl">Gastos</h2>
            </div>

            {/* Cargar y listar gastos es SPLT-011 y SPLT-012. Sin ellas, la
                seccion muestra el estado vacio: es lo que ve cualquiera que
                abre un evento sin gastos, no un hueco a la espera de codigo. */}
            {!full && <EmptyState
                  title="Todavia no hay gastos"
                  description="Cuando cargues gastos, van a aparecer aca para revisar quien pago y cuanto corresponde."
                />}
            {full && (
              <>
              {/* Sin gastos, el total es un "$ 0" que no informa nada y le come
                  lugar al unico mensaje que importa ahi: que todavia no hay
                  nada cargado. Aparece recien con el primer gasto. */}
              {expenses.length > 0 && (
                <article className="splitit-card p-4">
                  <p className="text-xs font-bold text-muted-foreground">Total de gastos</p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    {formatCurrency(totalExpenses, event.currency)}
                  </p>
                </article>
              )}

              <div className="grid gap-3 md:grid-cols-[220px]">
                <Dialog
                  open={isAddExpenseOpen}
                  onOpenChange={(open) => {
                    setIsAddExpenseOpen(open)
                    if (!open) resetExpenseForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="h-14 w-full rounded-[18px] bg-primary text-base font-black text-primary-foreground hover:bg-primary/90"
                      onClick={resetExpenseForm}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Agregar gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
                    <DialogHeader>
                      <DialogTitle>Agregar gasto</DialogTitle>
                      <DialogDescription>Carga quien pago y el monto.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="expense-name">Nombre</Label>
                        <Input
                          id="expense-name"
                          value={expenseName}
                          onChange={(item) => setExpenseName(item.target.value)}
                          placeholder="Ej: Supermercado"
                          className="rounded-[18px]"
                        />
                      </div>

                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="expense-amount">Monto</Label>
                          <Input
                            id="expense-amount"
                            inputMode="decimal"
                            value={expenseAmount}
                            onChange={(item) => setExpenseAmount(item.target.value)}
                            placeholder="0"
                            className="rounded-[18px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Moneda</Label>
                          <Select value={expenseCurrency} onValueChange={setExpenseCurrency}>
                            <SelectTrigger className="h-10 w-[110px] rounded-[18px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {supportedCurrencies.map((code) => (
                                <SelectItem key={code} value={code}>
                                  {code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {needsConversion && (
                        <div className="rounded-[16px] border border-border bg-background px-3 py-2 text-xs font-semibold">
                          {ratesLoading && (
                            <span className="text-muted-foreground">Obteniendo tipo de cambio...</span>
                          )}
                          {!ratesLoading && ratesError && (
                            <span className="text-destructive">{ratesError}</span>
                          )}
                          {!ratesLoading && !ratesError && conversionRate && (
                            <div className="flex flex-col gap-0.5 text-muted-foreground">
                              <span>
                                1 {expenseCurrency} = {conversionRate.toLocaleString('es-AR', { maximumFractionDigits: 4 })} {event.currency}
                              </span>
                              {convertedAmount !== null && (
                                <span className="text-foreground">
                                  Se guardara como {formatCurrency(convertedAmount, event.currency)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Pago</Label>
                        <Select value={expensePaidBy} onValueChange={setExpensePaidBy}>
                          <SelectTrigger className="h-11 rounded-[18px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {participants.map((participant) => (
                              <SelectItem key={participant.id} value={participant.id}>
                                {participant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {expenseError && (
                        <p className="text-sm font-semibold text-destructive">{expenseError}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-[18px]"
                          onClick={() => {
                            resetExpenseForm()
                            setIsAddExpenseOpen(false)
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="rounded-[18px]">
                          Guardar gasto
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {expenses.length > 0 ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {expenses.map((expense) => {
                    const payer = participants.find((participant) => participant.id === expense.paidBy)

                    return (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        paidBy={payer?.name}
                        currency={event.currency}
                        onEdit={() => openEditExpense(expense)}
                        onDelete={() => handleDeleteExpense(expense.id)}
                      />
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Todavia no hay gastos"
                  description="Cuando cargues gastos, van a aparecer aca para revisar quien pago y cuanto corresponde."
                />
              )}
              </>
            )}
        </section>
      )}

      {activeTab === 'balances' && (
        <section
          className={cn(
            'grid gap-5 lg:items-start',
            // La segunda columna es la del saldo por integrante. Sin ella la
            // seccion es de una sola columna: si no, el ancho queda reservado
            // igual y la tarjeta se ve cortada al medio en desktop.
            full && 'lg:grid-cols-[minmax(0,1fr)_380px]'
          )}
        >
          <div className="min-w-0 space-y-5">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-foreground lg:text-3xl">Saldos</h2>
            </div>

            {/* Saldo por integrante es SPLT-015 y pagos sugeridos SPLT-016.
                Sin ellas, la seccion muestra su estado vacio. */}
            {!full && (
              <EmptyState
                title="Todavia no hay saldos"
                description="Cuando el evento tenga gastos cargados, aca vas a ver cuanto le corresponde a cada integrante."
              />
            )}
            {/* Pagos sugeridos es SPLT-016. */}
            {full && (
              <>
              <div className="space-y-3">
                <h3 className="text-base font-black text-foreground">Pagos sugeridos</h3>
                {settlements.length > 0 ? (
                  <div className="grid gap-3 xl:grid-cols-2 [&>*]:min-w-0">
                    {settlements.map((settlement) => (
                      <SuggestedPaymentCard
                        key={`${settlement.from}-${settlement.to}-${settlement.amount}`}
                        from={settlement.fromName}
                        to={settlement.toName}
                        amount={settlement.amount}
                        currency={event.currency}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="splitit-card p-6 text-center">
                    <Check className="mx-auto h-9 w-9 text-primary" />
                    <p className="mt-3 font-black text-foreground">Esta todo claro</p>
                    <p className="text-sm text-muted-foreground">No hay pagos pendientes.</p>
                  </div>
                )}
              </div>
              </>
            )}
          </div>

          {/* Saldo por integrante es SPLT-015. */}
          {full && (
            <>
            <aside className="splitit-card min-w-0 space-y-2 p-3 lg:sticky lg:top-28">
              <h3 className="px-1 pb-1 text-base font-black text-foreground">Saldo por integrante</h3>
              {balances.map((balance) => (
                <MemberBalanceRow
                  key={balance.participantId}
                  name={balance.participantName}
                  amount={balance.netBalance}
                  currency={event.currency}
                />
              ))}
            </aside>
            </>
          )}
        </section>
      )}

      {/* Editar y eliminar gasto son SPLT-013 y SPLT-014. */}
      {full && (
        <>
        <Dialog
          open={editingExpenseId !== null}
          onOpenChange={(open) => {
            if (!open) closeEditExpense()
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle>Editar gasto</DialogTitle>
              <DialogDescription>Modifica el nombre, monto o quien pago.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expense-name">Nombre</Label>
                <Input
                  id="edit-expense-name"
                  value={expenseName}
                  onChange={(item) => setExpenseName(item.target.value)}
                  placeholder="Ej: Supermercado"
                  className="rounded-[18px]"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-expense-amount">Monto</Label>
                  <Input
                    id="edit-expense-amount"
                    inputMode="decimal"
                    value={expenseAmount}
                    onChange={(item) => setExpenseAmount(item.target.value)}
                    placeholder="0"
                    className="rounded-[18px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={expenseCurrency} onValueChange={setExpenseCurrency}>
                    <SelectTrigger className="h-10 w-[110px] rounded-[18px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {needsConversion && (
                <div className="rounded-[16px] border border-border bg-background px-3 py-2 text-xs font-semibold">
                  {ratesLoading && (
                    <span className="text-muted-foreground">Obteniendo tipo de cambio...</span>
                  )}
                  {!ratesLoading && ratesError && (
                    <span className="text-destructive">{ratesError}</span>
                  )}
                  {!ratesLoading && !ratesError && conversionRate && (
                    <div className="flex flex-col gap-0.5 text-muted-foreground">
                      <span>
                        1 {expenseCurrency} = {conversionRate.toLocaleString('es-AR', { maximumFractionDigits: 4 })} {event.currency}
                      </span>
                      {convertedAmount !== null && (
                        <span className="text-foreground">
                          Se guardara como {formatCurrency(convertedAmount, event.currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Pago</Label>
                <Select value={expensePaidBy} onValueChange={setExpensePaidBy}>
                  <SelectTrigger className="h-11 rounded-[18px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {expenseError && (
                <p className="text-sm font-semibold text-destructive">{expenseError}</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button type="button" variant="outline" className="rounded-[18px]" onClick={closeEditExpense}>
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-[18px]">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </>
      )}

      {activeTab === 'members' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-foreground lg:text-3xl">Integrantes</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {participants.map((participant) => {
              // Dueño del evento (SPLT-005 #10), no "soy yo": se resuelve
              // contra createdBy, no contra la cuenta logueada.
              const isOwner = !!participant.userId && participant.userId === event.createdBy
              return (
                <article key={participant.id} className="splitit-card flex items-center gap-3 p-4">
                  <PersonAvatar name={participant.name} tone={isOwner ? 'owner' : 'receives'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-foreground">{participant.name}</p>
                      {isOwner && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">
                          Dueño
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {participant.isGuest ? 'Invitado' : participant.email}
                    </p>
                  </div>
                  <UsersRound className="h-5 w-5 text-muted-foreground" />
                </article>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}
