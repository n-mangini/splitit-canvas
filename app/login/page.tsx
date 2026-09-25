'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthHeading, AuthSplitLayout } from '@/components/auth-split-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'


function LoginFallback() {
  return <div className="min-h-screen bg-primary-foreground" />
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Mock validation
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const redirect = searchParams.get('redirect')
    router.push(redirect ?? '/events')
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md space-y-[10px] lg:max-w-none">
        <AuthHeading title="Bienvenido a SplitIt" subtitle="Ingresa tus datos para continuar" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} pr-14`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(primaryButtonClass, 'h-11 w-full')}
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrate gratis
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
