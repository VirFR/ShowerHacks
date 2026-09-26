import { getSupabase } from '@/lib/supabase'

/**
 * Supabase Auth helpers. Google is the only provider for now; the
 * redirect comes back to the current origin and `SessionProvider` picks
 * the session up through `onAuthStateChange`.
 */

export async function signInWithGoogle(): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/battle`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}
