'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, SearchX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { EmptyState } from '@/components/empty-state'
import { EventBadge } from '@/components/event-badge'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="splitit-card flex items-center gap-4 p-4 transition-colors hover:border-primary/40 sm:p-5"
    >
      <EventBadge icon={event.icon} />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-extrabold text-foreground">{event.name}</h2>
        {/* La descripcion es opcional (SPLT-005 #5): sin ella no se reserva el
            renglon, para no dejar un hueco sin explicacion. */}
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">{event.description}</p>
        )}
        <p className="mt-2 text-sm font-medium text-primary">{event.participants.length} integrantes</p>
      </div>
    </Link>
  )
}

export function EventsScreen({ events }: { events: Event[] }) {
  const [query, setQuery] = useState('')
  const hasEvents = events.length > 0

  const term = query.trim().toLowerCase()
  const matches = term
    ? events.filter((event) => event.name.toLowerCase().includes(term))
    : events

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-[40px] font-extrabold leading-[1.15] text-foreground sm:text-[60px]">
          Tus eventos
        </h1>
        <p className="mt-2 max-w-xl text-sm font-medium text-muted-foreground">
          {hasEvents
            ? 'Selecciona un evento creado para cargar gastos, revisar saldos y ver quien le debe a quien.'
            : 'Cuando tengas eventos creados, los vas a ver aca para cargar gastos y revisar saldos.'}
        </p>
      </header>

      {/*
        Buscador y accion primaria comparten fila, como en el Figma. En mobile
        no entran las dos, asi que se apilan con el boton arriba a lo ancho
        (flex-col-reverse), igual que el CTA de login. Sin eventos no hay que
        buscar, pero el boton tiene que seguir estando: es la unica salida del
        estado vacio.
      */}
      <section className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        {hasEvents && (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-placeholder" />
            <Input
              placeholder="Buscar evento"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={cn(fieldClass, 'w-full pl-9', query && 'pr-11')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar busqueda"
                className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        <Link href="/events/new" className="w-full sm:w-auto">
          <Button className={cn(primaryButtonClass, 'w-full px-5 sm:w-auto')}>
            <Plus className="mr-2 h-5 w-5" />
            Crear evento
          </Button>
        </Link>
      </section>

      {!hasEvents && (
        <EmptyState
          title="Todavia no tenes eventos"
          description="Crea tu primer evento para empezar a dividir gastos con tu grupo."
        />
      )}

      {hasEvents && matches.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description={<>Ningun evento tuyo coincide con &laquo;{query.trim()}&raquo;.</>}
        />
      )}

      {hasEvents && matches.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </div>
  )
}
