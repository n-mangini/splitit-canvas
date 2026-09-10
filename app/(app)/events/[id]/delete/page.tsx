import { notFound } from 'next/navigation'
import { DeleteEventDialog } from '@/components/delete-event-dialog'
import { EventDetailScreen } from '@/components/event-detail-screen'
import { mockEvents } from '@/lib/mock-data'

export default async function DeleteEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = mockEvents.find((item) => item.id === id)
  if (!event) notFound()

  return (
    <>
      <EventDetailScreen eventId={id} ownerActions initialTab="members" />
      <DeleteEventDialog event={event} />
    </>
  )
}
