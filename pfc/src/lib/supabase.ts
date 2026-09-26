import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Shared Supabase client.
 *
 * Credentials come exclusively from environment variables
 * (see `.env.example`). No key is ever hard-coded.
 *
 * Until the variables are set, `supabase` is `null`
 * and the app runs entirely on the mock data in `src/mocks`.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigure = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = supabaseConfigure
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabaseConfigure && import.meta.env.DEV) {
  console.warn(
    '[PFC] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set: ' +
      'the app is running on mock data. Copy .env.example to .env to configure Supabase.',
  )
}

/**
 * Returns the client or throws an explicit error. Use it in services
 * that require Supabase (auth, persistence) once they are implemented.
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    )
  }
  return supabase
}
