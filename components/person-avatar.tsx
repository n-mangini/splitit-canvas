import { getInitials } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

/**
 * Las iniciales de una persona.
 *
 * Dos formas, y la diferencia significa algo: **cuadrado** cuando la persona
 * es el tema de la pantalla (la cuenta propia), **circulo** cuando es una fila
 * de una lista (integrantes, saldos, pagos sugeridos).
 *
 * El tono sigue la convencion de toda la app: verde recibe, violeta debe,
 * neutro en cero. `owner` es el dueno del evento, y es el unico relleno.
 *
 * Antes cada pantalla armaba su propio circulo y perfil tenia ademas su propia
 * copia de la funcion de iniciales.
 */
export function PersonAvatar({
  name,
  shape = 'circle',
  size = 'md',
  tone = 'neutral',
  className,
}: {
  name: string
  shape?: 'circle' | 'square'
  size?: 'sm' | 'md' | 'lg'
  tone?: 'neutral' | 'receives' | 'owes' | 'owner'
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center font-extrabold',
        shape === 'circle' ? 'rounded-full' : '',
        size === 'sm' && ['size-10 text-xs', shape === 'square' && 'rounded-[12px]'],
        size === 'md' && ['size-11 text-sm', shape === 'square' && 'rounded-[14px]'],
        size === 'lg' && ['size-14 text-lg', shape === 'square' && 'rounded-[16px]'],
        tone === 'neutral' && 'bg-muted text-foreground',
        tone === 'receives' && 'bg-soft-primary text-primary',
        tone === 'owes' && 'bg-soft-secondary text-secondary',
        tone === 'owner' && 'bg-primary text-primary-foreground',
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
