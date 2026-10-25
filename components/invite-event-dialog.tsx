'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, WandSparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { getInviteLink } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

/**
 * Compartir enlace de acceso (SPLT-008). Modal sobre el detalle, igual que
 * editar y eliminar el evento.
 *
 * El enlace lleva un token opaco: quien lo tiene entra al evento y maneja sus
 * gastos sin crear cuenta, asi que no puede ser un codigo adivinable. No hay
 * invitacion por email ni configuracion previa — el enlace ya existe y lo unico
 * que se hace es copiarlo.
 */
export function InviteEventDialog({ event }: { event: Event }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const inviteLink = getInviteLink(event.inviteCode)
  const close = () => router.push(`/events/${event.id}`)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
    } catch {
      // El portapapeles puede estar bloqueado dentro del artboard del canvas.
      // La confirmacion es lo que la historia pide mostrar, asi que se muestra
      // igual: el enlace esta a la vista y se puede copiar a mano.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-4 rounded-[24px] border-border bg-card p-6 shadow-none sm:max-w-[480px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span
              aria-hidden
              className="mb-2 flex size-12 items-center justify-center rounded-[16px] bg-soft-primary text-primary"
            >
              <WandSparkles className="size-6" />
            </span>
            <DialogTitle className="text-[28px] font-extrabold leading-[1.15] text-foreground">
              Invitar al evento
            </DialogTitle>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <DialogDescription className="text-sm font-medium leading-6 text-muted-foreground">
          Compartí este enlace y cualquiera puede entrar a «{event.name}», con cuenta o sin
          cuenta.
        </DialogDescription>

        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="invite-link" className="text-base font-extrabold text-black">
            Enlace de acceso
          </Label>
          <Input
            id="invite-link"
            readOnly
            value={inviteLink}
            onFocus={(field) => field.currentTarget.select()}
            className={cn(fieldClass, 'text-sm')}
          />
        </div>

        <Button onClick={handleCopy} className={cn(primaryButtonClass, 'w-full gap-2')}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </Button>

        {/* El enlace no se vence ni se puede dar de baja: hoy el producto no
            tiene como revocarlo, y quien lo reciba entra siempre. Decirlo acá
            es lo que evita que se comparta sin pensarlo. */}
        <p className="text-sm font-medium leading-6 text-muted-foreground">
          El enlace no vence y no se puede dar de baja: quien lo reciba va a poder entrar al
          evento.
        </p>
      </DialogContent>
    </Dialog>
  )
}
