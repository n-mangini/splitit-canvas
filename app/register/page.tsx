'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthHeading, AuthSplitLayout } from '@/components/auth-split-layout'
import { AuthDivider, GoogleAuthButton } from '@/components/google-auth-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { fieldClass, primaryButtonClass } from '@/lib/form-styles'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'


export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setError('')
    setIsGoogleLoading(true)

    // Simulate the round trip through Google
    await new Promise(resolve => setTimeout(resolve, 1000))

    router.push('/events')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock success - redirect to events
    router.push('/events')
  }

  return (
    <AuthSplitLayout
      topRight={
        <Link href="/login" className="text-base font-medium text-black hover:underline">
          LogIn
        </Link>
      }
    >
      <div className="w-full max-w-md space-y-[10px] lg:max-w-none">
        <AuthHeading
          title="Crea una cuenta"
          subtitle="Ingresa mail y contraseña para crear tu cuenta"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="name" className="text-sm font-medium text-[#0f172a]">
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="email" className="text-sm font-medium text-[#0f172a]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="password" className="text-sm font-medium text-[#0f172a]">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} pr-14`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className={cn(primaryButtonClass, 'w-full')}
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : 'Crear cuenta'}
          </Button>
        </form>

        <div className="flex flex-col gap-[10px]">
          <AuthDivider />
          <GoogleAuthButton
            onClick={handleGoogle}
            isLoading={isGoogleLoading}
            disabled={isLoading}
          />
        </div>

        <p className="text-center text-sm text-[#868992]">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
