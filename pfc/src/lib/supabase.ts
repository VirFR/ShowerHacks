import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase partagé.
 *
 * Les identifiants viennent exclusivement des variables d'environnement
 * (voir `.env.example`). Aucune clé n'est écrite en dur dans le code.
 *
 * Tant que les variables ne sont pas renseignées, `supabase` vaut `null`
 * et l'app tourne entièrement sur les données mock de `src/mocks`.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigure = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = supabaseConfigure
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabaseConfigure && import.meta.env.DEV) {
  console.warn(
    '[PFC] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY non définies : ' +
      'l’application utilise les données mock. Copiez .env.example vers .env pour configurer Supabase.',
  )
}

/**
 * Renvoie le client ou lève une erreur explicite. À utiliser dans les
 * services qui exigent Supabase (auth, persistance) une fois implémentés.
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase n’est pas configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.',
    )
  }
  return supabase
}
