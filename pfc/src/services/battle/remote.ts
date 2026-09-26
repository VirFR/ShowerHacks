import type { Chart, Move } from '@/lib/engine'
import { getSupabase } from '@/lib/supabase'
import type { Battle, Joueur, Objet } from '@/types'
import type { BattleService } from './index'

/**
 * Online battles: every action goes through the `battle` edge function
 * (which owns the engine and the hidden hands); updates arrive through
 * Realtime on the public `battles` row. Implemented in the online step.
 */
export class RemoteBattleService implements BattleService {
  private async appeler<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
    const { data, error } = await getSupabase().functions.invoke<T>('battle', { body: { action, ...body } })
    if (error) throw error
    return data as T
  }

  async creerContreBot(_joueur: Joueur, _deck: Objet[], _chart: Chart): Promise<string> {
    const { id } = await this.appeler<{ id: string }>('create', { kind: 'bot' })
    return id
  }

  async charger(id: string): Promise<Battle> {
    return this.appeler<Battle>('get', { battleId: id })
  }

  souscrire(id: string, cb: (battle: Battle) => void): () => void {
    const canal = getSupabase()
      .channel(`battle:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${id}` }, () => {
        this.charger(id).then(cb).catch(console.error)
      })
      .subscribe()
    return () => {
      getSupabase().removeChannel(canal)
    }
  }

  async jouer(id: string, move: Move): Promise<void> {
    await this.appeler('move', { battleId: id, move })
  }

  async timeout(id: string): Promise<void> {
    await this.appeler('timeout', { battleId: id })
  }

  async abandonner(id: string): Promise<void> {
    await this.appeler('forfeit', { battleId: id })
  }
}
