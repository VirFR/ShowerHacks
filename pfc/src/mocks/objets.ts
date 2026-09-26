import type { Objet } from '@/types'
import { OBJETS_BOOSTER_MOCK } from './objetsBooster'

/**
 * The three starting items. Every player starts with exactly these; the
 * other 62 items live in `objetsBooster.ts` and are earned from boosters.
 * Images point to /public/objets/*.svg; the `icone` emoji is used as a
 * fallback when the image fails to load.
 */
export const OBJETS_MOCK: Objet[] = [
  {
    id: 'obj-01',
    nom: 'Mossy Rock',
    attaque: 4,
    defense: 7,
    categorie: 'ressources',
    imageUrl: '/objets/obj-01.svg',
    icone: '🪨',
    rarete: 'commun',
  },
  {
    id: 'obj-04',
    nom: 'Oak Leaf',
    attaque: 3,
    defense: 5,
    categorie: 'plantes',
    imageUrl: '/objets/obj-04.svg',
    icone: '🍃',
    rarete: 'commun',
  },
  {
    id: 'obj-07',
    nom: 'Rusty Scissors',
    attaque: 5,
    defense: 3,
    categorie: 'fight',
    imageUrl: '/objets/obj-07.svg',
    icone: '✂️',
    rarete: 'commun',
  },
]

/** Starting inventory: a copy of the three base items. */
export const INVENTAIRE_DEPART: Objet[] = [...OBJETS_MOCK]

/** Looks an item up across both the starter pool and the booster pool. */
export function trouverObjet(id: string | undefined): Objet | undefined {
  return OBJETS_MOCK.find((o) => o.id === id) ?? OBJETS_BOOSTER_MOCK.find((o) => o.id === id)
}
