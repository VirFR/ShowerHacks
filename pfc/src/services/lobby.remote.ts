import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import type { Adversaire, Defi, Joueur } from '@/types'
import type { Lobby } from './lobby'
import { listerJoueurs, versAdversaire } from './profile'

interface ChallengeRow {
  id: string
  from_user: string
  to_user: string
  status: Defi['status']
  battle_id: string | null
  created_at: string
}

/**
 * Online lobby: Realtime Presence on the `lobby` channel says who is
 * online; the `challenges` table (Realtime on) carries the invitations;
 * the `battle` edge function creates the battle when one is accepted.
 */
export function demarrerLobby(joueur: Joueur, emettre: (l: Lobby) => void): () => void {
  const sb = getSupabase()
  let tous: Adversaire[] = []
  let presents = new Set<string>()
  let defis: ChallengeRow[] = []
  let arrete = false

  const moi: Adversaire = versAdversaire({ id: joueur.id, username: joueur.pseudo, avatar_url: joueur.avatarUrl ?? null, score: joueur.score }, true)
  const parId = () => new Map([...tous, moi].map((a) => [a.id, a]))

  const versDefi = (r: ChallengeRow): Defi => {
    const map = parId()
    const inconnu = (id: string): Adversaire => ({ id, pseudo: 'Player', score: 0, rang: 'Bronze', enLigne: presents.has(id) })
    return { id: r.id, from: map.get(r.from_user) ?? inconnu(r.from_user), to: map.get(r.to_user) ?? inconnu(r.to_user), status: r.status, battleId: r.battle_id, createdAt: r.created_at }
  }

  const appeler = async <T,>(action: string, body: Record<string, unknown>): Promise<T> => {
    const { data, error } = await sb.functions.invoke<T>('battle', { body: { action, ...body } })
    if (error) throw error
    return data as T
  }

  const publier = () => {
    if (arrete) return
    const pendants = defis.filter((d) => d.status === 'pending')
    const recent = (d: ChallengeRow) => Date.now() - new Date(d.created_at).getTime() < 2 * 60 * 1000
    // My outgoing challenge: pending, or just accepted (carries the battle to join).
    const sortant = defis.find((d) => d.from_user === joueur.id && (d.status === 'pending' || (d.status === 'accepted' && d.battle_id && recent(d))))
    emettre({
      joueurs: tous.map((a) => ({ ...a, enLigne: presents.has(a.id) })).sort((x, y) => Number(y.enLigne) - Number(x.enLigne) || y.score - x.score),
      defiEnvoye: sortant ? versDefi(sortant) : null,
      defisRecus: pendants.filter((d) => d.to_user === joueur.id).map(versDefi),
      chargement: false,
      enLigne: true,
      defier: async (adversaireId) => {
        await appeler('challenge', { toUser: adversaireId })
        await rechargerDefis()
      },
      annuler: async () => {
        const mien = pendants.find((d) => d.from_user === joueur.id)
        if (mien) await appeler('decline', { challengeId: mien.id })
        await rechargerDefis()
      },
      accepter: async (defiId) => {
        const { battleId } = await appeler<{ battleId: string }>('accept', { challengeId: defiId })
        await rechargerDefis()
        return battleId
      },
      refuser: async (defiId) => {
        await appeler('decline', { challengeId: defiId })
        await rechargerDefis()
      },
    })
  }

  const rechargerDefis = async () => {
    const depuis = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data } = await sb
      .from('challenges')
      .select('*')
      .or(`from_user.eq.${joueur.id},to_user.eq.${joueur.id}`)
      .gte('created_at', depuis)
      .order('created_at', { ascending: false })
    defis = (data ?? []) as ChallengeRow[]
    publier()
  }

  listerJoueurs(joueur.id).then((liste) => {
    tous = liste
    publier()
  })
  rechargerDefis()

  const presence: RealtimeChannel = sb.channel('lobby', { config: { presence: { key: joueur.id } } })
  presence
    .on('presence', { event: 'sync' }, () => {
      presents = new Set(Object.keys(presence.presenceState()))
      publier()
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') presence.track({ pseudo: joueur.pseudo, at: Date.now() })
    })

  const changements = sb
    .channel(`challenges:${joueur.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges', filter: `to_user=eq.${joueur.id}` }, () => rechargerDefis())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges', filter: `from_user=eq.${joueur.id}` }, () => rechargerDefis())
    .subscribe()

  // Realtime can miss events: poll gently as a safety net.
  const poll = window.setInterval(rechargerDefis, 8000)

  return () => {
    arrete = true
    window.clearInterval(poll)
    sb.removeChannel(presence)
    sb.removeChannel(changements)
  }
}
