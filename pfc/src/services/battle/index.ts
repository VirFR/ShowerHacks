import type { Chart, Move } from '@/lib/engine'
import { supabase } from '@/lib/supabase'
import type { Battle, Joueur, Objet } from '@/types'
import { LocalBattleService } from './local'
import { RemoteBattleService } from './remote'

/**
 * Battles, seen from the UI. Two implementations:
 * - `LocalBattleService`: in-memory, against the bot, no network (mock mode);
 * - `RemoteBattleService`: the `battle` edge function + Realtime (supabase mode).
 */
export interface BattleService {
  /** Starts a practice battle against the bot with the given deck. Returns the battle id. */
  creerContreBot(joueur: Joueur, deck: Objet[], chart: Chart): Promise<string>
  /** Current snapshot of a battle, from the signed-in player's point of view. */
  charger(id: string): Promise<Battle>
  /** Calls back on every change. Returns the unsubscribe function. */
  souscrire(id: string, cb: (battle: Battle) => void): () => void
  jouer(id: string, move: Move): Promise<void>
  /** Forces the turn when the opponent has been silent too long. */
  timeout(id: string): Promise<void>
  abandonner(id: string): Promise<void>
}

export const battleService: BattleService = supabase ? new RemoteBattleService() : new LocalBattleService()
