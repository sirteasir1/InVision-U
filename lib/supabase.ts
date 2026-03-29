import { createClient } from '@supabase/supabase-js'

// Only used in API routes (server side) — never exposed to browser
export function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
