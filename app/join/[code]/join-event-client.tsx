'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, UserRoundPlus, Users } from 'lucide-react'

import { EventIcon } from '@/components/event-icon'
import { EventNotFound } from '@/components/event-not-found'
import { LoadingIndicator } from '@/components/loading-indicator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getInvitation, listInvitationMembers, type Invitation, type InvitationMember } from '@/lib/invitations'

/**
 * Pasos de la invitacion que el front oficial todavia no tiene: entrar sin
 * cuenta (SPLT-022) y sumarse como integrante nuevo (SPLT-022 y SPLT-010).
 *
 * Lo que el oficial ya tiene (elegir con cuenta, ya vinculado, sin integrantes
 * libres) vive en /eventos/invitacion/[token] y es su misma pantalla. Estos
 * pasos copian ese layout y esos controles para verse como parte del mismo
 * flujo.
 */
export type JoinStep = 'identify' | 'signup' | 'link-signup'

const ACTION_CLASS_NAME = 'h-10 w-full gap-2 rounded-[8px] px-4 text-xl font-medium'

const INVITED_EMAIL = 'nicolas@email.com'

export function JoinEventClient({ code, step }: { code: string; step: JoinStep }) {
  const [invitation, setInvitation] = useState<Invitation | null | 'not-found'>(null)
  const [members, setMembers] = useState<InvitationMember[]>([])

  useEffect(() => {
    Promise.all([getInvitation(code), listInvitationMembers(code)])
      .then(([inv, list]) => {
        setInvitation(inv)
        setMembers(list)
      })
      .catch(() => setInvitation('not-found'))
  }, [code])

  return (
    <div className="relative grid min-h-screen md:grid-cols-2">
      <div className="relative hidden min-h-screen overflow-hidden md:block">
        <Image src="/register-image.png" alt="" fill unoptimized className="object-cover" />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-[10px]">
          {invitation === null && (
            <div className="flex justify-center py-6">
              <LoadingIndicator message="Cargando la invitación…" />
            </div>
          )}
          {invitation === 'not-found' && <EventNotFound />}
          {invitation && invitation !== 'not-found' && (
            <>
              <InvitationHeader invitation={invitation} />
              {step === 'identify' && <IdentifyStep code={code} members={members} />}
              {step === 'signup' && (
                <SignupForm invitation={invitation} backHref={`/join/${code}/quien-sos`} />
              )}
              {step === 'link-signup' && (
                <SignupForm
                  invitation={invitation}
                  backHref={`/eventos/invitacion/${code}`}
                  withAccount
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** Igual al encabezado de la invitacion del front oficial. */
function InvitationHeader({ invitation }: { invitation: Invitation }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <EventIcon iconKey={invitation.iconKey} className="size-16 rounded-[18px]" />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-[32px] font-extrabold text-black">{invitation.name}</h1>
        {invitation.description && (
          <p className="text-muted-foreground text-sm font-medium">{invitation.description}</p>
        )}
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        <span className="text-foreground font-extrabold">{invitation.memberCount}</span>{' '}
        {invitation.memberCount === 1 ? 'participante' : 'participantes'}
      </p>
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-soft-info flex gap-2 rounded-[16px] p-4">
      <Info aria-hidden="true" className="text-info mt-1 size-4 shrink-0" />
      <p className="text-muted-foreground text-sm leading-6 font-medium">{children}</p>
    </div>
  )
}

/**
 * Identificarse sin cuenta (SPLT-022). La eleccion no se reserva: quien ya
 * entro con su cuenta aparece marcado, pero sin cuenta nadie puede probar que
 * el nombre es suyo, asi que no se bloquea a nadie por eso.
 */
function IdentifyStep({ code, members }: { code: string; members: InvitationMember[] }) {
  const router = useRouter()
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!memberId) {
      setError('Elegí quién sos de la lista.')
      return
    }
    setError(null)
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push('/eventos/1')
  }

  return (
    <form className="flex flex-col gap-[10px]" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-[6px]">
        <label htmlFor="identify-member" className="text-foreground text-sm font-medium">
          ¿Quién sos en este evento?
        </label>
        <select
          id="identify-member"
          value={memberId}
          onChange={(event) => {
            setMemberId(event.target.value)
            setError(null)
          }}
          aria-invalid={!!error}
          className="border-border text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive h-auto w-full rounded-[6px] border bg-white px-3 py-2 text-base leading-6 outline-none focus-visible:ring-3"
        >
          <option value="" disabled>
            Elegite de la lista
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.isLinked ? `${member.name} · ya entró con su cuenta` : member.name}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-sm font-medium">
          Los gastos que cargues se anotan a nombre de quien elijas, y su saldo es el que vas a
          ver como tuyo.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={submitting} className={ACTION_CLASS_NAME}>
        {submitting ? (
          <LoadingIndicator message="Entrando al evento…" />
        ) : (
          <>
            <Users aria-hidden="true" />
            Entrar al evento
          </>
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿No estás en la lista?{' '}
        <Link href={`/join/${code}/soy-nuevo`} className="text-primary font-bold hover:underline">
          Sumate al evento
        </Link>
      </p>
    </form>
  )
}

/**
 * Darse de alta uno mismo (SPLT-022 y SPLT-010). Con cuenta cambia el final,
 * no el pedido: el integrante nace vinculado y el evento le queda guardado.
 * Se avisa que sumarse cambia el reparto de todos.
 */
function SignupForm({
  invitation,
  backHref,
  withAccount = false,
}: {
  invitation: Invitation
  backHref: string
  withAccount?: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Ingresá tu nombre.')
      return
    }
    setError(null)
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push('/eventos/1')
  }

  return (
    <form className="flex flex-col gap-[10px]" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-[6px]">
        <label htmlFor="new-member" className="text-foreground text-sm font-medium">
          ¿Cómo te llamás?
        </label>
        <Input
          id="new-member"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          placeholder="Tu nombre en el evento"
          aria-invalid={!!error}
          className="h-11"
        />
        <p className="text-muted-foreground text-sm font-medium">
          {withAccount
            ? `Así te van a ver el resto de los integrantes. El evento queda vinculado a ${INVITED_EMAIL} y te aparece entre tus eventos.`
            : 'Así te van a ver el resto de los integrantes cuando carguen un gasto.'}
        </p>
      </div>

      <Notice>
        Los gastos se dividen entre todos los integrantes, así que al sumarte el evento pasa a
        repartirse entre {invitation.memberCount + 1}. Si ya estás en la lista con otro nombre,
        mejor elegite de ahí.
      </Notice>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={submitting} className={ACTION_CLASS_NAME}>
        {submitting ? (
          <LoadingIndicator message="Sumándote al evento…" />
        ) : (
          <>
            <UserRoundPlus aria-hidden="true" />
            Sumarme al evento
          </>
        )}
      </Button>

      <p className="text-center text-sm">
        <Link
          href={backHref}
          className="text-primary inline-flex items-center gap-1 font-bold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver a la lista
        </Link>
      </p>
    </form>
  )
}
