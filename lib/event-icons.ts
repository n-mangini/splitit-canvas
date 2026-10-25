import type { LucideIcon } from 'lucide-react'
import {
  Beer,
  CalendarDays,
  Briefcase,
  Car,
  Gift,
  Heart,
  Home,
  Music,
  PartyPopper,
  Plane,
  ShoppingBag,
  Tent,
  UtensilsCrossed,
} from 'lucide-react'

export type EventIcon =
  | 'plane'
  | 'home'
  | 'party'
  | 'food'
  | 'car'
  | 'tent'
  | 'gift'
  | 'shopping'
  | 'music'
  | 'heart'
  | 'beer'
  | 'briefcase'

export const eventIcons: { value: EventIcon; label: string; Icon: LucideIcon }[] = [
  { value: 'plane', label: 'Viaje', Icon: Plane },
  { value: 'home', label: 'Hogar', Icon: Home },
  { value: 'party', label: 'Fiesta', Icon: PartyPopper },
  { value: 'food', label: 'Comida', Icon: UtensilsCrossed },
  { value: 'car', label: 'Transporte', Icon: Car },
  { value: 'tent', label: 'Camping', Icon: Tent },
  { value: 'gift', label: 'Regalo', Icon: Gift },
  { value: 'shopping', label: 'Compras', Icon: ShoppingBag },
  { value: 'music', label: 'Concierto', Icon: Music },
  { value: 'heart', label: 'Pareja', Icon: Heart },
  { value: 'beer', label: 'Salida', Icon: Beer },
  { value: 'briefcase', label: 'Trabajo', Icon: Briefcase },
]

/**
 * Lo que se muestra cuando el evento no tiene icono elegido, o tiene uno que
 * esta app no conoce. El icono se guarda por nombre y es opcional, asi que
 * los dos casos llegan de verdad; sin esto caia en el primero del catalogo y
 * un cumple sin icono se presentaba como un viaje.
 *
 * No esta en `eventIcons` a proposito: no es una opcion para elegir, es la
 * ausencia de eleccion.
 */
export const fallbackEventIcon = { value: null, label: 'Evento', Icon: CalendarDays } as const

export function getEventIcon(value?: EventIcon) {
  return eventIcons.find((item) => item.value === value) ?? fallbackEventIcon
}
