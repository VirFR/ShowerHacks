import type { Objet } from '@/types'

/**
 * The three base items. Every player starts with exactly these.
 * Items from boosters and crafting will be added later.
 * Images point to /public/objets/*.svg; the `icone` emoji is used as a
 * fallback when the image fails to load.
 */
export const OBJETS_MOCK: Objet[] = [
  {
    id: 'pierre',
    nom: 'Rock',
    categorie: 'pierre',
    imageUrl: '/objets/pierre.svg',
    icone: '🪨',
    rarete: 'commun',
    description: 'Crushes scissors. Gets wrapped by paper.',
  },
  {
    id: 'feuille',
    nom: 'Paper',
    categorie: 'feuille',
    imageUrl: '/objets/feuille.svg',
    icone: '🍃',
    rarete: 'commun',
    description: 'Wraps rock. Gets cut by scissors.',
  },
  {
    id: 'ciseaux',
    nom: 'Scissors',
    categorie: 'ciseaux',
    imageUrl: '/objets/ciseaux.svg',
    icone: '✂️',
    rarete: 'commun',
    description: 'Cut paper. Get crushed by rock.',
  },
]

/** Starting inventory: a copy of the three base items. */
export const INVENTAIRE_DEPART: Objet[] = [...OBJETS_MOCK]

export function trouverObjet(id: string | undefined): Objet | undefined {
  return OBJETS_MOCK.find((o) => o.id === id)
}
