import { cn } from '@/lib/utils'

/**
 * Fondo decorativo de la landing.
 *
 * Cada capa es un vector exportado del Figma (frames 45:32 desktop y 45:34
 * mobile). Las cajas van en porcentajes del artboard original —1440x1024 y
 * 390x844— en vez de pixeles: asi la composicion se estira sola a cualquier
 * viewport y no hay coordenadas que recalcular cuando cambia el alto.
 *
 * El `Rectangle` que el Figma apoya debajo de las ondas no se exporto: su fill
 * es una imagen vacia y lo unico que aporta es el color de fondo, que ya pone
 * la pagina.
 */
type Layer = {
  src: string
  /** Caja del vector en % del artboard: left, top, width, height. */
  box: [number, number, number, number]
  /** Grados de rotacion. La caja de arriba es la del vector YA rotado. */
  rotate?: number
  /** Medida del vector sin rotar, en % de su propia caja. */
  inner?: [number, number]
}

const desktopLayers: Layer[] = [
  { src: '/landing/d-group.svg', box: [30.1332, 58.3211, 225.4162, 65.2584] },
  { src: '/landing/d-vector.svg', box: [64.495, 10.2625, 33.9689, 72.6022] },
  { src: '/landing/d-vector1.svg', box: [61.7343, 17.7542, 67.5713, 71.2724] },
  { src: '/landing/d-vector2.svg', box: [-1.4583, -17.2019, 67.2831, 33.4008] },
  { src: '/landing/d-group1.svg', box: [51.1635, -7.2578, 50.7865, 105.2887] },
  { src: '/landing/d-vector3.svg', box: [74.3029, -4.9631, 27.8961, 56.2784] },
  { src: '/landing/d-vector4.svg', box: [46.3189, -3.1639, 70.0978, 105.7148] },
  { src: '/landing/d-group2.svg', box: [39.9301, 6.1935, 76.7592, 97.8875] },
]

const mobileLayers: Layer[] = [
  { src: '/landing/m-vector.svg', box: [74.1026, 44.3128, 38.0121, 59.6525] },
  { src: '/landing/m-vector1.svg', box: [58.4615, 49.1706, 75.6138, 58.5599] },
  {
    src: '/landing/m-group.svg',
    box: [-31.2639, -4.6645, 153.7918, 113.8268],
    rotate: 1.94,
    inner: [94.7488, 98.058],
  },
  { src: '/landing/m-vector2.svg', box: [79.3939, -1.674, 31.2164, 46.2403] },
  {
    src: '/landing/m-vector3.svg',
    box: [-20.7692, -0.4443, 197.4359, 122.2284],
    rotate: -8.25,
    inner: [83.1574, 92.0424],
  },
  { src: '/landing/m-group1.svg', box: [-7.6923, 7.4926, 134.5178, 98.4315] },
  { src: '/landing/m-vector4.svg', box: [-5.3846, -13.7441, 117.4359, 29.5024] },
]

function Layers({ layers, className }: { layers: Layer[]; className: string }) {
  return (
    <div
      aria-hidden
      // Alto de viewport y no `inset-0`: en mobile la pagina es mas larga que
      // la pantalla (la tarjeta vive abajo del pliegue) y con inset-0 las ondas
      // se estirarian sobre los dos pantallazos.
      className={cn('pointer-events-none absolute inset-x-0 top-0 h-[100svh] overflow-hidden', className)}
    >
      {layers.map(({ src, box: [left, top, width, height], rotate, inner }) => {
        const style = {
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        }

        // Los vectores salen del Figma sin rotar: la caja describe el bounding
        // box final, y adentro se rota el vector a su medida original.
        if (rotate && inner) {
          return (
            <div key={src} className="absolute flex items-center justify-center" style={style}>
              <div
                style={{
                  width: `${inner[0]}%`,
                  height: `${inner[1]}%`,
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG que se
                    estira con preserveAspectRatio="none"; next/image no aplica. */}
                <img src={src} alt="" className="block size-full" />
              </div>
            </div>
          )
        }

        return (
          // eslint-disable-next-line @next/next/no-img-element -- idem
          <img key={src} src={src} alt="" className="absolute block size-full" style={style} />
        )
      })}
    </div>
  )
}

export function LandingBackground() {
  return (
    <>
      <Layers layers={mobileLayers} className="lg:hidden" />
      <Layers layers={desktopLayers} className="hidden lg:block" />
    </>
  )
}
