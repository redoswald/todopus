import { createClient } from './client'

// Browser-client singleton. Every existing hook and component imports
// `supabase` from '@/lib/supabase', which now resolves here — the client is
// an @supabase/ssr cookie-backed browser client instead of the old
// localStorage one, but the API surface is identical.
export const supabase = createClient()
