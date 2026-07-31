import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShortcutsHelpOverlay } from '@/components/shared/ShortcutsHelpOverlay'

interface KeyboardShortcutsContextValue {
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  selectedNavPath: string | null
  helpOverlayOpen: boolean
}

// Default value lets consumers render outside the provider (e.g. shared
// project views) with selection simply disabled.
const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue>({
  selectedTaskId: null,
  setSelectedTaskId: () => {},
  selectedNavPath: null,
  helpOverlayOpen: false,
})

export function useShortcuts() {
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

// Sidebar rows stay in the DOM when the sidebar is collapsed (width 0,
// overflow hidden) or off-canvas on mobile, so check the containing aside.
function getVisibleNavItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-nav-path]')).filter(el => {
    if (el.offsetParent === null) return false
    const aside = el.closest('aside')
    if (!aside) return true
    const rect = aside.getBoundingClientRect()
    return rect.width > 0 && rect.right > 0
  })
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  // Non-null while the sidebar "column" has the keyboard selection
  const [selectedNavPath, setSelectedNavPath] = useState<string | null>(null)
  const [helpOverlayOpen, setHelpOverlayOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Selection is per-view; drop it when the route changes
  useEffect(() => {
    setSelectedTaskId(null)
    setSelectedNavPath(null)
  }, [location.pathname])

  const moveTaskSelection = useCallback((direction: 1 | -1): boolean => {
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

  const moveNavSelection = useCallback((direction: 1 | -1): boolean => {
    const items = getVisibleNavItems()
    if (items.length === 0) return false
    setSelectedNavPath(current => {
      const index = items.findIndex(el => el.dataset.navPath === current)
      const next = index === -1
        ? (direction === 1 ? items[0] : items[items.length - 1])
        : items[Math.min(items.length - 1, Math.max(0, index + direction))]
      next.scrollIntoView({ block: 'nearest' })
      return next.dataset.navPath!
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

      const inSidebar = selectedNavPath !== null

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          if (inSidebar ? moveNavSelection(1) : moveTaskSelection(1)) e.preventDefault()
          break
        case 'k':
        case 'ArrowUp':
          if (inSidebar ? moveNavSelection(-1) : moveTaskSelection(-1)) e.preventDefault()
          break
        case 'ArrowLeft': {
          if (inSidebar) break
          const items = getVisibleNavItems()
          if (items.length === 0) break
          e.preventDefault()
          setSelectedTaskId(null)
          const current = items.find(el => el.dataset.navPath === location.pathname) ?? items[0]
          setSelectedNavPath(current.dataset.navPath!)
          current.scrollIntoView({ block: 'nearest' })
          break
        }
        case 'ArrowRight':
          if (!inSidebar) break
          e.preventDefault()
          setSelectedNavPath(null)
          moveTaskSelection(1)
          break
        case 'Enter':
          if (inSidebar) {
            e.preventDefault()
            navigate(selectedNavPath)
          }
          break
        case 'q': {
          e.preventDefault()
          const isAddCapable = ADD_CAPABLE_PATHS.some(re => re.test(location.pathname))
          navigate(isAddCapable ? `${location.pathname}?add=true` : '/inbox?add=true')
          break
        }
        case 'Escape':
          if (inSidebar) setSelectedNavPath(null)
          else setSelectedTaskId(null)
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [helpOverlayOpen, selectedNavPath, location.pathname, moveTaskSelection, moveNavSelection, navigate])

  return (
    <KeyboardShortcutsContext.Provider value={{ selectedTaskId, setSelectedTaskId, selectedNavPath, helpOverlayOpen }}>
      {children}
      <ShortcutsHelpOverlay isOpen={helpOverlayOpen} onClose={() => setHelpOverlayOpen(false)} />
    </KeyboardShortcutsContext.Provider>
  )
}
