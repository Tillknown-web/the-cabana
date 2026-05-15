import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import LoadingScreen from '@/components/landing/LoadingScreen'
import CustomCursor from '@/components/landing/CustomCursor'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'The Cabana',
  description: 'a private dining experience, curated for the discerning few',
  openGraph: {
    title: 'The Cabana',
    description: 'an evening of curated indulgence',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full`}>
      <body className="min-h-full" suppressHydrationWarning>
        {/* Film grain overlay — fixed, covers entire viewport */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Cinematic loading screen */}
        <LoadingScreen />

        {/* Custom glow cursor */}
        <CustomCursor />

        {children}
      </body>
    </html>
  )
}
