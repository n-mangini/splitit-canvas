import { EventDetailScreen } from '@/components/event-detail-screen'

/*
  El detalle con saldos, que son de SPLT-015/016 y todavia no se entregaron.
  Vive fuera del canvas hasta que lleguen: es la misma pantalla que
  /events/[id]/gastos con Saldos tambien encendido, no una copia.
*/
export default async function FullEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EventDetailScreen eventId={id} showExpenses showBalances />
}
