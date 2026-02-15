import type { Metadata } from 'next'
import { Providers } from '@/components/providers'  
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Deriverse Analytics - Trading Dashboard',
  description: 'Comprehensive trading analytics for Deriverse traders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
