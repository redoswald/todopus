import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

// Server-side auth helpers for layouts and server components. Interactive
// sign-in/up/out stays client-side in AuthContext via the browser client —
// both write the same cookie through the factories in lib/supabase/.

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export async function requireUser(): Promise<User> {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
