import { JoinEventClient } from '../../join-event-client'

/** Abrir el enlace de un evento donde la cuenta ya tiene integrante (SPLT-010). */
export default async function AlreadyLinkedPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="link-linked" />
}
