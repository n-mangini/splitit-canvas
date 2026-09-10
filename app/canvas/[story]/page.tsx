import { notFound } from 'next/navigation'
import { LockedPrototypeFrame } from '@/components/locked-prototype-frame'
import { allStories, assetsOfStory, findStory, issueUrl, screensOfStory } from '@/lib/prototype-map'

export function generateStaticParams() {
  return allStories.map((story) => ({ story: story.id }))
}

type Props = {
  params: Promise<{ story: string }>
  searchParams: Promise<{ estado?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ story: string }> }) {
  const { story: storyId } = await params
  const found = findStory(storyId)
  if (!found) return { title: 'Prototipo · SplitIt' }
  return { title: `${found.story.id} · ${found.story.title} · prototipo SplitIt` }
}

export default async function StoryPage({ params, searchParams }: Props) {
  const { story: storyId } = await params
  const { estado } = await searchParams
  const found = findStory(storyId)
  if (!found) notFound()

  const { story } = found
  const states = screensOfStory(story.id)
  const assets = assetsOfStory(story.id)
  const index = Number(estado)
  const screen = states[Number.isInteger(index) && states[index] ? index : 0]

  return (
    <div style={{ minHeight: '100vh', background: '#1B1D23', color: '#E8ECF2' }}>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
          padding: '14px 24px',
          borderBottom: '1px solid #2E323C',
        }}
      >
        <a
          href="/canvas"
          style={{ color: '#8B93A3', fontSize: 13, textDecoration: 'none' }}
        >
          ← Canvas
        </a>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: '#8B5CF6',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          PROTOTIPO
        </span>
        <div style={{ marginRight: 'auto' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            <code
              style={{
                marginRight: 8,
                color: '#9BE7D2',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {story.id}
            </code>
            {story.title}
          </div>
          <div style={{ fontSize: 12, color: '#8B93A3' }}>
            {screen.title}
          </div>
        </div>
        <a
          href={issueUrl(story.issue)}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #343945',
            background: '#252932',
            color: '#E8ECF2',
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Criterios de aceptación · issue #{story.issue} ↗
        </a>
      </header>

      <main style={{ padding: '32px 24px 64px' }}>
        {states.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              maxWidth: 1440,
              margin: '0 auto 16px',
            }}
          >
            {states.map((item, position) => {
              const active = item.route === screen.route
              return (
                <a
                  key={item.route}
                  href={position === 0 ? `/canvas/${story.id}` : `/canvas/${story.id}?estado=${position}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    textDecoration: 'none',
                    border: `1px solid ${active ? '#2C5C50' : '#343945'}`,
                    background: active ? '#1E3A33' : '#252932',
                    color: active ? '#9BE7D2' : '#8B93A3',
                  }}
                >
                  {item.title}
                </a>
              )
            })}
          </div>
        )}

        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            borderRadius: 12,
            border: '1px solid #343945',
            background: '#F8FAFC',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          <LockedPrototypeFrame
            route={screen.route}
            title={`${story.id} · ${screen.title}`}
          />
        </div>

        {assets.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              maxWidth: 1440,
              margin: '16px auto 0',
            }}
          >
            <span style={{ fontSize: 12, color: '#8B93A3' }}>
              Arte de la pantalla, para llevarse:
            </span>
            {assets.map((asset) => (
              <a
                key={asset}
                href={asset}
                download
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #343945',
                  background: '#252932',
                  color: '#E8ECF2',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                {asset.split('/').pop()} ↓
              </a>
            ))}
          </div>
        )}

        <p style={{ maxWidth: 720, margin: '20px auto 0', fontSize: 12, color: '#6B7383' }}>
          La pantalla de arriba es interactiva, pero queda contenida acá: los controles
          funcionan sin llevarte a otra pantalla del prototipo. Para inspeccionar estilos y tokens,
          click derecho → Inspeccionar.
        </p>
      </main>
    </div>
  )
}
