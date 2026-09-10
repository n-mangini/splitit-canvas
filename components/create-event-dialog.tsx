'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { EventIcon, eventIcons, getEventIcon } from '@/lib/event-icons'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { mockCurrentUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const currencies = [
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'USD', label: 'USD - Dolar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'BRL', label: 'BRL - Real' },
]

export function CreateEventDialog() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [icon, setIcon] = useState<EventIcon>('plane')
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [members, setMembers] = useState<string[]>([])
  const [draftMember, setDraftMember] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [memberError, setMemberError] = useState('')

  const isNameMissing = !name.trim()

  const { Icon } = getEventIcon(icon)

  const close = () => router.push('/events')

  const addMember = () => {
    const value = draftMember.trim()
    if (!value) return
    // El creador ya ocupa su lugar en la lista, asi que tambien compite por el nombre.
    const taken = [mockCurrentUser.name, ...members].some(
      (member) => member.toLowerCase() === value.toLowerCase()
    )
    if (taken) {
      setMemberError('Ya hay un integrante con ese nombre')
      return
    }
    setMembers([...members, value])
    setDraftMember('')
    setMemberError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (isNameMissing) {
      setNameTouched(true)
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success(`Creamos «${name.trim()}»`)
    router.push('/events/event-1')
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
            Crear evento
          </DialogTitle>
          {/* Cruz propia: la del Dialog es un icono de 16px sin area tactil. */}
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
          {/* Icono: el lapiz abre el selector como popover y no como un segundo
              modal encima de este. */}
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
            <Label htmlFor="event-name" className="text-base font-extrabold text-black">
              Nombre del evento
            </Label>
            <Input
              id="event-name"
              placeholder="Viaje a la cordillera"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setNameTouched(true)}
              aria-invalid={nameTouched && isNameMissing}
              aria-describedby={nameTouched && isNameMissing ? 'event-name-error' : undefined}
              className={fieldClass}
            />
            {nameTouched && isNameMissing && (
              <p id="event-name-error" className="text-sm font-medium text-destructive">
                El nombre del evento es obligatorio
              </p>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="event-description" className="text-base font-extrabold text-black">
              Descripcion <span className="font-medium text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="event-description"
              placeholder="Datos importantes para la distincion del evento"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={cn(fieldClass, 'min-h-[84px]')}
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label className="text-base font-extrabold text-black">Moneda del evento</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-10 w-fit gap-2 rounded-[8px] border-0 bg-muted px-4 text-base font-medium text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[16px]">
                {currencies.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="event-member" className="text-base font-extrabold text-black">
              Integrantes
            </Label>
            <p className="text-sm font-medium text-muted-foreground">
              Las personas que entren al evento lo haran con alguno de estos nombres
            </p>

            <div className="flex gap-2">
              <Input
                id="event-member"
                placeholder="Nombre"
                value={draftMember}
                onChange={(event) => setDraftMember(event.target.value)}
                onKeyDown={(event) => {
                  // Enter agrega el integrante, no envia el formulario.
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addMember()
                  }
                }}
                aria-invalid={!!memberError}
                className={cn(fieldClass, 'flex-1')}
              />
              <Button
                type="button"
                onClick={addMember}
                className={cn(primaryButtonClass, 'shrink-0 px-4 text-base')}
              >
                Agregar
              </Button>
            </div>

            {memberError && <p className="text-sm font-medium text-destructive">{memberError}</p>}

            {/* El Figma no dibuja esta lista, pero sin ella no se ve al creador
                precargado ni hay forma de sacar a alguien recien agregado. */}
            <ul className="mt-1 flex flex-col gap-1">
              <li className="flex items-center justify-between gap-2 rounded-[8px] bg-background py-1 pl-3 pr-1">
                <span className="truncate text-sm font-medium text-foreground">
                  {mockCurrentUser.name}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">vos</span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center text-primary">
                  <Check className="size-4" />
                </span>
              </li>
              {members.map((member) => (
                <li
                  key={member}
                  className="flex items-center justify-between gap-2 rounded-[8px] bg-background py-1 pl-3 pr-1"
                >
                  <span className="truncate text-sm font-medium text-foreground">{member}</span>
                  <button
                    type="button"
                    onClick={() => setMembers(members.filter((item) => item !== member))}
                    aria-label={`Quitar a ${member}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-muted-strong hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex pt-2 sm:justify-end">
            <Button
              type="submit"
              disabled={isLoading || isNameMissing}
              className={cn(primaryButtonClass, 'w-full gap-2 px-4 sm:w-auto')}
            >
              {isLoading ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  Crear evento
                  <Users className="size-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
