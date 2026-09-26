import type {
  EntreeClassement,
  HistoriqueCombat,
  Joueur,
  StackBoosters,
} from '@/types'
import { BOOSTER_INTERVALLE_MS, BOOSTERS_MAX } from '@/types'
import { OBJETS_MOCK } from './objets'

const objet = (id: string) => OBJETS_MOCK.find((o) => o.id === id)!

/** Le joueur connecté (mock, en attendant l'auth). */
export const JOUEUR_COURANT: Joueur = {
  id: 'joueur-01',
  pseudo: 'CaillouMaster',
  score: 1840,
  rang: 'Or',
  nbParties: 132,
  nbVictoires: 81,
  inventaire: [
    objet('obj-01'),
    objet('obj-02'),
    objet('obj-03'),
    objet('obj-04'),
    objet('obj-06'),
    objet('obj-08'),
    objet('obj-09'),
    objet('obj-11'),
  ],
}

export const JOUEURS_MOCK: Joueur[] = [
  JOUEUR_COURANT,
  {
    id: 'joueur-02',
    pseudo: 'FeuilleMorte',
    score: 2310,
    rang: 'Platine',
    nbParties: 201,
    nbVictoires: 140,
    inventaire: [objet('obj-04'), objet('obj-05'), objet('obj-06'), objet('obj-10')],
  },
  {
    id: 'joueur-03',
    pseudo: 'Snip_Snap',
    score: 2950,
    rang: 'Diamant',
    nbParties: 310,
    nbVictoires: 231,
    inventaire: [objet('obj-07'), objet('obj-08'), objet('obj-09'), objet('obj-12')],
  },
  {
    id: 'joueur-04',
    pseudo: 'Menhir42',
    score: 1210,
    rang: 'Argent',
    nbParties: 88,
    nbVictoires: 40,
    inventaire: [objet('obj-01'), objet('obj-02')],
  },
  {
    id: 'joueur-05',
    pseudo: 'ZapZap',
    score: 3420,
    rang: 'Maître',
    nbParties: 402,
    nbVictoires: 318,
    inventaire: [objet('obj-10'), objet('obj-11'), objet('obj-12'), objet('obj-03')],
  },
  {
    id: 'joueur-06',
    pseudo: 'PapierCadeau',
    score: 640,
    rang: 'Bronze',
    nbParties: 35,
    nbVictoires: 12,
    inventaire: [objet('obj-04'), objet('obj-07')],
  },
  {
    id: 'joueur-07',
    pseudo: 'Origamiste',
    score: 1990,
    rang: 'Or',
    nbParties: 150,
    nbVictoires: 96,
    inventaire: [objet('obj-05'), objet('obj-06'), objet('obj-09')],
  },
  {
    id: 'joueur-08',
    pseudo: 'CrabeRouge',
    score: 1530,
    rang: 'Argent',
    nbParties: 110,
    nbVictoires: 58,
    inventaire: [objet('obj-09'), objet('obj-01'), objet('obj-11')],
  },
]

/** Classement dérivé des joueurs mock, trié par score décroissant. */
export const CLASSEMENT_MOCK: EntreeClassement[] = [...JOUEURS_MOCK]
  .sort((a, b) => b.score - a.score)
  .map((j, index) => ({
    position: index + 1,
    joueurId: j.id,
    pseudo: j.pseudo,
    score: j.score,
    nbParties: j.nbParties,
    nbVictoires: j.nbVictoires,
    ratio: j.nbParties === 0 ? 0 : j.nbVictoires / j.nbParties,
  }))

/** Historique de combats mock, indexé sur les objets du joueur courant. */
export const HISTORIQUE_MOCK: HistoriqueCombat[] = [
  { id: 'h-01', date: '2026-09-25T18:12:00Z', objetId: 'obj-01', objetAdverseId: 'obj-07', adversairePseudo: 'Snip_Snap', resultat: 'victoire' },
  { id: 'h-02', date: '2026-09-25T18:20:00Z', objetId: 'obj-01', objetAdverseId: 'obj-04', adversairePseudo: 'FeuilleMorte', resultat: 'defaite' },
  { id: 'h-03', date: '2026-09-24T21:05:00Z', objetId: 'obj-02', objetAdverseId: 'obj-08', adversairePseudo: 'Snip_Snap', resultat: 'victoire' },
  { id: 'h-04', date: '2026-09-24T21:10:00Z', objetId: 'obj-02', objetAdverseId: 'obj-05', adversairePseudo: 'Origamiste', resultat: 'defaite' },
  { id: 'h-05', date: '2026-09-23T12:30:00Z', objetId: 'obj-03', objetAdverseId: 'obj-09', adversairePseudo: 'CrabeRouge', resultat: 'victoire' },
  { id: 'h-06', date: '2026-09-23T12:35:00Z', objetId: 'obj-03', objetAdverseId: 'obj-03', adversairePseudo: 'ZapZap', resultat: 'egalite' },
  { id: 'h-07', date: '2026-09-22T09:00:00Z', objetId: 'obj-04', objetAdverseId: 'obj-01', adversairePseudo: 'Menhir42', resultat: 'victoire' },
  { id: 'h-08', date: '2026-09-22T09:04:00Z', objetId: 'obj-04', objetAdverseId: 'obj-08', adversairePseudo: 'Snip_Snap', resultat: 'defaite' },
  { id: 'h-09', date: '2026-09-21T16:40:00Z', objetId: 'obj-06', objetAdverseId: 'obj-07', adversairePseudo: 'PapierCadeau', resultat: 'victoire' },
  { id: 'h-10', date: '2026-09-21T16:45:00Z', objetId: 'obj-08', objetAdverseId: 'obj-06', adversairePseudo: 'FeuilleMorte', resultat: 'victoire' },
  { id: 'h-11', date: '2026-09-20T20:15:00Z', objetId: 'obj-08', objetAdverseId: 'obj-02', adversairePseudo: 'Menhir42', resultat: 'defaite' },
  { id: 'h-12', date: '2026-09-20T20:22:00Z', objetId: 'obj-09', objetAdverseId: 'obj-05', adversairePseudo: 'Origamiste', resultat: 'victoire' },
  { id: 'h-13', date: '2026-09-19T11:00:00Z', objetId: 'obj-11', objetAdverseId: 'obj-10', adversairePseudo: 'ZapZap', resultat: 'defaite' },
  { id: 'h-14', date: '2026-09-19T11:08:00Z', objetId: 'obj-11', objetAdverseId: 'obj-12', adversairePseudo: 'ZapZap', resultat: 'victoire' },
]

/** Stack de boosters du joueur courant (le prochain arrive dans ~4 min). */
export const BOOSTERS_MOCK: StackBoosters = {
  actuel: 3,
  max: BOOSTERS_MAX,
  prochainA: new Date(Date.now() + BOOSTER_INTERVALLE_MS * 0.4).toISOString(),
}
