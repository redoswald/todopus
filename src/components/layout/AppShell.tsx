import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MaestroDrawer } from '../maestro/MaestroDrawer'
import { SettingsModal } from '../maestro/SettingsModal'
import { CommandPalette, useCommandPalette } from './CommandPalette'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [maestroOpen, setMaestroOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const commandPalette = useCommandPalette()

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenMaestro={() => {
          setSidebarOpen(false)
          setMaestroOpen(true)
        }}
        onOpenSettings={() => {
          setSidebarOpen(false)
          setSettingsOpen(true)
        }}
      />

      {/* Main content area - scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-4 p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -m-2 text-gray-600 hover:text-gray-900"
          >
            <MenuIcon />
          </button>
          <span className="font-semibold text-gray-900">Opus</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Maestro AI Drawer */}
      <MaestroDrawer
        isOpen={maestroOpen}
        onClose={() => setMaestroOpen(false)}
        onOpenSettings={() => {
          setMaestroOpen(false)
          setSettingsOpen(true)
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
      />
    </div>
  )
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
