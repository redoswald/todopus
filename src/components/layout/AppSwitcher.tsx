'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export function AppSwitcher() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/inbox')}
      className="flex items-center gap-2 w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <Zap className="w-5 h-5 text-accent-500" />
      <span className="text-sm font-semibold text-gray-900">Intend</span>
    </button>
  )
}
