import { notFound } from 'next/navigation'
import { EditEventDialog } from '@/components/edit-event-dialog'
import { EventDetailScreen } from '@/components/event-detail-screen'
import { mockEvents } from '@/lib/mock-data'

/**
 * Editar no es una pantalla aparte: es un modal sobre el detalle, como crear
 * evento lo es sobre el listado. La ruta existe para que el canvas la pueda
 * mostrar como artboard.
 */
export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = mockEvents.find((item) => item.id === id)
  if (!event) notFound()

  return (
    <>
      <EventDetailScreen eventId={id} initialTab="members" />
      <EditEventDialog event={event} />
    </>
  )
}
