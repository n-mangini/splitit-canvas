import { JoinEventClient } from '../join-event-client'

/** Identificarse para entrar sin cuenta (SPLT-009). */
export default async function IdentifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="identify" />
}
