import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { mucheBattleService } from '@/services/battle/mouche'
import { chargerDeck } from '@/services/deck'

/**
 * Starts the boss fight against La Mouche: loads the saved deck (or sends
 * the player to the deck builder), creates the battle and opens the arena.
 */
export function useDemarrerMouche() {
  const { joueur, chart } = useSession()
  const navigate = useNavigate()
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const demarrer = useCallback(async () => {
    if (!joueur || enCours) return
    setEnCours(true)
    setErreur(null)
    try {
      const deck = await chargerDeck(joueur)
      if (!deck) {
        navigate('/battle/deck?next=mouche')
        return
      }
      const id = await mucheBattleService.creerCombat(joueur, deck, chart)
      navigate(`/battle/${id}`)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Could not start the fight.')
    } finally {
      setEnCours(false)
    }
  }, [joueur, chart, enCours, navigate])

  return { demarrer, enCours, erreur }
}
