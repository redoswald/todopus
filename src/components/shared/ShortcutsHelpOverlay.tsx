interface ShortcutsHelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
}

const SHORTCUT_GROUPS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['J', '↓'], description: 'Next item' },
      { keys: ['K', '↑'], description: 'Previous item' },
      { keys: ['←', '→'], description: 'Sidebar ↔ task list' },
      { keys: ['↵'], description: 'Open selected sidebar item' },
      { keys: ['Esc'], description: 'Back / clear selection' },
    ],
  },
  {
    title: 'Tasks',
    shortcuts: [
      { keys: ['Q'], description: 'Quick-add task' },
      { keys: ['C'], description: 'Complete selected task' },
      { keys: ['E', '↵'], description: 'Edit selected task' },
      { keys: ['Esc'], description: 'Close editor (saves changes)' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Command palette' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
]

export function ShortcutsHelpOverlay({ isOpen, onClose }: ShortcutsHelpOverlayProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Keyboard shortcuts</h2>
          <kbd className="px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded">esc</kbd>
        </div>

        <div className="p-4 space-y-4">
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map(shortcut => (
                  <div key={shortcut.description} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <span className="flex items-center gap-1">
                      {shortcut.keys.map(key => (
                        <kbd
                          key={key}
                          className="min-w-[1.5rem] px-1.5 py-0.5 text-xs text-center text-gray-600 bg-gray-200 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
