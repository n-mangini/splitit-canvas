import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingBackground } from '@/components/landing-background'
import { LandingBalanceCard } from '@/components/landing-balance-card'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'SplitIt · landing',
}

/**
 * Landing (SPLT-018). Es la home del front, pero en el prototipo `/` pertenece
 * al canvas, asi que vive en `/inicio`.
 *
 * Las medidas salen de los artboards del Figma: 390x844 para mobile y
 * 1440x1024 para desktop, con el corte en `lg`. La barra esta en el flujo en
 * vez de absoluta como en el diseño, de ahi que el `padding-top` del contenido
 * sea el del artboard menos los 88px de la barra.
 */
export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-card">
      <LandingBackground />

      {/* Barra de landing, no la del AppShell: una sola seccion no tiene que
          navegar, asi que no hay menu ni acciones. El que vuelve entra por el
          CTA: /register ya lleva dos salidas a /login. */}
      <header className="relative flex h-[88px] shrink-0 items-center px-4 py-2">
        <div className="flex h-[68px] items-center px-[10px]">
          <Link
            href="/inicio"
            aria-label="SplitIt"
            className="flex h-full items-center rounded-[24px] border border-border bg-card px-4 py-[11px]"
          >
            <Logo />
          </Link>
        </div>
      </header>

      {/* El hero se centra en el alto que sobra en vez de colgar de un padding
          fijo, asi el bloque no queda hundido cuando la pantalla es alta.
          El pb compensa opticamente la barra, pero solo en desktop: en mobile
          el bloque ocupa casi todo el alto y ese mismo pb le come el aire de
          arriba, dejando el titulo pegado a la barra y encima de la onda. */}
      <main className="relative flex flex-1 items-center px-5 lg:px-[140px] lg:pb-[88px]">
        <div className="flex w-full flex-col items-start lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* En mobile el texto se queda con el primer pantallazo entero, igual
              que la columna izquierda de desktop: la tarjeta cae abajo del
              pliegue y asoma 72px para que se note que hay scroll. */}
          <div className="flex min-h-[calc(100svh-160px)] flex-col justify-center gap-6 lg:min-h-0 lg:gap-3">
            {/* En desktop el titular entra en un renglon; el ancho de mobile
                esta para que corte en "Comparti el link / y listo." y no deje
                la "y" colgando arriba. */}
            <h1 className="max-w-[295px] text-[36px] font-extrabold leading-[1.15] text-foreground lg:max-w-[700px] lg:text-[60px]">
              Compartí el link y listo.
            </h1>

            <p className="max-w-[350px] text-[14px] text-black lg:max-w-[560px] lg:text-[18px]">
              Tus amigos cargan gastos y ven sus saldos sin crear cuenta ni bajar nada.
            </p>

            {/* Verde de marca y no el violeta del Figma: en este producto el
                violeta es el color de la deuda (ver AGENTS.md y la tarjeta de
                al lado). El resto del estilo sale de `primaryButtonClass`, que
                es de donde tiene que salir todo boton primario nuevo. */}
            <Button asChild className={cn(primaryButtonClass, 'w-fit gap-[10px] px-[14px]')}>
              <Link href="/register">
                Crear un evento
                <ArrowRight className="size-6" />
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-[380px] shrink-0 pb-16 lg:pb-0">
            <LandingBalanceCard />
          </div>
        </div>
      </main>
    </div>
  )
}
