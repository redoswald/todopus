import { useEffect } from 'react'

interface ProjectContextMenuProps {
  position: { x: number; y: number }
  onClose: () => void
  onDelete: () => void
}

export function ProjectContextMenu({ position, onClose, onDelete }: ProjectContextMenuProps) {
  // Clamp to viewport
  const menuWidth = 160
  const menuHeight = 40
  const x = Math.min(position.x, window.innerWidth - menuWidth - 8)
  const y = Math.min(position.y, window.innerHeight - menuHeight - 8)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
        >
          Delete project
        </button>
      </div>
    </>
  )
}
