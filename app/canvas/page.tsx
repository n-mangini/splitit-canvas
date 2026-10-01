'use client'

import { useState } from 'react'
import { allStories, canvasHref, epics, screensOfEpic, visibleScreens } from '@/lib/prototype-map'

const viewports = {
  mobile: { label: 'Mobile', width: 390, height: 844 },
  desktop: { label: 'Desktop', width: 1440, height: 1024 },
} as const

type ViewportKey = keyof typeof viewports

export default function CanvasPage() {
  const [viewport, setViewport] = useState<ViewportKey>('mobile')
  const [scale, setScale] = useState(0.42)

  const { width, height } = viewports[viewport]

  return (
    <div style={{ minHeight: '100vh', background: '#1B1D23', color: '#E8ECF2' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
          padding: '14px 24px',
          background: 'rgba(27,29,35,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #2E323C',
        }}
      >
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>SplitIt Design</div>
          <div style={{ fontSize: 12, color: '#8B93A3' }}>
            {visibleScreens.length} pantallas · {allStories.length} historias
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: 3, background: '#252932', borderRadius: 8 }}>
          {(Object.keys(viewports) as ViewportKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                background: viewport === key ? '#8B5CF6' : 'transparent',
                color: viewport === key ? '#fff' : '#B4BBC8',
                fontWeight: viewport === key ? 600 : 400,
              }}
            >
              {viewports[key].label}
            </button>
          ))}
        </div>

        <label
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8B93A3' }}
        >
          Zoom
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.02}
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
            style={{ width: 120, accentColor: '#8B5CF6' }}
          />
          <span style={{ width: 34, textAlign: 'right', color: '#E8ECF2' }}>
            {Math.round(scale * 100)}%
          </span>
        </label>
      </header>

      <main style={{ padding: '32px 24px 80px' }}>
        {epics.map((epic) => (
          <section key={epic} style={{ marginBottom: 56 }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '0 0 20px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8B93A3',
              }}
            >
              {epic}
              <span style={{ flex: 1, height: 1, background: '#2E323C' }} />
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
              {screensOfEpic(epic).map((screen) => (
                <figure key={screen.route} style={{ margin: 0, width: width * scale }}>
                  <figcaption style={{ marginBottom: 8 }}>
                    <a
                      href={canvasHref(screen)}
                      style={{
                        color: '#E8ECF2',
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      {screen.title}
                    </a>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '6px 0 4px' }}>
                      {screen.stories.map((story) => (
                        <a
                          key={story.id}
                          href={`/canvas/${story.id}`}
                          title={story.title}
                          style={{
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: '#252932',
                            border: '1px solid #343945',
                            color: '#9BE7D2',
                            fontSize: 11,
                            fontFamily: 'var(--font-geist-mono), monospace',
                            textDecoration: 'none',
                          }}
                        >
                          {story.id}
                        </a>
                      ))}
                    </div>
                  </figcaption>

                  <a
                    href={canvasHref(screen)}
                    aria-label={`Abrir ${screen.title}`}
                    style={{
                      position: 'relative',
                      display: 'block',
                      width: width * scale,
                      height: height * scale,
                      overflow: 'hidden',
                      borderRadius: 8,
                      border: '1px solid #343945',
                      background: '#F8FAFC',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                  >
                    <iframe
                      src={screen.route}
                      title={screen.title}
                      loading="lazy"
                      tabIndex={-1}
                      style={{
                        width,
                        height,
                        border: 'none',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                      }}
                    />
                    {/* Tapa el iframe: el artboard es una miniatura, no una app usable */}
                    <span style={{ position: 'absolute', inset: 0 }} />
                  </a>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
