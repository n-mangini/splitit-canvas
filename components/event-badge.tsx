import { getEventIcon } from '@/lib/event-icons'
import type { EventIcon } from '@/lib/event-icons'
import { cn } from '@/lib/utils'

/**
 * El icono del evento, en el cuadrado redondeado del sistema.
 *
 * Vivia escrito tres veces con tres formas distintas: verde con radio 16 en el
 * listado, celeste con radio 20 en el detalle y celeste con radio 22 al entrar
 * por invitacion. Gana la del listado, que es la que quedo al aplicar el
 * Figma, y es la misma forma que usa el avatar de la cuenta.
 *
 * Sin icono elegido cae en el neutro, que resuelve `getEventIcon`.
 */
export function EventBadge({
  icon,
  size = 'md',
  className,
}: {
  icon?: EventIcon
  size?: 'sm' | 'md' | 'lg' | 'title'
  className?: string
}) {
  const { Icon } = getEventIcon(icon)

  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center bg-soft-primary text-primary',
        size === 'sm' && 'size-10 rounded-[12px]',
        size === 'md' && 'size-14 rounded-[16px]',
        size === 'lg' && 'size-16 rounded-[18px]',
        // Acompaña al nombre del evento y su descripcion: alto de las dos
        // lineas juntas, que crecen en desktop y el cuadrado con ellas.
        size === 'title' && 'size-14 rounded-[16px] lg:size-[68px] lg:rounded-[20px]',
        className
      )}
    >
      <Icon
        className={cn(
          size === 'sm' && 'size-5',
          size === 'md' && 'size-6',
          size === 'lg' && 'size-7',
          size === 'title' && 'size-6 lg:size-8'
        )}
      />
    </div>
  )
}
