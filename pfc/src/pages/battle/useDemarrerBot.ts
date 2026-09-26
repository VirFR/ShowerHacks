import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { battleService } from '@/services/battle'
import { chargerDeck } from '@/services/deck'

/**
 * Starts a practice battle: loads the saved deck (or sends the player to
 * the deck builder), creates the battle and opens the arena.
 */
export function useDemarrerBot() {
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
        navigate('/battle/deck?next=bot')
        return
      }
      const id = await battleService.creerContreBot(joueur, deck, chart)
      navigate(`/battle/${id}`)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Could not start the battle.')
    } finally {
      setEnCours(false)
    }
  }, [joueur, chart, enCours, navigate])

  return { demarrer, enCours, erreur }
}
