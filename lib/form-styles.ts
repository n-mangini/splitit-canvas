/**
 * Estilo compartido de campos y acciones primarias.
 *
 * Nacio en login/registro y es el que manda para el resto de la app: si una
 * pantalla nueva dibuja un input o un boton primario, sale de aca. Tenerlo en
 * un solo lugar evita que cada pantalla invente su propio radio y su propio
 * peso tipografico.
 */

export const fieldClass =
  'h-auto rounded-[6px] border-[#cbd5e1] bg-white px-3 py-2 text-base leading-6 text-[#0f172a] placeholder:text-[#94a3b8] md:text-base'

export const primaryButtonClass = 'h-10 rounded-[8px] text-xl font-medium text-[#fcfcfe]'

/** Accion secundaria: mismo alto y radio que la primaria, sin el peso del color. */
export const secondaryButtonClass =
  'h-10 rounded-[8px] border-[#cbd5e1] bg-white text-xl font-medium text-[#0f172a] hover:bg-[#f8fafc]'
