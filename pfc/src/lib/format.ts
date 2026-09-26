import type { Categorie, Rang, Rarete, ResultatCombat } from '@/types'
import { DEFAULT_CHART, categoryLabel } from '@/lib/engine'

/** Labels, colors and display helpers shared by the pages. */

/** Label of a category slug (falls back to a capitalised slug). */
export function libelleCategorie(c: Categorie): string {
  return categoryLabel(DEFAULT_CHART, c)
}

/** @deprecated prefer `libelleCategorie(slug)`: categories are data now. */
export const LIBELLE_CATEGORIE: Record<Categorie, string> = new Proxy(
  {},
  { get: (_t, key: string) => libelleCategorie(key) },
) as Record<Categorie, string>

/** Hex colour per category; unknown categories get the accent colour. */
const COULEUR_PAR_CATEGORIE: Record<string, string> = {
  fight: '#fb7185',
  plantes: '#34d399',
  ressources: '#f59e0b',
  espace: '#818cf8',
  brainrot: '#a3e635',
}

export function couleurCategorie(c: Categorie): string {
  return COULEUR_PAR_CATEGORIE[c] ?? '#c084fc'
}

const CLASSE_PAR_CATEGORIE: Record<string, string> = {
  fight: 'bg-rose-500/20 text-rose-200 ring-rose-400/40',
  plantes: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40',
  ressources: 'bg-amber-600/20 text-amber-200 ring-amber-500/40',
  espace: 'bg-indigo-500/20 text-indigo-200 ring-indigo-400/40',
  brainrot: 'bg-lime-500/20 text-lime-200 ring-lime-400/40',
}

export function classeCategorie(c: Categorie): string {
  return CLASSE_PAR_CATEGORIE[c] ?? 'bg-accent/20 text-accent-2 ring-accent/40'
}

/** @deprecated prefer `classeCategorie(slug)`. */
export const CLASSE_CATEGORIE: Record<Categorie, string> = new Proxy(
  {},
  { get: (_t, key: string) => classeCategorie(key) },
) as Record<Categorie, string>

export const LIBELLE_RARETE: Record<Rarete, string> = {
  commun: 'Common',
  peu_commun: 'Uncommon',
  rare: 'Rare',
  epique: 'Epic',
  legendaire: 'Legendary',
  secret_rare: 'Secret Rare',
}

/** Sort order of rarities, lowest first. */
export const ORDRE_RARETE: Record<Rarete, number> = {
  commun: 0,
  peu_commun: 1,
  rare: 2,
  epique: 3,
  legendaire: 4,
  secret_rare: 5,
}

export const CLASSE_RARETE: Record<Rarete, string> = {
  commun: 'text-texte-2',
  peu_commun: 'text-emerald-300',
  rare: 'text-sky-300',
  epique: 'text-fuchsia-300',
  legendaire: 'text-or',
  secret_rare: 'bg-gradient-to-r from-rose-300 via-amber-200 to-sky-300 bg-clip-text text-transparent font-semibold',
}

/**
 * Card frame by rarity: a thick border + a background tinted almost
 * entirely in the rarity's color, and — from `rare` upward — a colored
 * glow (halo) around the card that gets more intense with rarity.
 */
export const CLASSE_CARTE_RARETE: Record<Rarete, string> = {
  commun: 'border-slate-400/70 bg-gradient-to-b from-slate-600/50 via-carte to-carte',
  peu_commun: 'border-emerald-400/80 bg-gradient-to-b from-emerald-800/60 via-carte to-carte',
  rare: 'border-sky-400/90 bg-gradient-to-b from-sky-800/60 via-carte to-carte shadow-[0_0_18px_-2px] shadow-sky-400/50',
  epique:
    'border-fuchsia-400/90 bg-gradient-to-b from-fuchsia-800/60 via-carte to-carte shadow-[0_0_22px_-2px] shadow-fuchsia-400/60',
  legendaire:
    'border-amber-300 bg-gradient-to-b from-amber-800/60 via-carte to-carte shadow-[0_0_26px_-2px] shadow-amber-300/70',
  secret_rare: 'border-white bg-gradient-to-b from-slate-700/60 via-carte to-carte shadow-[0_0_30px_-2px] shadow-white/70',
}

/**
 * Booster-reveal effects, escalating from `rare` upward (nothing for
 * `commun`/`peu_commun`): an ambient glow pulse behind the card and a
 * colored light sweeping across it. See `pages/Boosters.tsx` and the
 * `.animate-glow-*` / `.animate-shimmer` rules in `index.css`.
 */
export const CLASSE_LUEUR_RARETE: Partial<Record<Rarete, string>> = {
  rare: 'animate-glow-rare',
  epique: 'animate-glow-epic',
  legendaire: 'animate-glow-legendary',
  secret_rare: 'animate-glow-secret',
}

export const CLASSE_SHIMMER_RARETE: Partial<Record<Rarete, string>> = {
  rare: 'bg-sky-300/25',
  epique: 'bg-white/30',
  legendaire: 'bg-amber-300/50',
  secret_rare: 'shimmer-holo',
}

/** Rank thresholds (score needed to reach each rank). */
export const SEUILS_RANG: [Rang, number][] = [
  ['Master', 4000],
  ['Diamond', 2000],
  ['Platinum', 1000],
  ['Gold', 500],
  ['Silver', 200],
  ['Bronze', 0],
]

export function rangPourScore(score: number): Rang {
  return SEUILS_RANG.find(([, seuil]) => score >= seuil)?.[0] ?? 'Bronze'
}

export const CLASSE_RANG: Record<Rang, string> = {
  Bronze: 'from-amber-700 to-amber-900',
  Silver: 'from-slate-300 to-slate-500',
  Gold: 'from-yellow-300 to-amber-500',
  Platinum: 'from-cyan-200 to-sky-400',
  Diamond: 'from-indigo-300 to-violet-500',
  Master: 'from-fuchsia-400 to-rose-500',
}

export const LIBELLE_RESULTAT: Record<ResultatCombat, string> = {
  victoire: 'Victory',
  defaite: 'Defeat',
  egalite: 'Draw',
}

export const CLASSE_RESULTAT: Record<ResultatCombat, string> = {
  victoire: 'text-succes',
  defaite: 'text-echec',
  egalite: 'text-or',
}

export function formaterPourcentage(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export function formaterNombre(n: number): string {
  return n.toLocaleString('en-US')
}

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** mm:ss from a duration in milliseconds (never negative). */
export function formaterDuree(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const secondes = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`
}
