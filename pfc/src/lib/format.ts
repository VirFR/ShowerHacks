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
  animaux: '#fb923c',
  vehicules: '#22d3ee',
}

export function couleurCategorie(c: Categorie): string {
  return COULEUR_PAR_CATEGORIE[c] ?? '#c084fc'
}

const CLASSE_PAR_CATEGORIE: Record<string, string> = {
  fight: 'bg-rose-100 text-rose-800 ring-rose-700/60',
  plantes: 'bg-emerald-100 text-emerald-800 ring-emerald-700/60',
  ressources: 'bg-amber-100 text-amber-800 ring-amber-700/60',
  espace: 'bg-indigo-100 text-indigo-800 ring-indigo-700/60',
  animaux: 'bg-orange-100 text-orange-800 ring-orange-700/60',
  vehicules: 'bg-cyan-100 text-cyan-800 ring-cyan-700/60',
}

export function classeCategorie(c: Categorie): string {
  return CLASSE_PAR_CATEGORIE[c] ?? 'bg-violet-100 text-violet-800 ring-violet-700/60'
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
  peu_commun: 'text-emerald-700',
  rare: 'text-sky-700',
  epique: 'text-fuchsia-700',
  legendaire: 'text-or',
  secret_rare: 'bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500 bg-clip-text text-transparent font-bold',
}

/**
 * Card frame by rarity: a colored outline on a light card face, with a
 * header tint in the rarity's color. Higher rarities get a stronger frame
 * color; secret rare gets a pastel rainbow face.
 */
export const CLASSE_CARTE_RARETE: Record<Rarete, string> = {
  commun: 'border-slate-500 bg-gradient-to-b from-slate-200 via-carte to-carte',
  peu_commun: 'border-emerald-600 bg-gradient-to-b from-emerald-200 via-carte to-carte',
  rare: 'border-sky-600 bg-gradient-to-b from-sky-200 via-carte to-carte',
  epique: 'border-fuchsia-600 bg-gradient-to-b from-fuchsia-200 via-carte to-carte',
  legendaire: 'border-amber-500 bg-gradient-to-b from-amber-200 via-carte to-carte',
  secret_rare: 'border-ink bg-gradient-to-b from-rose-200 via-amber-100 to-sky-200',
}

/** One-letter rarity tag shown on the card art. */
export const LETTRE_RARETE: Record<Rarete, string> = {
  commun: 'C',
  peu_commun: 'U',
  rare: 'R',
  epique: 'E',
  legendaire: 'L',
  secret_rare: 'SR',
}

/** Rarity tint of a card's info panel, and the colors of its letter badge. */
export const TEINTE_RARETE: Record<Rarete, { fond: string; badgeFond: string; badgeTexte: string }> = {
  commun: { fond: '#cbd5e1', badgeFond: '#e2e8f0', badgeTexte: '#334155' },
  peu_commun: { fond: '#86efac', badgeFond: '#bbf7d0', badgeTexte: '#14532d' },
  rare: { fond: '#7dd3fc', badgeFond: '#bae6fd', badgeTexte: '#0c4a6e' },
  epique: { fond: '#f0abfc', badgeFond: '#f5d0fe', badgeTexte: '#701a75' },
  legendaire: { fond: '#fde047', badgeFond: '#fef08a', badgeTexte: '#713f12' },
  secret_rare: { fond: '#f9a8d4', badgeFond: '#fbcfe8', badgeTexte: '#831843' },
}

/** Inline background of a card's rarity panel (tint with a soft sheen). */
export function stylePanneauRarete(r: Rarete): { background: string } {
  const { fond } = TEINTE_RARETE[r]
  return { background: `linear-gradient(160deg, ${fond} 0%, ${fond}cc 55%, ${fond} 100%)` }
}

/** Dark-to-bright gradient pair behind an item's picture, per category. */
const DEGRADE_PAR_CATEGORIE: Record<string, [string, string]> = {
  fight: ['#7f1d1d', '#ef4444'],
  animaux: ['#7c2d12', '#fb923c'],
  plantes: ['#14532d', '#22c55e'],
  vehicules: ['#164e63', '#22d3ee'],
  ressources: ['#78350f', '#f59e0b'],
  espace: ['#312e81', '#818cf8'],
  brainrot: ['#4c1d95', '#a78bfa'],
}

/** Inline background of the picture area of a card, per category. */
export function styleArtCategorie(c: Categorie): { background: string } {
  const [sombre, clair] = DEGRADE_PAR_CATEGORIE[c] ?? ['#3b0764', '#c084fc']
  return { background: `radial-gradient(circle at 50% 40%, ${clair} 0%, ${sombre} 78%)` }
}

/** Dark-to-bright gradient pair behind an item's picture, per rarity (same palette as TEINTE_RARETE). */
const DEGRADE_PAR_RARETE: Record<Rarete, [string, string]> = {
  commun: ['#334155', '#cbd5e1'],
  peu_commun: ['#14532d', '#86efac'],
  rare: ['#0c4a6e', '#7dd3fc'],
  epique: ['#701a75', '#f0abfc'],
  legendaire: ['#713f12', '#fde047'],
  secret_rare: ['#831843', '#f9a8d4'],
}

/** Inline background of the picture area of a card, per rarity. */
export function styleArtRarete(r: Rarete): { background: string } {
  const [sombre, clair] = DEGRADE_PAR_RARETE[r] ?? DEGRADE_PAR_RARETE.commun
  return { background: `radial-gradient(circle at 50% 40%, ${clair} 0%, ${sombre} 78%)` }
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
