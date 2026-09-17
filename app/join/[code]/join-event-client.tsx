'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, Lock, UserRoundCheck, UserRoundPlus, Users } from 'lucide-react'
import { AuthHeading, AuthSplitLayout } from '@/components/auth-split-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { EventBadge } from '@/components/event-badge'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { findEventByInviteCode, mockInvitedUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Event, Participant } from '@/lib/types'

/**
 * Entrada por enlace de invitacion (SPLT-009 y SPLT-010).
 *
 * El enlace alcanza para entrar: no hay invitacion que aceptar ni permiso que
 * pedir. Lo que el flujo resuelve no es el acceso, es *quien* entro, porque los
 * gastos se cargan a nombre de un integrante y los saldos son de alguien. De
 * ahi que los dos caminos terminen en la misma pregunta.
 *
 * Los cuatro pasos son rutas y no estados internos, para que el canvas pueda
 * mostrar cada uno como su propio artboard. Usan el mismo layout que login y
 * registro: son pantallas de acceso, y entrar por enlace es una forma de entrar.
 */
export type JoinStep =
  | 'choice'
  | 'identify'
  | 'signup'
  | 'link'
  | 'link-signup'
  | 'link-linked'

/** Lo ultimo que esta persona eligio ser en este evento, por navegador. */
const IDENTITY_STORAGE_KEY = 'splitit:identidad-por-evento'

function readIdentities(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(IDENTITY_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveIdentity(eventId: string, participantId: string) {
  try {
    const identities = readIdentities()
    identities[eventId] = participantId
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identities))
  } catch {
    // Sin storage el flujo sigue: lo unico que se pierde es venir preelegido
    // la proxima vez.
  }
}

export function JoinEventClient({ code, step }: { code: string; step: JoinStep }) {
  const event = findEventByInviteCode(code)

  if (!event) return <InvalidLink />

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md space-y-[10px] lg:max-w-none">
        <EventHeading event={event} />
        {step === 'choice' && <ChoiceStep event={event} code={code} />}
        {step === 'identify' && <IdentifyStep event={event} code={code} />}
        {step === 'signup' && (
          <SignupForm event={event} backHref={`/join/${code}/quien-sos`} />
        )}
        {step === 'link-signup' && (
          <SignupForm event={event} backHref={`/join/${code}/vincular`} withAccount />
        )}
        {step === 'link' && <LinkAccountStep event={event} code={code} />}
        {step === 'link-linked' && <AlreadyLinkedStep event={event} />}
      </div>
    </AuthSplitLayout>
  )
}

/**
 * El evento arriba de todo, en los cuatro pasos: es lo que le dice a la persona
 * que llego a donde la invitaron antes de pedirle cualquier cosa. Los datos son
 * los de SPLT-009: nombre, icono, descripcion y cuanta gente hay.
 */
function EventHeading({ event }: { event: Event }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <EventBadge icon={event.icon} size="lg" />
      <AuthHeading
        title={event.name}
        subtitle={event.description || 'Te invitaron a dividir gastos'}
      />
      <p className="text-sm font-medium text-muted-foreground">
        <span className="font-extrabold text-foreground">{event.participants.length}</span>{' '}
        {event.participants.length === 1 ? 'participante' : 'participantes'}
      </p>
    </div>
  )
}

/**
 * Un enlace que no corresponde a ningun evento. Es el mismo caso para un
 * enlace roto, uno viejo y uno de un evento que se elimino: desde afuera no se
 * distinguen, y decir cual es cada uno seria contar que el evento existio.
 */
function InvalidLink() {
  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md space-y-[10px] lg:max-w-none">
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-[16px] bg-destructive/10 text-destructive"
          >
            <Info className="size-6" />
          </span>
          <AuthHeading
            title="Este enlace no sirve"
            subtitle="El enlace no corresponde a ningún evento. Puede estar incompleto, o el evento puede haber sido eliminado."
          />
        </div>

        <Link href="/inicio" className="block">
          <Button className={cn(primaryButtonClass, 'w-full')}>Ir al inicio</Button>
        </Link>

        <p className="text-center text-sm text-muted-foreground">
          Pedile a quien te invitó que comparta el enlace de nuevo.
        </p>
      </div>
    </AuthSplitLayout>
  )
}

/** Aviso que no bloquea: informa algo que conviene saber y deja seguir. */
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-[16px] bg-soft-secondary p-4">
      <Info className="mt-0.5 size-4 shrink-0 text-secondary" />
      <p className="text-sm font-medium leading-6 text-muted-foreground">{children}</p>
    </div>
  )
}

/** Texto de ayuda debajo de un campo. */
function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-muted-foreground">{children}</p>
}

