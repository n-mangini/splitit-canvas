import Image from 'next/image'

export function AuthSplitLayout({
  children,
  topRight,
}: {
  children: React.ReactNode
  topRight?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-stretch bg-primary-foreground">
      {/* Imagen (mitad izquierda, oculta en mobile) */}
      <div className="relative hidden w-1/2 shrink-0 lg:block">
        <Image
          src="/auth-hero.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="pointer-events-none object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="flex w-full flex-col p-4 lg:w-1/2">
        {topRight && <div className="flex justify-end">{topRight}</div>}
        <div className="flex flex-1 flex-col items-center justify-center gap-[10px] px-6 py-[10px] sm:px-16 lg:px-[140px]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-[32px] font-extrabold text-black">{title}</h1>
      <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
    </div>
  )
}
