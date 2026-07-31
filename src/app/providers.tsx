'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; client components never fetch during
  // prerender, so a per-mount instance is safe on the server too
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: 1,
          },
        },
      })
  )

  // One-time migration: old opus-* localStorage keys → intend-* after rename
  useEffect(() => {
    const sidebarWidth = localStorage.getItem('opus-sidebar-width')
    if (sidebarWidth !== null && localStorage.getItem('intend-sidebar-width') === null) {
      localStorage.setItem('intend-sidebar-width', sidebarWidth)
      localStorage.removeItem('opus-sidebar-width')
    }
    const subtasksExpanded = localStorage.getItem('opus-subtasks-expanded')
    if (subtasksExpanded !== null && localStorage.getItem('intend-subtasks-expanded') === null) {
      localStorage.setItem('intend-subtasks-expanded', subtasksExpanded)
      localStorage.removeItem('opus-subtasks-expanded')
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
