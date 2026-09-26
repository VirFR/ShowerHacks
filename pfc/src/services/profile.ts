import { DEFAULT_CHART, type Chart } from '@/lib/engine'
import { rangPourScore } from '@/lib/format'
import { getSupabase } from '@/lib/supabase'
import type { Adversaire, Joueur, Objet, Rarete } from '@/types'

/**
 * Reads of the player-facing tables (supabase mode only). The shapes here
 * match `supabase/migrations/0001_combat.sql`.
 */

export interface ProfileRow {
  id: string
  username: string
  avatar_url: string | null
  score: number
  games: number
  wins: number
  onboarded_at: string | null
}

export interface ItemRow {
  id: string
  name: string
  category: string
  attack: number
  defense: number
  image_url: string | null
  rarity: string
  description: string | null
  explicit_wins: string[] | null
}

interface InventoryRow {
  id: string
  item: ItemRow | null
}

const RARETE: Record<string, Rarete> = {
  common: 'commun',
  uncommon: 'peu_commun',
  rare: 'rare',
  epic: 'epique',
  legendary: 'legendaire',
  secret_rare: 'secret_rare',
}

/** Rarity slug as stored in the `items` table. */
export const RARETE_DB: Record<Rarete, string> = {
  commun: 'common',
  peu_commun: 'uncommon',
  rare: 'rare',
  epique: 'epic',
  legendaire: 'legendary',
  secret_rare: 'secret_rare',
}

export function versObjet(inventaireId: string, item: ItemRow): Objet {
  return {
    id: item.id,
    inventaireId,
    nom: item.name,
    categorie: item.category,
    attaque: item.attack,
    defense: item.defense,
    imageUrl: item.image_url ?? '',
    icone: '',
    rarete: RARETE[item.rarity] ?? 'commun',
    description: item.description ?? undefined,
    victoiresExplicites: item.explicit_wins ?? undefined,
  }
}

export function versJoueur(p: ProfileRow, inventaire: Objet[]): Joueur {
  return {
    id: p.id,
    pseudo: p.username,
    avatarUrl: p.avatar_url ?? undefined,
    score: p.score,
    rang: rangPourScore(p.score),
    nbParties: p.games,
    nbVictoires: p.wins,
    inventaire,
    onboardedAt: p.onboarded_at,
  }
}

export function versAdversaire(p: Pick<ProfileRow, 'id' | 'username' | 'avatar_url' | 'score'>, enLigne = false): Adversaire {
  return {
    id: p.id,
    pseudo: p.username,
    avatarUrl: p.avatar_url ?? undefined,
    score: p.score,
    rang: rangPourScore(p.score),
    enLigne,
  }
}

/** Profile + inventory of a user. Returns null while the profile row does not exist yet. */
export async function chargerJoueur(userId: string): Promise<Joueur | null> {
  const sb = getSupabase()
  const { data: profil, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  if (!profil) return null
  const { data: inv, error: errInv } = await sb
    .from('inventory')
    .select('id, item:items(*)')
    .eq('owner', userId)
    .order('acquired_at', { ascending: true })
  if (errInv) throw errInv
  const inventaire = ((inv ?? []) as unknown as InventoryRow[])
    .filter((r) => r.item)
    .map((r) => versObjet(r.id, r.item as ItemRow))
  return versJoueur(profil as ProfileRow, inventaire)
}

/** Category chart from the DB; falls back to the default chart when empty. */
export async function chargerChart(): Promise<Chart> {
  const sb = getSupabase()
  const [{ data: cats }, { data: pairs }] = await Promise.all([
    sb.from('categories').select('slug, label, verb'),
    sb.from('category_matchups').select('winner, loser'),
  ])
  if (!cats || cats.length === 0) return DEFAULT_CHART
  const chart: Chart = { beats: {}, verbs: {}, labels: {} }
  for (const c of cats as { slug: string; label: string; verb: string | null }[]) {
    chart.beats[c.slug] = []
    chart.labels![c.slug] = c.label
    if (c.verb) chart.verbs![c.slug] = c.verb
  }
  for (const p of (pairs ?? []) as { winner: string; loser: string }[]) {
    ;(chart.beats[p.winner] ??= []).push(p.loser)
  }
  return chart
}

export async function terminerOnboardingDistant(): Promise<void> {
  const { error } = await getSupabase().rpc('complete_onboarding')
  if (error) throw error
}

/** Every other player, for the opponent picker. */
export async function listerJoueurs(saufId: string): Promise<Adversaire[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, username, avatar_url, score')
    .neq('id', saufId)
    .order('score', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map((p) => versAdversaire(p as ProfileRow))
}

/**
 * Adds copies of catalog items to a player's inventory (boosters page).
 * The boosters team should move this server-side; until then the
 * `inventory` insert policy lets a signed-in player add to their own rows.
 */
export async function ajouterObjetsDistant(userId: string, objets: Objet[]): Promise<void> {
  const { error } = await getSupabase()
    .from('inventory')
    .insert(objets.map((o) => ({ owner: userId, item_id: o.id })))
  if (error) throw error
}
