/**
 * Estilo compartido de campos y acciones primarias.
 *
 * Nacio en login/registro y es el que manda para el resto de la app: si una
 * pantalla nueva dibuja un input o un boton primario, sale de aca. Tenerlo en
 * un solo lugar evita que cada pantalla invente su propio radio y su propio
 * peso tipografico.
 */

export const fieldClass =
  'h-auto rounded-[6px] border-border bg-white px-3 py-2 text-base leading-6 text-foreground placeholder:text-placeholder md:text-base'

export const primaryButtonClass = 'h-10 rounded-[8px] text-xl font-medium text-primary-foreground'
