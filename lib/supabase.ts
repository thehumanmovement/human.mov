import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
      // Prefer service role key (server-side only, bypasses RLS) over anon key
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.SUPABASE_ANON_KEY
        || ''
      _supabase = createClient(url, key)
    }
    return (_supabase as any)[prop]
  },
})
