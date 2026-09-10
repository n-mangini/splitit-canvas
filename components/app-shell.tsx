'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlignJustify, LayoutGrid, UserRound } from 'lucide-react'
import { Logo } from '@/components/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-primary-foreground/85 px-6 pb-4 pt-6 backdrop-blur-md sm:px-10 sm:pt-8">
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          aria-label="Ir a eventos"
          className="flex items-center rounded-[24px] border border-border bg-card px-4 py-[11px]"
        >
          <Logo />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Abrir menu"
            className="flex items-center gap-3 rounded-[24px] bg-foreground p-[10px] outline-none"
          >
            <span className="flex size-12 items-center justify-center rounded-full text-primary-foreground">
              <AlignJustify className="size-6" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-[24px] p-2">
            <DropdownMenuItem asChild>
              <Link
                href="/events"
                className={cn(
                  'rounded-[16px] px-3 py-2.5 text-sm font-medium',
                  pathname.startsWith('/events') && 'text-primary',
                )}
              >
                <LayoutGrid className="size-4" />
                Eventos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className={cn(
                  'rounded-[16px] px-3 py-2.5 text-sm font-medium',
                  pathname.startsWith('/profile') && 'text-primary',
                )}
              >
                <UserRound className="size-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-primary-foreground">
      <NavBar />
      <main className="px-6 pb-16 pt-4 sm:px-10 sm:pt-6">{children}</main>
    </div>
  )
}
