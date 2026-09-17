import { notFound } from 'next/navigation'
import { EventDetailScreen } from '@/components/event-detail-screen'
import { InviteEventDialog } from '@/components/invite-event-dialog'
import { mockCurrentUser, mockEvents } from '@/lib/mock-data'

/**
 * Compartir enlace (SPLT-008). Como editar y eliminar, es un modal sobre el
 * detalle; la ruta existe para que el canvas la muestre como artboard.
 *
 * Solo el dueño genera el enlace: si el evento es de otra persona, la ruta no
 * existe.
 */
export default async function InviteEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = mockEvents.find((item) => item.id === id)
  if (!event || event.createdBy !== mockCurrentUser.id) notFound()

  return (
    <>
      <EventDetailScreen eventId={id} initialTab="members" />
      <InviteEventDialog event={event} />
    </>
  )
}
