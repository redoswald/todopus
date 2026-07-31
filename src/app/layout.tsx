import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Providers } from './providers'
import '@/index.css'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- DM Sans moves to next/font in the design-system follow-up (Phase 3) */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