/**
 * Los dos caminos de entrada. Sin cuenta se entra directo; con cuenta hay que
 * pasar por el login, y de ahi se vuelve aca — por eso el redirect apunta al
 * paso de vincular y no al evento.
 */
function ChoiceStep({ event, code }: { event: Event; code: string }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <Link href={`/join/${code}/quien-sos`} className="block">
        <Button className={cn(primaryButtonClass, 'w-full gap-2')}>
          <Users className="size-4" />
          Continuar sin cuenta
        </Button>
      </Link>

      <Link href={`/login?redirect=/join/${code}/vincular`} className="block">
        <Button
          variant="outline"
          className={cn(primaryButtonClass, 'w-full gap-2 border-border bg-card text-foreground hover:bg-muted')}
        >
          <UserRoundCheck className="size-4" />
          Continuar con mi cuenta
        </Button>
      </Link>

      <p className="text-center text-sm text-muted-foreground">
        Sin cuenta podés cargar y ver los gastos de «{event.name}». Con cuenta, además, el
        evento te queda guardado entre tus eventos.
      </p>
    </div>
  )
}

/**
 * Identificarse sin cuenta (SPLT-009). La eleccion no se reserva: el sistema
 * avisa si ese integrante ya entro con su cuenta, pero deja seguir. Bloquearlo
 * seria peor, porque sin cuenta nadie puede probar que el nombre es suyo y el
 * que se equivoque deja afuera a la persona de verdad.
 */
