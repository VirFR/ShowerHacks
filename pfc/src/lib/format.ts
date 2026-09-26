import type { Categorie, Rang, Rarete, ResultatCombat } from '@/types'

/** Labels, colors and display helpers shared by the pages. */

export const LIBELLE_CATEGORIE: Record<Categorie, string> = {
  pierre: 'Rock',
  feuille: 'Paper',
  ciseaux: 'Scissors',
}

export const ICONE_CATEGORIE: Record<Categorie, string> = {
  pierre: '✊',
  feuille: '✋',
  ciseaux: '✌️',
}

export const CLASSE_CATEGORIE: Record<Categorie, string> = {
  pierre: 'bg-stone-500/20 text-stone-200 ring-stone-400/40',
  feuille: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40',
  ciseaux: 'bg-rose-500/20 text-rose-200 ring-rose-400/40',
}

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
