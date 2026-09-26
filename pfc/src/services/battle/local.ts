import {
  botDeck,
  botMove,
  computeReward,
  createBattle,
  publicView,
  resolveTurn,
  seededRandom,
  type Chart,
  type EngineCard,
  type FullState,
  type Move,
} from '@/lib/engine'
import { versCarte } from '@/lib/combat'
import { OBJETS_MOCK } from '@/mocks'
import type { Adversaire, Battle, Joueur, Objet } from '@/types'
import type { BattleService } from './index'

export const COACH: Adversaire = { id: 'bot', pseudo: 'Coach', score: 0, rang: 'Bronze', enLigne: true }

interface LocalBattle {
  id: string
  me: Adversaire
  chart: Chart
  state: FullState
  rng: () => number
  updatedAt: string
}

const CLE = 'pfc.battles'

/**
 * Offline battles against the bot. The whole engine runs in the browser;
 * state survives a refresh through sessionStorage.
 */
export class LocalBattleService implements BattleService {
  private battles = new Map<string, LocalBattle>()
  private listeners = new Map<string, Set<(b: Battle) => void>>()

  constructor() {
    try {
      const brut = window.sessionStorage.getItem(CLE)
      if (brut) {
        for (const b of JSON.parse(brut) as Omit<LocalBattle, 'rng'>[]) {
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
      window.sessionStorage.setItem(CLE, JSON.stringify(liste.slice(-10)))
    } catch {
      // ignore
    }
  }

  private vue(b: LocalBattle): Battle {
    const state = publicView(b.state)
    return {
      id: b.id,
      kind: 'bot',
      mySide: 'a',
      me: b.me,
      opponent: COACH,
      status: state.status === 'finished' ? 'finished' : 'active',
      state,
      hand: b.state.hands.a,
      reward: state.status === 'finished' ? computeReward(state, 'a', { kind: 'bot', winStreak: 0, firstWinToday: false }) : undefined,
      updatedAt: b.updatedAt,
    }
  }

  private notifier(b: LocalBattle) {
    this.persister()
    const vue = this.vue(b)
    for (const cb of this.listeners.get(b.id) ?? []) cb(vue)
  }

  private trouver(id: string): LocalBattle {
    const b = this.battles.get(id)
    if (!b) throw new Error('Battle not found.')
    return b
  }

  async creerContreBot(joueur: Joueur, deck: Objet[], chart: Chart): Promise<string> {
    const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const rng = seededRandom(Date.now() % 2147483647)
    const catalogue: EngineCard[] = OBJETS_MOCK.map(versCarte)
    const state = createBattle(deck.map(versCarte), botDeck(catalogue, rng, 'coach'))
    const me: Adversaire = { id: joueur.id, pseudo: joueur.pseudo, avatarUrl: joueur.avatarUrl, score: joueur.score, rang: joueur.rang, enLigne: true }
    this.battles.set(id, { id, me, chart, state, rng, updatedAt: new Date().toISOString() })
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
    const reponse = botMove(b.chart, b.state, 'b', b.rng)
    // Small delay so the "locked in" state is visible before the reveal.
    await new Promise((r) => window.setTimeout(r, 450))
    b.state = resolveTurn(b.chart, b.state, { a: move, b: reponse })
    b.updatedAt = new Date().toISOString()
    this.notifier(b)
  }

  async timeout(): Promise<void> {
    // The bot answers instantly: nothing to force.
  }

  async abandonner(id: string): Promise<void> {
    const b = this.trouver(id)
    if (b.state.status !== 'active') return
    b.state = { ...b.state, status: 'finished', winner: 'b' }
    b.updatedAt = new Date().toISOString()
    this.notifier(b)
  }
}
