import { redirect } from 'next/navigation'

// Preserve the old SPA fallback: unknown routes land in the inbox
// (middleware bounces logged-out visitors to /login from there)
export default function NotFound() {
  redirect('/inbox')
}
