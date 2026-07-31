import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import { Providers } from './providers'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Intend',
  description: 'Todoist-like task manager, MCP-first for AI.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-app="intend">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Script
          src="https://umami.aaronos.ai/script.js"
          data-website-id="104174b8-1fcb-458a-a5e5-42efa8f34931"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
