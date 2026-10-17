'use client'

import { useEffect } from 'react'
import { createYbugDiagnostics } from '@/lib/ybug-diagnostics'

declare global {
  interface Window {
    ybug_settings?: { id: string } & Partial<ReturnType<typeof createYbugDiagnostics>>
  }
}

/**
 * Boton de Ybug para reportar bugs. Los reportes llegan a #qa-splitit en Slack.
 *
 * Solo carga si hay `NEXT_PUBLIC_YBUG_ID`: sin la variable no aparece, asi que
 * local y los previews quedan limpios. Y solo en la ventana de arriba: el canvas
 * muestra cada pantalla en un iframe, y sin este corte habria un boton por
 * artboard.
 */
export function YbugWidget() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_YBUG_ID
    if (!id || window.self !== window.top || window.ybug_settings) return

    const diagnostics = process.env.NEXT_PUBLIC_YBUG_DIAGNOSTICS === 'true'
      ? createYbugDiagnostics(() => sessionStorage.getItem('splitit:ybug-diagnostics') === 'true')
      : {}
    window.ybug_settings = { id, ...diagnostics }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://widget.ybug.io/button/${id}.js`
    document.body.appendChild(script)
  }, [])

  return null
}
