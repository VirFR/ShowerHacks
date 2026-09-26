import type { Recette } from '@/types'
import { RECETTES } from '@/mocks/recettes'

/** Recipes are unordered: A+B and B+A are the same combination. */
export function trouverRecette(idA: string, idB: string): Recette | undefined {
  return RECETTES.find(
    (r) =>
      (r.ingredients[0] === idA && r.ingredients[1] === idB) ||
      (r.ingredients[0] === idB && r.ingredients[1] === idA),
  )
}

/** The recipe that produces this item, if it's craftable. */
export function trouverRecetteParResultat(resultatId: string): Recette | undefined {
  return RECETTES.find((r) => r.resultatId === resultatId)
}
