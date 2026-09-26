/**
 * Types de base du jeu PFC.
 *
 * Ces interfaces sont volontairement minimales : elles servent de contrat
 * commun entre les pages et seront enrichies au fur et à mesure
 * (crafting, combat réel, auth…).
 */

/** Catégories d'objets : les trois familles classiques + une famille spéciale. */
export type Categorie = 'pierre' | 'feuille' | 'ciseaux' | 'special'

export const CATEGORIES: Categorie[] = ['pierre', 'feuille', 'ciseaux', 'special']

export type Rarete = 'commun' | 'rare' | 'epique' | 'legendaire'

export interface Objet {
  id: string
  nom: string
  attaque: number
  defense: number
  categorie: Categorie
  imageUrl: string
  /** Emoji utilisé en secours si l'image ne charge pas. */
  icone: string
  rarete: Rarete
  description: string
}

export type Rang =
  | 'Bronze'
  | 'Argent'
  | 'Or'
  | 'Platine'
  | 'Diamant'
  | 'Maître'

export interface Joueur {
  id: string
  pseudo: string
  score: number
  /** Objets possédés par le joueur. */
  inventaire: Objet[]
  rang: Rang
  avatarUrl?: string
  nbParties: number
  nbVictoires: number
}

/** Une entrée du classement (données agrégées d'un joueur). */
export interface EntreeClassement {
  position: number
  joueurId: string
  pseudo: string
  score: number
  nbParties: number
  nbVictoires: number
  /** Ratio victoires / parties, entre 0 et 1. */
  ratio: number
}

export type ResultatCombat = 'victoire' | 'defaite' | 'egalite'

/** Historique d'un duel, tel qu'affiché sur la fiche d'un objet. */
export interface HistoriqueCombat {
  id: string
  date: string
  objetId: string
  objetAdverseId: string
  adversairePseudo: string
  resultat: ResultatCombat
}

/** Stack de boosters d'un joueur. */
export interface StackBoosters {
  /** Nombre de boosters actuellement disponibles. */
  actuel: number
  /** Taille maximale du stack. */
  max: number
  /** Date ISO à laquelle le prochain booster sera ajouté. */
  prochainA: string
}

/** Résultat mock d'une tentative d'assemblage de deux objets. */
export interface ResultatAssemblage {
  succes: boolean
  message: string
  objetResultat?: Objet
}

/** Constantes de gameplay partagées. */
export const BOOSTERS_MAX = 8
export const BOOSTER_INTERVALLE_MS = 10 * 60 * 1000 // 10 minutes
export const OBJETS_PAR_BOOSTER = 5
