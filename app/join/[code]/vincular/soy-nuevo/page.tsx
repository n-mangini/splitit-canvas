import { JoinEventClient } from '../../join-event-client'

/** Sumarse como integrante nuevo llegando con cuenta (SPLT-010). */
export default async function LinkSignupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="link-signup" />
}
