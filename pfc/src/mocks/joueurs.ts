import type { EntreeClassement, HistoriqueCombat, Joueur, StackBoosters } from '@/types'
import { BOOSTER_INTERVALLE_MS, BOOSTERS_MAX } from '@/types'
import { INVENTAIRE_DEPART } from './objets'

/**
 * Les quatre comptes de test. Tout le monde part du même point :
 * score 0, rang Bronze, les trois objets de base.
 * La connexion se fait depuis /profil (voir `lib/session.tsx`).
 */
const compte = (id: string, pseudo: string): Joueur => ({
  id,
  pseudo,
  score: 0,
  rang: 'Bronze',
  nbParties: 0,
  nbVictoires: 0,
  inventaire: [...INVENTAIRE_DEPART],
})

export const JOUEURS_MOCK: Joueur[] = [
  compte('guilhem', 'guilhem'),
  compte('airbus', 'airbus'),
  compte('virgile', 'virgile'),
  compte('mathieu', 'mathieu'),
]

export function trouverJoueur(id: string | undefined | null): Joueur | undefined {
  return JOUEURS_MOCK.find((j) => j.id === id)
}

/** Classement dérivé des joueurs mock, trié par score décroissant puis pseudo. */
export const CLASSEMENT_MOCK: EntreeClassement[] = [...JOUEURS_MOCK]
  .sort((a, b) => b.score - a.score || a.pseudo.localeCompare(b.pseudo))
  .map((j, index) => ({
    position: index + 1,
    joueurId: j.id,
    pseudo: j.pseudo,
    score: j.score,
    nbParties: j.nbParties,
    nbVictoires: j.nbVictoires,
    ratio: j.nbParties === 0 ? 0 : j.nbVictoires / j.nbParties,
  }))

/** Aucun combat joué pour l'instant : l'historique se remplira avec la vraie logique. */
export const HISTORIQUE_MOCK: HistoriqueCombat[] = []

/** Stack de boosters de départ (le prochain arrive dans ~4 min). */
export const BOOSTERS_MOCK: StackBoosters = {
  actuel: 3,
  max: BOOSTERS_MAX,
  prochainA: new Date(Date.now() + BOOSTER_INTERVALLE_MS * 0.4).toISOString(),
}
