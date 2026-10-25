'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { EventIcon, eventIcons, getEventIcon } from '@/lib/event-icons'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

const currencyLabels: Record<string, string> = {
  ARS: 'ARS - Peso argentino',
  USD: 'USD - Dolar',
  EUR: 'EUR - Euro',
  BRL: 'BRL - Real',
}

/**
 * Editar evento (SPLT-020). Modal sobre el detalle, igual que crear evento es
 * un modal sobre el listado.
 *
 * Se editan nombre, descripcion e icono. Los integrantes no: entran al crear
 * el evento y por invitacion, que son otras historias.
 */
export function EditEventDialog({ event }: { event: Event }) {
  const router = useRouter()
  const back = `/events/${event.id}`

  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description ?? '')
  const [icon, setIcon] = useState<EventIcon | undefined>(event.icon)
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)

  const isNameMissing = !name.trim()
  const { Icon } = getEventIcon(icon)

  // Cancelar es volver al detalle: nada de lo tipeado se guarda.
  const close = () => router.push(back)

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault()

    if (isNameMissing) {
      setNameTouched(true)
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    toast.success('Guardamos los cambios')
    router.push(back)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-[24px] border-border bg-card p-6 shadow-none sm:max-w-[576px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="text-[32px] font-extrabold leading-[1.15] text-foreground">
            Editar evento
          </DialogTitle>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="group relative w-fit" aria-label="Cambiar icono del evento">
                <span className="flex size-14 items-center justify-center rounded-[16px] bg-soft-primary text-primary">
                  <Icon className="size-6" />
                </span>
                <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-card text-foreground transition-transform group-hover:scale-110">
                  <Pencil className="size-3" />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto rounded-[16px] border-border p-3">
              <div className="grid grid-cols-4 gap-2">
                {eventIcons.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    title={option.label}
                    aria-label={option.label}
                    onClick={() => {
                      setIcon(option.value)
                      setIsIconPickerOpen(false)
                    }}
                    className={cn(
                      'flex size-12 items-center justify-center rounded-[12px] transition-colors',
                      option.value === icon
                        ? 'bg-soft-primary text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <option.Icon className="size-5" />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="edit-event-name" className="text-base font-extrabold text-black">
              Nombre del evento
            </Label>
            <Input
              id="edit-event-name"
              value={name}
              onChange={(formEvent) => setName(formEvent.target.value)}
              onBlur={() => setNameTouched(true)}
              aria-invalid={nameTouched && isNameMissing}
              aria-describedby={nameTouched && isNameMissing ? 'edit-event-name-error' : undefined}
              className={fieldClass}
            />
            {nameTouched && isNameMissing && (
              <p id="edit-event-name-error" className="text-sm font-medium text-destructive">
                El nombre del evento es obligatorio
              </p>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="edit-event-description" className="text-base font-extrabold text-black">
              Descripcion <span className="font-medium text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="edit-event-description"
              placeholder="Datos importantes para la distincion del evento"
              value={description}
              onChange={(formEvent) => setDescription(formEvent.target.value)}
              className={cn(fieldClass, 'min-h-[84px]')}
            />
          </div>

          {/*
            La moneda se muestra pero no se toca. Cada gasto guarda su monto ya
            convertido a la moneda del evento, congelado al cargarlo, asi que
            cambiarla despues dejaria los totales y los saldos expresados en una
            moneda que el evento ya no usa.

            El candado es toda la explicacion que hay: el PO saco el texto que
            decia el motivo.
          */}
          <div className="flex flex-col gap-[6px]">
            <Label className="text-base font-extrabold text-black">Moneda del evento</Label>
            <div className="flex h-10 w-fit items-center gap-2 rounded-[8px] bg-muted px-4 text-base font-medium text-muted-foreground">
              <Lock className="size-4" />
              {currencyLabels[event.currency] ?? event.currency}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              className="h-10 rounded-[8px] px-4 text-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isNameMissing}
              className={cn(primaryButtonClass, 'gap-2 px-4')}
            >
              {isLoading ? <Spinner className="size-4" /> : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
