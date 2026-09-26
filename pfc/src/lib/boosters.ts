import type { Objet, Rarete } from '@/types'

/**
 * Poids relatifs de tirage par rareté (plus c'est rare, moins c'est probable).
 * La somme n'a pas besoin de faire 100 : seul le ratio entre poids compte.
 */
export const RARETE_PONDERATION: Record<Rarete, number> = {
  commun: 45,
  peu_commun: 28,
  rare: 15,
  epique: 8,
  legendaire: 3,
  secret_rare: 1,
}

/** Tire une rareté au hasard, pondérée par RARETE_PONDERATION. */
export function tirerRarete(): Rarete {
  const total = Object.values(RARETE_PONDERATION).reduce((somme, poids) => somme + poids, 0)
  let tirage = Math.random() * total
  for (const [rarete, poids] of Object.entries(RARETE_PONDERATION) as [Rarete, number][]) {
    if (tirage < poids) return rarete
    tirage -= poids
  }
  return 'commun'
}

/** Tire un objet pondéré par rareté dans un pool. Repli sur tout le pool si la rareté tirée est absente. */
export function tirerObjetPondere(objets: Objet[]): Objet {
  const rarete = tirerRarete()
  const pool = objets.filter((objet) => objet.rarete === rarete)
  const source = pool.length > 0 ? pool : objets
  return source[Math.floor(Math.random() * source.length)]
}
