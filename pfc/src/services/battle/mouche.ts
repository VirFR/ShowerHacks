import {
  computeReward,
  createBattle,
  createMoucheModel,
  moucheMove,
  publicView,
  resolveTurn,
  seededRandom,
  updateMoucheModel,
  type Chart,
  type FullState,
  type Move,
  type MoucheModel,
} from '@/lib/engine'
import { versCarte } from '@/lib/combat'
import { OBJETS_MOUCHE } from '@/mocks/objetsMouche'
import type { Adversaire, Battle, Joueur, Objet } from '@/types'

export const LA_MOUCHE: Adversaire = { id: 'mouche', pseudo: 'La Mouche', score: 0, rang: 'Master', enLigne: true }

/** Every boss battle id starts with this; `Arena` uses it to route to this service instead of `battleService`. */
export const PREFIXE_MOUCHE = 'mouche-'

const CLE_MEMOIRE = 'pfc.mouche.memoire'
const CLE_BATTLES = 'pfc.mouche.battles'

/** Learned opponent model, keyed by player id — the boss remembers each player separately. */
function chargerMemoires(): Record<string, MoucheModel> {
  try {
    const brut = window.localStorage.getItem(CLE_MEMOIRE)
    if (!brut) return {}
    const valeur = JSON.parse(brut)
    return valeur && typeof valeur === 'object' ? valeur : {}
  } catch {
    return {}
  }
}

function sauverMemoires(memoires: Record<string, MoucheModel>) {
  try {
    window.localStorage.setItem(CLE_MEMOIRE, JSON.stringify(memoires))
  } catch {
    // Storage unavailable (private browsing…): the boss forgets this tab.
  }
}

interface MoucheBattle {
  id: string
  joueurId: string
  me: Adversaire
  chart: Chart
  state: FullState
  rng: () => number
  updatedAt: string
}

/**
 * The "La Mouche" boss fight: always local and client-side, in both mock and
 * Supabase mode. A PvE encounter needs no server authority, so it never
 * touches the `battle` edge function — unlike ranked PvP, there is nobody to
 * cheat against. Its deck is fixed (five cards themed on the FlyWire
 * connectome) and its AI keeps one weighted memory of each player's opening
 * habits across every past fight, in `localStorage`.
 */
class MoucheBattleService {
  private battles = new Map<string, MoucheBattle>()
  private listeners = new Map<string, Set<(b: Battle) => void>>()

  constructor() {
    try {
      const brut = window.sessionStorage.getItem(CLE_BATTLES)
      if (brut) {
        for (const b of JSON.parse(brut) as Omit<MoucheBattle, 'rng'>[]) {
          this.battles.set(b.id, { ...b, rng: seededRandom(b.id.length * 7919) })
        }
      }
    } catch {
      // ignore
    }
  }

  private persister() {
    try {
      const liste = [...this.battles.values()].map(({ rng: _rng, ...rest }) => rest)
      window.sessionStorage.setItem(CLE_BATTLES, JSON.stringify(liste.slice(-10)))
    } catch {
      // ignore
    }
  }

  private vue(b: MoucheBattle): Battle {
    const state = publicView(b.state)
    return {
      id: b.id,
      kind: 'boss',
      mySide: 'a',
      me: b.me,
      opponent: LA_MOUCHE,
      status: state.status === 'finished' ? 'finished' : 'active',
      state,
      hand: b.state.hands.a,
      reward: state.status === 'finished' ? computeReward(state, 'a', { kind: 'boss', winStreak: 0, firstWinToday: false }) : undefined,
      updatedAt: b.updatedAt,
    }
  }

  private notifier(b: MoucheBattle) {
    this.persister()
    const vue = this.vue(b)
    for (const cb of this.listeners.get(b.id) ?? []) cb(vue)
  }

  private trouver(id: string): MoucheBattle {
    const b = this.battles.get(id)
    if (!b) throw new Error('Battle not found.')
    return b
  }

  async creerCombat(joueur: Joueur, deck: Objet[], chart: Chart): Promise<string> {
    const id = `${PREFIXE_MOUCHE}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const rng = seededRandom(Date.now() % 2147483647)
    const deckMouche = OBJETS_MOUCHE.map((o, i) => ({ ...versCarte(o), id: `mouche-${i}-${o.id}` }))
    const state = createBattle(deck.map(versCarte), deckMouche)
    const me: Adversaire = { id: joueur.id, pseudo: joueur.pseudo, avatarUrl: joueur.avatarUrl, score: joueur.score, rang: joueur.rang, enLigne: true }
    this.battles.set(id, { id, joueurId: joueur.id, me, chart, state, rng, updatedAt: new Date().toISOString() })
    this.persister()
    return id
  }

  async charger(id: string): Promise<Battle> {
    return this.vue(this.trouver(id))
  }

  souscrire(id: string, cb: (battle: Battle) => void): () => void {
    const set = this.listeners.get(id) ?? new Set()
    set.add(cb)
    this.listeners.set(id, set)
    return () => {
      set.delete(cb)
    }
  }

  async jouer(id: string, move: Move): Promise<void> {
    const b = this.trouver(id)
    if (b.state.status !== 'active') throw new Error('Battle is over.')
    const memoires = chargerMemoires()
    const memoire = memoires[b.joueurId] ?? createMoucheModel()
    const reponse = moucheMove(b.chart, b.state, 'b', memoire, b.rng)
    // Small delay so the "locked in" state is visible before the reveal.
    await new Promise((r) => window.setTimeout(r, 450))
    b.state = resolveTurn(b.chart, b.state, { a: move, b: reponse })
    const dernier = b.state.turns[b.state.turns.length - 1]
    if (dernier.moves.a.type === 'send') {
      memoires[b.joueurId] = updateMoucheModel(memoire, dernier.champions.a.category)
      sauverMemoires(memoires)
    }
    b.updatedAt = new Date().toISOString()
    this.notifier(b)
  }

  async timeout(): Promise<void> {
    // The boss answers instantly: nothing to force.
  }

  async abandonner(id: string): Promise<void> {
    const b = this.trouver(id)
    if (b.state.status !== 'active') return
    b.state = { ...b.state, status: 'finished', winner: 'b' }
    b.updatedAt = new Date().toISOString()
    this.notifier(b)
  }
}

export const mucheBattleService = new MoucheBattleService()
