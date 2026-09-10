'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRoundCheck, Users } from 'lucide-react'
import { mockEvents } from '@/lib/mock-data'
import { EventBadge } from '@/components/event-badge'

type StoredClaim = {
  eventId: string
  participantId: string
  token: string
  claimedAt: string
}

type StoredClaims = Record<string, StoredClaim>

const CLAIMS_STORAGE_KEY = 'splitit:participant-claims'

function createToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readStoredClaims(): StoredClaims {
  try {
    const rawClaims = localStorage.getItem(CLAIMS_STORAGE_KEY)
    return rawClaims ? JSON.parse(rawClaims) : {}
  } catch {
    return {}
  }
}

function getClaimKey(eventId: string, participantId: string) {
  return `${eventId}:${participantId}`
}

export function JoinEventClient({
  code,
  step,
}: {
  code: string
  step?: string
}) {
  const router = useRouter()
  const [participantId, setParticipantId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [storedClaims, setStoredClaims] = useState<StoredClaims>({})
  const [currentClaim, setCurrentClaim] = useState<StoredClaim | null>(null)

  const event = mockEvents.find((item) => item.inviteCode === code)
  const showParticipantSelector = step === 'select'

  const availableParticipants = useMemo(() => {
    if (!event) return []
    return event.participants.filter((participant) => {
      const claim = storedClaims[getClaimKey(event.id, participant.id)]
      return !claim || claim.token === currentClaim?.token
    })
  }, [currentClaim?.token, event, storedClaims])

  useEffect(() => {
    if (!event || !showParticipantSelector) return
    const claims = readStoredClaims()
    const existingClaim = Object.values(claims).find((claim) => claim.eventId === event.id) ?? null
    setStoredClaims(claims)
    setCurrentClaim(existingClaim)
    setParticipantId(existingClaim?.participantId ?? '')
  }, [event, showParticipantSelector])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!event) return

    if (!participantId) {
      setError('Por favor selecciona tu nombre en la lista')
      return
    }

    const claims = readStoredClaims()
    const claimKey = getClaimKey(event.id, participantId)
    const existingClaim = claims[claimKey]

    if (existingClaim && existingClaim.token !== currentClaim?.token) {
      setError('Ese nombre ya fue elegido desde este navegador')
      setStoredClaims(claims)
      return
    }

    const claim = existingClaim ?? {
      eventId: event.id,
      participantId,
      token: currentClaim?.token ?? createToken(),
      claimedAt: new Date().toISOString(),
    }

    setIsLoading(true)
    claims[claimKey] = claim
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims))
    setStoredClaims(claims)
    setCurrentClaim(claim)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/events/${event.id}`)
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-3xl">?</span>
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Evento no encontrado</h2>
            <p className="mb-6 text-muted-foreground">
              El codigo de invitacion no es valido o el evento ya no existe
            </p>
            <Link href="/">
              <Button>Ir al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-lg font-bold text-foreground">SplitIt</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <EventBadge icon={event.icon} size="lg" className="mx-auto mb-4" />
              <CardTitle className="text-2xl text-foreground">{event.name}</CardTitle>
              <CardDescription>
                {event.description || 'Te invitaron a dividir gastos'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-center border-y border-border py-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{event.participants.length}</p>
                  <p className="text-xs text-muted-foreground">Participantes</p>
                </div>
              </div>

              {showParticipantSelector ? (
                  <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="participant">Quien sos en este evento?</Label>
                      <Select value={participantId} onValueChange={setParticipantId}>
                        <SelectTrigger id="participant" className="h-12 w-full rounded-[18px] bg-input">
                          <SelectValue placeholder="Elegite de la lista" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableParticipants.map((participant) => (
                            <SelectItem key={participant.id} value={participant.id}>
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          {currentClaim ? 'Continuar al evento' : 'Unirme al evento'}
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <Users className="h-4 w-4" />
                      Continuar sin cuenta
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => router.push(`/login?redirect=/join/${code}?step=select`)}
                    >
                      <UserRoundCheck className="h-4 w-4" />
                      Continuar con mi cuenta
                    </Button>
                  </div>
                )
              }
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
