import { useEffect, useState } from 'react'
import { useSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import type { Adversaire, Defi } from '@/types'

/**
 * Lobby: who is online and the challenges between players.
 * Mock mode lists the other test accounts as offline (live challenges
 * need the online mode). The Supabase implementation lives in `lobby.remote.ts`.
 */
export interface Lobby {
  joueurs: Adversaire[]
  /** Challenge I sent and that is still pending. */
  defiEnvoye: Defi | null
  /** Challenges waiting for my answer. */
  defisRecus: Defi[]
  chargement: boolean
  enLigne: boolean
  defier: (adversaireId: string) => Promise<void>
  annuler: () => Promise<void>
  accepter: (defiId: string) => Promise<string>
  refuser: (defiId: string) => Promise<void>
}

export function useLobby(): Lobby {
  const { joueur, comptes } = useSession()
  const [distant, setDistant] = useState<Lobby | null>(null)

  useEffect(() => {
    if (!supabase || !joueur) return
    let actif = true
    let arreter: (() => void) | undefined
    import('./lobby.remote').then(({ demarrerLobby }) => {
      if (!actif) return
      arreter = demarrerLobby(joueur, (l) => setDistant(l))
    })
    return () => {
      actif = false
      arreter?.()
    }
  }, [joueur])

  if (supabase) {
    return (
      distant ?? {
        joueurs: [],
        defiEnvoye: null,
        defisRecus: [],
        chargement: true,
        enLigne: true,
        defier: async () => {},
        annuler: async () => {},
        accepter: async () => '',
        refuser: async () => {},
      }
    )
  }

  return {
    joueurs: comptes
      .filter((c) => c.id !== joueur?.id)
      .map((c) => ({ id: c.id, pseudo: c.pseudo, score: c.score, rang: c.rang, enLigne: false })),
    defiEnvoye: null,
    defisRecus: [],
    chargement: false,
    enLigne: false,
    defier: async () => {},
    annuler: async () => {},
    accepter: async () => '',
    refuser: async () => {},
  }
}
