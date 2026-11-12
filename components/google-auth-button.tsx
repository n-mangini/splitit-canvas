'use client'

/**
 * Ingreso con Google (SPLT-019) en el canvas. El front oficial dibuja el boton
 * de Google Identity Services, que necesita un client ID y un dominio
 * autorizado: aca se lo imita con la misma combinacion (tema `outline`, tamaño
 * `large`, texto `continue_with`, forma `rectangular`) dentro del mismo armado
 * de `GoogleSignInButton` (separador, cargando y dialogo de cuenta existente).
 *
 * `?escenario=cuenta-existente` simula un email que ya tiene cuenta con
 * contraseña: al tocar el boton se abre el dialogo de vincular o reemplazar.
 */

import { useState } from 'react'
import { GoogleAccountChoiceDialog } from '@/components/google-account-choice-dialog'
import { LoadingIndicator } from '@/components/loading-indicator'
import { Separator } from '@/components/ui/separator'
import { GoogleAccountExistsError, loginWithGoogle, type ExistingAccountChoice } from '@/lib/auth'
import { canvasParam, useCanvasParam } from '@/lib/canvas-state'

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

export function GoogleAuthButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-10 w-full items-center justify-center rounded-[4px] border border-[#dadce0] bg-white px-3 font-['Roboto',arial,sans-serif] text-sm font-medium tracking-[0.25px] text-[#3c4043] transition-colors hover:border-[#d2e3fc] hover:bg-[#f8faff] focus-visible:border-[#d2e3fc] focus-visible:bg-[#f8faff] focus-visible:outline-none disabled:cursor-default disabled:opacity-60"
    >
      <span className="absolute left-3 flex size-[18px] items-center justify-center">
        <GoogleLogo />
      </span>
      <span className="truncate px-6">Continuar con Google</span>
    </button>
  )
}


type Props = { onSuccess: () => void; onError: () => void }

/** El mismo armado que `GoogleSignInButton` del oficial, con el boton imitado. */
export function CanvasGoogleButton({ onSuccess, onError }: Props) {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [pendingChoice, setPendingChoice] = useState(false)
  // Artboard con el dialogo de cuenta existente ya abierto.
  useCanvasParam('modal', 'cuenta-existente', () => setPendingChoice(true))

  const signIn = async (existingAccount?: ExistingAccountChoice) => {
    setIsSigningIn(true)
    try {
      // Simula la ida y vuelta por Google.
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (!existingAccount && canvasParam('escenario') === 'cuenta-existente') {
        throw new GoogleAccountExistsError()
      }
      await loginWithGoogle('credencial-de-ejemplo', existingAccount)
      onSuccess()
    } catch (err) {
      setIsSigningIn(false)
      if (err instanceof GoogleAccountExistsError) {
        setPendingChoice(true)
        return
      }
      onError()
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="text-text-secondary text-sm font-medium">o</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex min-h-11 justify-center" hidden={isSigningIn}>
        <GoogleAuthButton onClick={() => void signIn()} />
      </div>
      {isSigningIn && (
        <p className="text-text-secondary flex justify-center text-sm">
          <LoadingIndicator message="Ingresando con Google…" />
        </p>
      )}
      <GoogleAccountChoiceDialog
        open={pendingChoice}
        onChoose={(choice) => {
          setPendingChoice(false)
          void signIn(choice)
        }}
        onCancel={() => setPendingChoice(false)}
      />
    </div>
  )
}
