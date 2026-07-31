import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShortcutsHelpOverlay } from '@/components/shared/ShortcutsHelpOverlay'

interface KeyboardShortcutsContextValue {
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  helpOverlayOpen: boolean
}

// Default value lets TaskItem render outside the provider (e.g. shared
// project views) with selection simply disabled.
const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue>({
  selectedTaskId: null,
  setSelectedTaskId: () => {},
  helpOverlayOpen: false,
})

export function useTaskSelection() {
  return useContext(KeyboardShortcutsContext)
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

// Views that understand the ?add=true convention (see useAddTaskParam)
const ADD_CAPABLE_PATHS = [/^\/inbox$/, /^\/today$/, /^\/upcoming$/, /^\/project\/[^/]+$/]

function getVisibleTaskIds(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-task-id]'))
    .filter(el => el.offsetParent !== null)
    .map(el => el.dataset.taskId!)
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [helpOverlayOpen, setHelpOverlayOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Selection is per-view; drop it when the route changes
  useEffect(() => {
    setSelectedTaskId(null)
  }, [location.pathname])

  const moveSelection = useCallback((direction: 1 | -1): boolean => {
    const ids = getVisibleTaskIds()
    if (ids.length === 0) return false
    setSelectedTaskId(current => {
      const index = current ? ids.indexOf(current) : -1
      if (index === -1) {
        return direction === 1 ? ids[0] : ids[ids.length - 1]
      }
      return ids[Math.min(ids.length - 1, Math.max(0, index + direction))]
    })
    return true
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return

      if (e.key === '?') {
        e.preventDefault()
        setHelpOverlayOpen(open => !open)
        return
      }

      if (helpOverlayOpen) {
        if (e.key === 'Escape') setHelpOverlayOpen(false)
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          if (moveSelection(1)) e.preventDefault()
          break
        case 'k':
        case 'ArrowUp':
          if (moveSelection(-1)) e.preventDefault()
          break
        case 'q': {
          e.preventDefault()
          const isAddCapable = ADD_CAPABLE_PATHS.some(re => re.test(location.pathname))
          navigate(isAddCapable ? `${location.pathname}?add=true` : '/inbox?add=true')
          break
        }
        case 'Escape':
          setSelectedTaskId(null)
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [helpOverlayOpen, location.pathname, moveSelection, navigate])

  return (
    <KeyboardShortcutsContext.Provider value={{ selectedTaskId, setSelectedTaskId, helpOverlayOpen }}>
      {children}
      <ShortcutsHelpOverlay isOpen={helpOverlayOpen} onClose={() => setHelpOverlayOpen(false)} />
    </KeyboardShortcutsContext.Provider>
  )
}
