import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { YbugWidget } from '@/components/ybug-widget'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

const title = 'SplitIt Design'
const description =
  'Canvas de pantallas del prototipo. Datos de ejemplo, no es la app en produccion.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        {/* Avisos de toda la app. Sonner ya se pone full-width abajo por
            debajo de 600px, asi que con bottom-right alcanza para los dos. */}
        <Toaster position="bottom-right" theme="light" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <YbugWidget />
      </body>
    </html>
  )
}
