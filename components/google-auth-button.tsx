'use client'

/**
 * Ingreso con Google (SPLT-019). El front oficial todavia no lo tiene: se
 * agrega debajo del formulario de las pantallas copiadas de login y registro.
 *
 * Vive en un solo lugar porque la misma pieza aparece en /login y /register: el
 * primer criterio de la historia pide que las dos pantallas ofrezcan la opcion.
 *
 * No sigue el estilo de la app a proposito: el front usa el boton oficial de
 * Google Identity Services, que no se puede estilizar. Esto lo imita con la
 * combinacion elegida por el PO: tema `outline`, tamaño `large`, texto
 * `continue_with`, forma `rectangular`, a lo ancho del formulario.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-[18px]">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/** Separador entre el formulario propio y el ingreso con Google. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <span className="text-sm font-medium text-muted-foreground">o</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export function GoogleAuthButton({
  onClick,
  isLoading = false,
  disabled = false,
}: {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="relative flex h-10 w-full items-center justify-center rounded-[4px] border border-[#dadce0] bg-white px-3 font-['Roboto',arial,sans-serif] text-sm font-medium tracking-[0.25px] text-[#3c4043] transition-colors hover:border-[#d2e3fc] hover:bg-[#f8faff] focus-visible:border-[#d2e3fc] focus-visible:bg-[#f8faff] focus-visible:outline-none disabled:cursor-default disabled:opacity-60"
    >
      <span className="absolute left-3 flex size-[18px] items-center justify-center">
        {isLoading ? <Spinner className="size-4 text-[#3c4043]" /> : <GoogleLogo />}
      </span>
      <span className="truncate px-6">Continuar con Google</span>
    </button>
  )
}

// Mensajes de SPLT-019. Cada uno tiene su variante de la pantalla por query
// (`?google=error`, `?google=cuenta-google`) para poder verlo en el canvas.
export function googleMessage(state: string | null): string | null {
  if (state === 'error') return 'No pudimos completar el ingreso con Google'
  if (state === 'cuenta-google') return 'Esta cuenta ahora ingresa con Google'
  return null
}

/** Separador + boton, listos para ir debajo del formulario. */
export function GoogleAuthSection({ redirect }: { redirect: string | null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogle = async () => {
    setIsLoading(true)
    // Simula la ida y vuelta por Google.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(redirect ?? '/eventos')
  }

  return (
    <div className="mt-5 flex flex-col gap-[10px]">
      <AuthDivider />
      <GoogleAuthButton onClick={handleGoogle} isLoading={isLoading} />
    </div>
  )
}
