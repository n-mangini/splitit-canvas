'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Check, LogOut } from 'lucide-react'
import { mockCurrentUser } from '@/lib/mock-data'
import { PersonAvatar } from '@/components/person-avatar'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'

// Emails ya tomados por otras cuentas (mock hasta que exista backend)
const takenEmails = ['sofi@email.com', 'tomi@email.com', 'lau@email.com']

export default function ProfilePage() {
  const router = useRouter()
  const [account, setAccount] = useState(mockCurrentUser)
  const [name, setName] = useState(mockCurrentUser.name)
  const [email, setEmail] = useState(mockCurrentUser.email)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    const nextErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      nextErrors.name = 'El nombre no puede quedar vacio'
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'Ingresa un email con formato valido'
    } else if (
      normalizedEmail !== account.email.toLowerCase() &&
      takenEmails.includes(normalizedEmail)
    ) {
      nextErrors.email = 'Ese email ya esta registrado en otra cuenta'
    }

    setErrors(nextErrors)
    setSaved(false)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAccount({ ...account, name: name.trim(), email: normalizedEmail })
    setName(name.trim())
    setEmail(normalizedEmail)
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <h1 className="text-[40px] font-extrabold leading-[1.15] text-foreground sm:text-[60px]">
        Tu perfil
      </h1>
      <p className="text-sm font-medium text-muted-foreground">Configura las preferencias de tu perfil</p>

      {/* Informacion personal */}
      <section className="flex w-full flex-col gap-4 rounded-[24px] border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <PersonAvatar name={account.name} shape="square" size="lg" tone="receives" />
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-extrabold text-foreground sm:text-[32px]">
              {account.name}
            </h2>
            <p className="truncate text-sm font-medium text-muted-foreground">{account.email}</p>
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground">Actualiza tu informacion personal</p>

        <div className="grid w-full gap-6 pb-0.5 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="name" className="text-base font-extrabold text-black">
              Nombre completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm font-medium text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="email" className="text-base font-extrabold text-black">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm font-medium text-destructive">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={cn(primaryButtonClass, 'px-4')}
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : 'Guardar cambios'}
          </Button>
          {saved && (
            <p role="status" className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="size-4" />
              Cambios guardados
            </p>
          )}
        </div>
      </section>

      {/* Sesion */}
      <section className="flex w-full flex-col gap-4 rounded-[24px] border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-[10px]">
          <LogOut className="size-6 text-foreground" />
          <h2 className="text-base font-extrabold text-foreground">Sesion</h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Tu cuenta y tus eventos se mantienen; podes volver a entrar cuando quieras
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[489px]">
            <p className="text-base font-extrabold text-black">Cerrar sesion</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Salir de tu cuenta en este dispositivo
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="h-10 shrink-0 gap-[10px] rounded-[8px] bg-muted px-4 text-xl font-medium text-foreground hover:bg-muted-strong"
          >
            Cerrar sesion
            <LogOut className="size-6" />
          </Button>
        </div>
      </section>
    </div>
  )
}
