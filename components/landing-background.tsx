/**
 * Fondo decorativo de la landing: un archivo por viewport, compuesto a partir
 * de los frames del Figma (45:32 desktop y 45:34 mobile).
 *
 * Es el mismo archivo que la ficha del canvas ofrece para descargar, asi que
 * lo que el dev se lleva es exactamente lo que la pantalla muestra. Por eso va
 * como imagen y no como capas sueltas posicionadas desde el componente: ahi el
 * fondo solo existiria armado, y no habria nada que bajarse.
 *
 * Alto de viewport y no `inset-0`: en mobile la pagina es mas larga que la
 * pantalla —la tarjeta vive abajo del pliegue— y si no las ondas se estirarian
 * sobre los dos pantallazos.
 */
export function LandingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG decorativo;
          next/image no aporta nada y complica el object-cover. */}
      <img
        src="/landing/fondo-mobile.svg"
        alt=""
        className="size-full object-cover lg:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- idem */}
      <img
        src="/landing/fondo-desktop.svg"
        alt=""
        className="hidden size-full object-cover lg:block"
      />
    </div>
  )
}