function IdentifyStep({ event, code }: { event: Event; code: string }) {
  const router = useRouter()
  const [participantId, setParticipantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [knownIdentity, setKnownIdentity] = useState('')

  useEffect(() => {
    const stored = readIdentities()[event.id]
    if (stored && event.participants.some((participant) => participant.id === stored)) {
      setKnownIdentity(stored)
      setParticipantId(stored)
    }
  }, [event])

  const available = event.participants.filter((participant) => !participant.userId)

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault()

    if (!participantId) {
      setError('Elegí tu nombre de la lista')
      return
    }

    setError('')
    setIsLoading(true)
    saveIdentity(event.id, participantId)
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push(`/events/${event.id}`)
  }

  if (available.length === 0) {
    return (
      <div className="flex flex-col gap-[10px]">
        <p className="text-center text-sm text-muted-foreground">
          Todos los integrantes de este evento ya entraron con su cuenta, así que no queda
          ninguno para elegir. Sumate como integrante nuevo.
        </p>

        <SignupForm event={event} backHref={`/join/${code}`} backLabel="Volver" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[6px]">
        <Label htmlFor="participant" className="text-sm font-medium text-foreground">
          ¿Quién sos en este evento?
        </Label>
        <Select value={participantId} onValueChange={setParticipantId}>
          <SelectTrigger id="participant" className={cn(fieldClass, 'w-full')}>
            <SelectValue placeholder="Elegite de la lista" />
          </SelectTrigger>
          <SelectContent>
            {event.participants.map((participant) => (
              <SelectItem
                key={participant.id}
                value={participant.id}
                disabled={!!participant.userId}
              >
                <span className="flex items-center gap-2">
                  {participant.name}
                  {participant.userId && (
                    <>
                      <Lock aria-hidden className="size-3.5 text-muted-foreground" />
                      <span className="sr-only">ya entró con su cuenta</span>
                    </>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldHint>
          Los gastos que cargues se anotan a nombre de quien elijas, y su saldo es el que vas
          a ver como tuyo.
        </FieldHint>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading} className={cn(primaryButtonClass, 'w-full gap-2')}>
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <Users className="size-4" />
            {knownIdentity && knownIdentity === participantId
              ? 'Volver al evento'
              : 'Entrar al evento'}
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No estás en la lista?{' '}
        <Link href={`/join/${code}/soy-nuevo`} className="font-medium text-primary hover:underline">
          Sumate al evento
        </Link>
      </p>
    </form>
  )
}

/**
 * Darse de alta uno mismo (SPLT-009 y SPLT-010). Es la unica excepcion a que
 * la lista de integrantes la maneje el dueño: quien entra puede sumarse a si
 * mismo, y nada mas.
 *
 * Es el mismo formulario en los dos caminos. Con cuenta cambia el final, no el
 * pedido: el integrante nace vinculado, asi que el evento le queda guardado.
 * Que solo pudiera sumarse quien entra sin cuenta dejaba al que si tiene cuenta
 * sin salida cuando el dueño no lo habia anotado.
 *
 * Se avisa que sumarse cambia el reparto, porque cada gasto se divide entre
 * todos y de eso salen los saldos del resto.
 */
function SignupForm({
  event,
  backHref,
  backLabel = 'Volver a la lista',
  withAccount = false,
}: {
  event: Event
  backHref: string
  backLabel?: string
  withAccount?: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault()

    if (!name.trim()) {
      setError('Ingresá tu nombre')
      return
    }

    setError('')
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push(`/events/${event.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[6px]">
        <Label htmlFor="new-participant" className="text-sm font-medium text-foreground">
          ¿Cómo te llamás?
        </Label>
        <Input
          id="new-participant"
          value={name}
          onChange={(field) => setName(field.target.value)}
          placeholder="Tu nombre en el evento"
          className={fieldClass}
        />
        <FieldHint>
          {withAccount
            ? `Así te van a ver el resto de los integrantes. El evento queda vinculado a ${mockInvitedUser.email} y te aparece entre tus eventos.`
            : 'Así te van a ver el resto de los integrantes cuando carguen un gasto.'}
        </FieldHint>
      </div>

      <Notice>
        Los gastos se dividen entre todos los integrantes, así que al sumarte el evento pasa
        a repartirse entre {event.participants.length + 1}. Si ya estás en la lista con otro
        nombre, mejor elegite de ahí.
      </Notice>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading} className={cn(primaryButtonClass, 'w-full gap-2')}>
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <UserRoundPlus className="size-4" />
            Sumarme al evento
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </p>
    </form>
  )
}

/**
 * Ya vinculado (SPLT-010): la cuenta tiene integrante en este evento, asi que
 * no se vuelve a preguntar quien es. El integrante se llama como la cuenta
 * porque nacio de darse de alta uno mismo.
 */
function AlreadyLinkedStep({ event }: { event: Event }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <Notice>
        Ya estás en este evento como{' '}
        <span className="font-extrabold text-foreground">{mockInvitedUser.name}</span>, con la
        cuenta de {mockInvitedUser.email}.
      </Notice>

      <Link href={`/events/${event.id}`} className="block">
        <Button className={cn(primaryButtonClass, 'w-full gap-2')}>
          <Users className="size-4" />
          Entrar al evento
        </Button>
      </Link>
    </div>
  )
}

/**
 * Vincular la cuenta a un integrante (SPLT-010). La pantalla representa el
 * momento posterior al login: aca ya hay sesion, porque al login se llego desde
 * el paso anterior con el redirect de vuelta.
 *
 * A diferencia de la identificacion sin cuenta, este vinculo si es exclusivo:
 * una cuenta prueba quien es, asi que un integrante ya vinculado no se puede
 * volver a tomar.
 */
function LinkAccountStep({ event, code }: { event: Event; code: string }) {
  const router = useRouter()
  const hasMembersLeft = event.participants.some((participant) => !participant.userId)
  const [participantId, setParticipantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault()

    if (!participantId) {
      setError('Elegí quién sos en el evento')
      return
    }

    setError('')
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push(`/events/${event.id}`)
  }

  if (!hasMembersLeft) {
    return (
      <div className="flex flex-col gap-[10px]">
        <p className="text-center text-sm text-muted-foreground">
          Todos los integrantes de este evento ya tienen una cuenta vinculada, así que no
          queda ninguno para elegir. Sumate como integrante nuevo.
        </p>

        <SignupForm event={event} backHref={`/join/${code}`} backLabel="Volver" withAccount />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[6px]">
        <Label htmlFor="link-participant" className="text-sm font-medium text-foreground">
          ¿Quién sos en este evento?
        </Label>
        <Select value={participantId} onValueChange={setParticipantId}>
          <SelectTrigger id="link-participant" className={cn(fieldClass, 'w-full')}>
            <SelectValue placeholder="Elegite de la lista" />
          </SelectTrigger>
          <SelectContent>
            {event.participants.map((participant) => (
              <SelectItem
                key={participant.id}
                value={participant.id}
                disabled={!!participant.userId}
              >
                <span className="flex items-center gap-2">
                  {participant.name}
                  {participant.userId && (
                    <>
                      <Lock aria-hidden className="size-3.5 text-muted-foreground" />
                      <span className="sr-only">ya entró con su cuenta</span>
                    </>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldHint>
          Entrás con la cuenta de {mockInvitedUser.email}. El evento te va a quedar entre tus
          eventos.
        </FieldHint>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading} className={cn(primaryButtonClass, 'w-full gap-2')}>
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <UserRoundCheck className="size-4" />
            Soy esta persona
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No estás en la lista?{' '}
        <Link
          href={`/join/${code}/vincular/soy-nuevo`}
          className="font-medium text-primary hover:underline"
        >
          Sumate al evento
        </Link>
      </p>
    </form>
  )
}
