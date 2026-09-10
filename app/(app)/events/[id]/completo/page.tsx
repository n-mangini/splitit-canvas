import { EventDetailScreen } from '@/components/event-detail-screen'

/*
  El detalle con gastos y saldos, que son de otras historias. Vive fuera del
  canvas hasta que esas historias se entreguen: es la misma pantalla que
  /events/[id] con el alcance completo, no una copia.
*/
export default async function FullEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EventDetailScreen eventId={id} full />
}
