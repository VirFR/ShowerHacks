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
  rock: '#a8a29e',
  paper: '#34d399',
  scissors: '#fb7185',
  fire: '#fb923c',
  water: '#38bdf8',
}

export function couleurCategorie(c: Categorie): string {
  return COULEUR_PAR_CATEGORIE[c] ?? '#c084fc'
}

const CLASSE_PAR_CATEGORIE: Record<string, string> = {
  rock: 'bg-stone-500/20 text-stone-200 ring-stone-400/40',
  paper: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40',
  scissors: 'bg-rose-500/20 text-rose-200 ring-rose-400/40',
  fire: 'bg-orange-500/20 text-orange-200 ring-orange-400/40',
  water: 'bg-sky-500/20 text-sky-200 ring-sky-400/40',
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
  rare: 'Rare',
  epique: 'Epic',
  legendaire: 'Legendary',
}

/** Sort order of rarities, lowest first. */
export const ORDRE_RARETE: Record<Rarete, number> = {
  commun: 0,
  rare: 1,
  epique: 2,
  legendaire: 3,
}

export const CLASSE_RARETE: Record<Rarete, string> = {
  commun: 'text-texte-2',
  rare: 'text-sky-300',
  epique: 'text-fuchsia-300',
  legendaire: 'text-or',
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
