import type { EntreeClassement, HistoriqueCombat, Joueur, StackBoosters } from '@/types'
import { BOOSTER_INTERVALLE_MS, BOOSTERS_MAX } from '@/types'
import { inventaireDepart } from './objets'

/**
 * The four test accounts. Everyone starts from the same point:
 * score 0, Bronze rank, one copy of every offline item.
 * Sign-in happens from /profile (see `lib/session.ts`).
 */
const compte = (id: string, pseudo: string): Joueur => ({
  id,
  pseudo,
  score: 0,
  rang: 'Bronze',
  nbParties: 0,
  nbVictoires: 0,
  inventaire: inventaireDepart(id),
  onboardedAt: null,
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

/** Leaderboard derived from the mock players, sorted by descending score then nickname. */
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

/** No battle played yet: the history will fill up with the real logic. */
export const HISTORIQUE_MOCK: HistoriqueCombat[] = []

/** Starting booster stack (the next one lands in ~4 min). */
export const BOOSTERS_MOCK: StackBoosters = {
  actuel: 3,
  max: BOOSTERS_MAX,
  prochainA: new Date(Date.now() + BOOSTER_INTERVALLE_MS * 0.4).toISOString(),
}
