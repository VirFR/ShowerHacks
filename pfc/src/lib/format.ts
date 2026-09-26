import type { Categorie, Rang, Rarete, ResultatCombat } from '@/types'

/** Libellés, couleurs et helpers d'affichage partagés par les pages. */

export const LIBELLE_CATEGORIE: Record<Categorie, string> = {
  pierre: 'Pierre',
  feuille: 'Feuille',
  ciseaux: 'Ciseaux',
  special: 'Spécial',
}

export const ICONE_CATEGORIE: Record<Categorie, string> = {
  pierre: '✊',
  feuille: '✋',
  ciseaux: '✌️',
  special: '✨',
}

export const CLASSE_CATEGORIE: Record<Categorie, string> = {
  pierre: 'bg-stone-500/20 text-stone-200 ring-stone-400/40',
  feuille: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40',
  ciseaux: 'bg-rose-500/20 text-rose-200 ring-rose-400/40',
  special: 'bg-violet-500/20 text-violet-200 ring-violet-400/40',
}

export const LIBELLE_RARETE: Record<Rarete, string> = {
  commun: 'Commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire',
}

export const CLASSE_RARETE: Record<Rarete, string> = {
  commun: 'text-emerald-300',
  rare: 'text-sky-300',
  epique: 'text-fuchsia-300',
  legendaire: 'text-or',
}

/** Bordure/halo de la carte selon sa rareté : vert, bleu, violet, or. */
export const CLASSE_CARTE_RARETE: Record<Rarete, string> = {
  commun: 'border-emerald-500/40 hover:border-emerald-400/70',
  rare: 'border-sky-500/40 hover:border-sky-400/70',
  epique: 'border-fuchsia-500/40 hover:border-fuchsia-400/70',
  legendaire: 'border-amber-400/50 hover:border-amber-300/80 shadow-[0_0_16px_-4px] shadow-amber-400/40',
}

export const CLASSE_RANG: Record<Rang, string> = {
  Bronze: 'from-amber-700 to-amber-900',
  Argent: 'from-slate-300 to-slate-500',
  Or: 'from-yellow-300 to-amber-500',
  Platine: 'from-cyan-200 to-sky-400',
  Diamant: 'from-indigo-300 to-violet-500',
  Maître: 'from-fuchsia-400 to-rose-500',
}

export const LIBELLE_RESULTAT: Record<ResultatCombat, string> = {
  victoire: 'Victoire',
  defaite: 'Défaite',
  egalite: 'Égalité',
}

export const CLASSE_RESULTAT: Record<ResultatCombat, string> = {
  victoire: 'text-succes',
  defaite: 'text-echec',
  egalite: 'text-or',
}

export function formaterPourcentage(ratio: number): string {
  return `${Math.round(ratio * 100)} %`
}

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** mm:ss à partir d'une durée en millisecondes (jamais négatif). */
export function formaterDuree(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const secondes = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(secondes).padStart(2, '0')}`
}
