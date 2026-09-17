import { JoinEventClient } from './join-event-client'

export default async function JoinEventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return <JoinEventClient code={code} step="choice" />
}
