import type { Objet } from '@/types'
import { OBJETS_BOOSTER_MOCK } from './objetsBooster'
import { OBJETS_BRAINROT_MIS_DE_COTE } from './objetsBrainrot'
import { OBJETS_MOUCHE } from './objetsMouche'

/**
 * The three starting items. Every player starts with exactly these; the
 * other 54 items live in `objetsBooster.ts` and are earned from boosters.
 * Images point to /public/objets/*.svg; the `icone` emoji is used as a
 * fallback when the image fails to load (card art belongs to the items team).
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
    description: 'A good old stone. Solid, if not exactly fast.',
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
    description: 'Light and unassuming. Wraps around things without trying.',
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
    description: 'Still cuts. Mostly.',
  },
]

/** Every catalog item in play (starters + booster pool; brainrot set aside). */
export const CATALOGUE_MOCK: Objet[] = [...OBJETS_MOCK, ...OBJETS_BOOSTER_MOCK]

/** Starting inventory: a copy of the three base items. */
export const INVENTAIRE_DEPART: Objet[] = [...OBJETS_MOCK]

/**
 * Looks an item up across the catalog, including the set-aside brainrot
 * cards and the La Mouche boss deck, so a copy that appeared in a battle
 * still resolves.
 */
export function trouverObjet(id: string | undefined): Objet | undefined {
  return (
    CATALOGUE_MOCK.find((o) => o.id === id) ??
    OBJETS_BRAINROT_MIS_DE_COTE.find((o) => o.id === id) ??
    OBJETS_MOUCHE.find((o) => o.id === id)
  )
}

/**
 * Starting inventory of a player, each copy carrying a unique `inventaireId`
 * (decks and battles refer to copies, not to catalog ids).
 */
export function inventaireDepart(joueurId: string): Objet[] {
  return OBJETS_MOCK.map((o, i) => ({ ...o, inventaireId: `${joueurId}-start-${i}-${o.id}` }))
}
