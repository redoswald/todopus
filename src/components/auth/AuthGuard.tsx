import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, session } = useAuth()

  console.log('AuthGuard state:', { loading, hasUser: !!user, hasSession: !!session })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        <div className="text-sm text-gray-500">Loading auth...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
