import { EventDetailScreen } from '@/components/event-detail-screen'

/*
  El detalle con Gastos encendido (SPLT-011/012/013/014). Saldos sigue en su
  estado vacio: esas historias (SPLT-015/016) todavia no se entregaron.
*/
export default async function ExpensesEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EventDetailScreen eventId={id} showExpenses />
}
