import type { Objet } from '@/types'

/**
 * Offline catalog. The three base items plus a few placeholders so that
 * decks of five and neutral matchups can be played without a database.
 * The real catalog (names, categories, stats, art) belongs to the items
 * team and lives in the `items` table.
 */
export const OBJETS_MOCK: Objet[] = [
  {
    id: 'pierre',
    nom: 'Rock',
    categorie: 'rock',
    attaque: 5,
    defense: 6,
    imageUrl: '/objets/pierre.svg',
    icone: '🪨',
    rarete: 'commun',
    description: 'Crushes scissors. Gets wrapped by paper.',
  },
  {
    id: 'feuille',
    nom: 'Paper',
    categorie: 'paper',
    attaque: 5,
    defense: 5,
    imageUrl: '/objets/feuille.svg',
    icone: '🍃',
    rarete: 'commun',
    description: 'Wraps rock. Gets cut by scissors.',
  },
  {
    id: 'ciseaux',
    nom: 'Scissors',
    categorie: 'scissors',
    attaque: 6,
    defense: 4,
    imageUrl: '/objets/ciseaux.svg',
    icone: '✂️',
    rarete: 'commun',
    description: 'Cut paper. Get crushed by rock.',
  },
  {
    id: 'toaster',
    nom: 'Toaster',
    categorie: 'fire',
    attaque: 7,
    defense: 3,
    imageUrl: '/objets/toaster.svg',
    icone: '🔥',
    rarete: 'rare',
    description: 'Runs hot. Burns paper and scissors, hates water.',
  },
  {
    id: 'garden-hose',
    nom: 'Garden Hose',
    categorie: 'water',
    attaque: 5,
    defense: 6,
    imageUrl: '/objets/garden-hose.svg',
    icone: '💧',
    rarete: 'rare',
    description: 'Drowns fire and rock. Paper soaks it up.',
  },
  {
    id: 'brick',
    nom: 'Brick',
    categorie: 'rock',
    attaque: 4,
    defense: 8,
    imageUrl: '/objets/brick.svg',
    icone: '🧱',
    rarete: 'commun',
    description: 'Hard to get through. Not fast, not clever.',
  },
  {
    id: 'origami-crane',
    nom: 'Origami Crane',
    categorie: 'paper',
    attaque: 6,
    defense: 4,
    imageUrl: '/objets/origami-crane.svg',
    icone: '🕊️',
    rarete: 'epique',
    description: 'Folded sharp. Wraps rock, soaks water.',
  },
]

/** Catalog lookup by item id. */
export function trouverObjet(id: string | undefined): Objet | undefined {
  return OBJETS_MOCK.find((o) => o.id === id)
}

/** Starting inventory: one copy of every offline item, with unique copy ids. */
export function inventaireDepart(joueurId: string): Objet[] {
  return OBJETS_MOCK.map((o, i) => ({ ...o, inventaireId: `${joueurId}-${i}-${o.id}` }))
}

/** @deprecated use `inventaireDepart(joueurId)` (copies need unique ids). */
export const INVENTAIRE_DEPART: Objet[] = inventaireDepart('mock')
