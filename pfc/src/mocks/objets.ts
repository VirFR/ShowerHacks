import type { Objet } from '@/types'

/**
 * Les trois objets de base. Chaque joueur commence avec exactement ceux-là.
 * Les objets issus des boosters et de l'assemblage viendront s'ajouter plus tard.
 */
export const OBJETS_MOCK: Objet[] = [
  {
    id: 'pierre',
    nom: 'Pierre',
    attaque: 5,
    defense: 5,
    categorie: 'pierre',
    imageUrl: '/objets/pierre.svg',
    icone: '🪨',
    rarete: 'commun',
    description: 'Écrase les ciseaux. Se fait envelopper par la feuille.',
  },
  {
    id: 'feuille',
    nom: 'Feuille',
    attaque: 5,
    defense: 5,
    categorie: 'feuille',
    imageUrl: '/objets/feuille.svg',
    icone: '🍃',
    rarete: 'commun',
    description: 'Enveloppe la pierre. Se fait découper par les ciseaux.',
  },
  {
    id: 'ciseaux',
    nom: 'Ciseaux',
    attaque: 5,
    defense: 5,
    categorie: 'ciseaux',
    imageUrl: '/objets/ciseaux.svg',
    icone: '✂️',
    rarete: 'commun',
    description: 'Découpent la feuille. Se font écraser par la pierre.',
  },
]

/** Inventaire de départ : une copie des trois objets de base. */
export const INVENTAIRE_DEPART: Objet[] = [...OBJETS_MOCK]

export function trouverObjet(id: string | undefined): Objet | undefined {
  return OBJETS_MOCK.find((o) => o.id === id)
}
