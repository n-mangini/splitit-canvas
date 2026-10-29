import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { YbugWidget } from '@/components/ybug-widget'
import './globals.css'

// Fuentes, iconos y clases del <html> copiados del layout del front oficial
// (SplitItLab/SplitIt, web/app/layout.tsx) para que las pantallas se vean igual.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const title = 'SplitIt Design'
const description =
  'Canvas de pantallas del prototipo. Datos de ejemplo, no es la app en produccion.'

export const metadata: Metadata = {
  title,
  description,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary', title, description },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <YbugWidget />
      </body>
    </html>
  )
}
