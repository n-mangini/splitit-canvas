import { JoinEventClient } from '../join-event-client'

/** Sumarse a la lista de integrantes cuando no estás en ella (SPLT-009). */
export default async function SignupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="signup" />
}
