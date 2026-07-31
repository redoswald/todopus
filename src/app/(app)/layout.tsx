import { requireUser } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'

// Middleware already gates these routes; this is the second line of defense
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return <AppShell>{children}</AppShell>
}
