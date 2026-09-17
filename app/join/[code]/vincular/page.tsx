import { JoinEventClient } from '../join-event-client'

/** Vincular la cuenta a un integrante, ya con sesión iniciada (SPLT-010). */
export default async function LinkAccountPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="link" />
}
