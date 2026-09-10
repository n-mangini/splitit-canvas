import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * La tarjeta de "aca no hay nada".
 *
 * Habia cinco escritas a mano y ninguna coincidia: la de eventos media 162px
 * de alto y la de gastos 150, con distinto tamano y peso de titulo. Esta es la
 * forma que quedo al aplicar el Figma en el listado de eventos, y ahora es la
 * unica.
 *
 * El icono es opcional: va cuando el vacio es consecuencia de algo que el
 * usuario hizo (una busqueda sin resultados, un link que no lleva a ningun
 * lado) y se omite cuando es simplemente que todavia no cargo nada.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('splitit-card p-6 sm:p-8', className)}>
      <div className="mx-auto max-w-sm text-center">
        {Icon && (
          <span
            aria-hidden
            className="mx-auto mb-3 flex size-12 items-center justify-center rounded-[16px] bg-muted text-muted-foreground"
          >
            <Icon className="size-6" />
          </span>
        )}
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  )
}
