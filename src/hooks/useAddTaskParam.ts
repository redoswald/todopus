'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Opens the view's add-task editor when the URL carries ?add=true, then
// strips the param. Used by the command palette's "Add Task" entry and the
// global "q" shortcut. Next's searchParams are read-only, so stripping the
// param is a router.replace back to the bare pathname.
export function useAddTaskParam(onAdd: () => void) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onAddRef = useRef(onAdd)
  onAddRef.current = onAdd

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      onAddRef.current()
      router.replace(pathname)
    }
  }, [searchParams, pathname, router])
}
