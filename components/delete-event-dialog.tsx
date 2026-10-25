'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import type { Event } from '@/lib/types'

/** Un plural que no obligue a escribir "1 gasto(s)". */
function count(amount: number, singular: string, plural: string) {
  return `${amount} ${amount === 1 ? singular : plural}`
}

/**
 * Eliminar evento (SPLT-021).
 *
 * La confirmacion dice cuanto se lleva puesto. Un "estas seguro?" generico no
 * alcanza: el evento es el registro de quien le debe cuanto a quien, y se le
 * borra a todos los integrantes, no solo a quien aprieta el boton.
 */
export function DeleteEventDialog({ event }: { event: Event }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const close = () => router.push(`/events/${event.id}`)

  const handleDelete = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success(`Eliminamos «${event.name}»`)
    router.push('/events')
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && close()}>
      <AlertDialogContent className="rounded-[24px] border-border bg-card p-6 shadow-none sm:max-w-[480px] sm:p-8">
        <AlertDialogHeader>
          <span
            aria-hidden
            className="mb-2 flex size-12 items-center justify-center rounded-[16px] bg-destructive/10 text-destructive"
          >
            <Trash2 className="size-6" />
          </span>
          <AlertDialogTitle className="text-[28px] font-extrabold leading-[1.15] text-foreground">
            Eliminar «{event.name}»
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium leading-6 text-muted-foreground">
            Se eliminan tambien {count(event.expenses.length, 'gasto', 'gastos')} y{' '}
            {count(event.participants.length, 'integrante', 'integrantes')}. El resto de los
            integrantes deja de ver el evento. Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel className="mt-0 h-10 rounded-[8px] border-0 px-4 text-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(clickEvent) => {
              // El AlertDialog cierra solo al confirmar; aca el modal tiene que
              // quedarse mientras se guarda.
              clickEvent.preventDefault()
              handleDelete()
            }}
            className="h-10 gap-2 rounded-[8px] bg-destructive px-4 text-xl font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? <Spinner className="size-4" /> : 'Eliminar evento'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
