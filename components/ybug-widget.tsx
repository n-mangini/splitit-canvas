'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    ybug_settings?: { id: string }
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

    window.ybug_settings = { id }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://widget.ybug.io/button/${id}.js`
    document.body.appendChild(script)
  }, [])

  return null
}
