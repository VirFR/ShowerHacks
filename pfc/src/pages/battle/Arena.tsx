import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { BattleCard, CardBack } from '@/components/battle/BattleCard'
import { ClashStage } from '@/components/battle/ClashStage'
import { ResultOverlay } from '@/components/battle/ResultOverlay'
import { TurnTimer } from '@/components/battle/TurnTimer'
import { MAX_TURNS, type Move, type Side, type TurnRecord } from '@/lib/engine'
import { useSession } from '@/lib/session'
import { battleService } from '@/services/battle'
import type { Battle } from '@/types'
import { useDemarrerBot } from './useDemarrerBot'

const DUREE_TOUR_S = 20
const DUREE_REVEAL_MS = 3000

/** /battle/:id — Full-screen arena (rendered outside the app layout). */
export function Arena() {
  const { id } = useParams<{ id: string }>()
  const { joueur, chart, chargement } = useSession()
  const { demarrer } = useDemarrerBot()

  const [battle, setBattle] = useState<Battle | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [selection, setSelection] = useState<string | null>(null)
  const [retraite, setRetraite] = useState(false)
  const [verrouille, setVerrouille] = useState(false)
  const [reveal, setReveal] = useState<TurnRecord | null>(null)
  const [resultatVisible, setResultatVisible] = useState(false)
  const toursVus = useRef<number | null>(null)

  // Load + subscribe.
  useEffect(() => {
    if (!id || chargement) return
    let actif = true
    battleService
      .charger(id)
      .then((b) => actif && setBattle(b))
      .catch((e) => actif && setErreur(e instanceof Error ? e.message : 'Battle not found.'))
    const stop = battleService.souscrire(id, (b) => actif && setBattle(b))
    return () => {
      actif = false
      stop()
    }
  }, [id, chargement])

  // Replay the latest turn whenever a new one lands.
  useEffect(() => {
    if (!battle) return
    const n = battle.state.turns.length
    if (toursVus.current === null) {
      toursVus.current = n
      if (battle.status === 'finished') setResultatVisible(true)
      return
    }
    if (n > toursVus.current) {
      toursVus.current = n
      setReveal(battle.state.turns[n - 1])
      setVerrouille(false)
      setSelection(null)
      setRetraite(false)
      const t = window.setTimeout(() => {
        setReveal(null)
        if (battle.status === 'finished') setResultatVisible(true)
      }, DUREE_REVEAL_MS)
      return () => window.clearTimeout(t)
    }
    if (battle.status === 'finished' && !reveal) setResultatVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle])

  const mySide: Side = battle?.mySide ?? 'a'
  const theirSide: Side = mySide === 'a' ? 'b' : 'a'
  const moi = battle?.state.sides[mySide]
  const eux = battle?.state.sides[theirSide]
  const enDecision = Boolean(battle && battle.status === 'active' && !reveal && !verrouille)
  const aChampion = Boolean(moi?.champion)
  const peutRetraiter = aChampion && !moi?.retreatUsed && (battle?.hand.length ?? 0) > 0

  const coup = useMemo<Move | null>(() => {
    if (!battle || !moi) return null
    if (!moi.champion) return selection ? { type: 'send', cardId: selection } : null
    if (retraite) return selection ? { type: 'retreat', cardId: selection } : null
    return { type: 'hold' }
  }, [battle, moi, selection, retraite])

  const envoyer = useCallback(
    async (m: Move) => {
      if (!battle || verrouille) return
      setVerrouille(true)
      setErreur(null)
      try {
        await battleService.jouer(battle.id, m)
        // Realtime can lag or miss an event: refresh once after the move.
        battleService.charger(battle.id).then(setBattle).catch(() => {})
      } catch (e) {
        setVerrouille(false)
        setErreur(e instanceof Error ? e.message : 'Move refused.')
      }
    },
    [battle, verrouille],
  )

  const expirer = useCallback(() => {
    if (!battle || !moi || !enDecision) return
    const fallback: Move = moi.champion ? { type: 'hold' } : { type: 'send', cardId: battle.hand[0].id }
    envoyer(coup ?? fallback)
  }, [battle, moi, enDecision, coup, envoyer])

  const abandonner = async () => {
    if (!battle || !window.confirm('Forfeit this battle?')) return
    await battleService.abandonner(battle.id)
  }

  if (erreur && !battle) {
    return (
      <Plein>
        <p className="text-echec">{erreur}</p>
        <Link to="/battle" className="mt-4">
          <Bouton variante="secondaire">Back to battle</Bouton>
        </Link>
      </Plein>
    )
  }
  if (!battle || !moi || !eux) {
    return (
      <Plein>
        <p className="animate-pulse text-texte-2">Entering the arena…</p>
      </Plein>
    )
  }
  if (!joueur && !chargement) {
    return (
      <Plein>
        <p className="text-texte-2">Sign in to fight.</p>
      </Plein>
    )
  }

  const libelleAction = !aChampion
    ? selection
      ? `Send ${battle.hand.find((c) => c.id === selection)?.name ?? 'card'}`
      : 'Pick a card to send'
    : retraite
      ? selection
        ? `Retreat to ${battle.hand.find((c) => c.id === selection)?.name ?? 'card'}`
        : 'Pick the card to swap in'
      : 'Hold · Lock in'

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#0a0914] text-texte [background-image:radial-gradient(ellipse_at_50%_45%,#2a1f5a_0%,#0a0914_60%)]">
      {/* Opponent strip */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar pseudo={battle.opponent.pseudo} avatarUrl={battle.opponent.avatarUrl} taille="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{battle.opponent.pseudo}</p>
            <p className="text-[11px] text-texte-2">
              {battle.opponent.rang} · {eux.handCount} card{eux.handCount === 1 ? '' : 's'} left
            </p>
          </div>
          <div className="ml-2 hidden gap-1 sm:flex" aria-label={`${eux.handCount} hidden cards`}>
            {Array.from({ length: eux.handCount }).map((_, i) => (
              <CardBack key={i} />
            ))}
          </div>
          <div className="hidden gap-1 sm:flex" aria-label="Eliminated cards">
            {eux.eliminated.map((c) => (
              <BattleCard key={c.id} card={c} chart={chart} taille="xs" estompe />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-texte-2">
            Turn {Math.min(battle.state.turn, MAX_TURNS)} of {MAX_TURNS}
          </p>
          <TurnTimer duree={DUREE_TOUR_S} cle={`${battle.state.turn}-${reveal ? 'r' : 'd'}`} actif={enDecision} onExpire={expirer} />
        </div>
        <Bouton variante="fantome" taille="sm" onClick={abandonner} disabled={battle.status !== 'active'}>
          Forfeit
        </Bouton>
      </header>

      {/* Clash stage */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <ClashStage state={battle.state} chart={chart} mySide={mySide} reveal={reveal} adversairePret={eux.submitted} moiPret={verrouille || moi.submitted} />
          {battle.kind === 'pvp' && battle.status === 'active' && !reveal && (verrouille || moi.submitted) && !eux.submitted && (
            <ForceTimeout depuis={battle.updatedAt} onForce={() => battleService.timeout(battle.id).then(() => battleService.charger(battle.id).then(setBattle)).catch((e) => setErreur(e instanceof Error ? e.message : 'Not yet.'))} />
          )}
        </div>
      </main>

      {/* My hand + actions */}
      <footer className="flex flex-col gap-3 border-t border-white/5 bg-fond/40 px-4 py-3 backdrop-blur md:flex-row md:items-end md:justify-between md:px-8 md:py-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-texte-2">
            Your hand · {battle.hand.length} card{battle.hand.length === 1 ? '' : 's'}
            {moi.retreatUsed ? ' · retreat used' : aChampion ? ' · retreat available' : ''}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {battle.hand.map((c) => (
              <BattleCard
                key={c.id}
                card={c}
                chart={chart}
                taille="sm"
                selectionne={selection === c.id}
                estompe={!enDecision || (aChampion && !retraite)}
                onClick={() => setSelection((s) => (s === c.id ? null : c.id))}
              />
            ))}
            {battle.hand.length === 0 && <p className="self-center text-sm text-texte-2">Your champion is your last card.</p>}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <p className="max-w-xs text-right text-xs leading-relaxed text-texte-2">
            {!aChampion
              ? 'No champion on the field: send a card. Both flips happen together.'
              : peutRetraiter
                ? 'Your champion stays unless you retreat. Retreat swaps in a hidden card, once per battle.'
                : 'Your champion stays on the field.'}
          </p>
          {erreur && <p className="text-xs text-echec">{erreur}</p>}
          <div className="flex gap-2">
            {peutRetraiter && (
              <Bouton
                variante="secondaire"
                onClick={() => {
                  setRetraite((r) => !r)
                  setSelection(null)
                }}
                disabled={!enDecision}
                aria-pressed={retraite}
                className={retraite ? 'ring-2 ring-accent-2' : ''}
              >
                <Icon name="undo" size={16} />
                {retraite ? 'Cancel retreat' : 'Retreat'}
              </Bouton>
            )}
            <Bouton taille="lg" onClick={() => coup && envoyer(coup)} disabled={!enDecision || !coup} className={enDecision && coup ? 'animate-pulse-ring' : ''}>
              {verrouille ? 'Locked in' : libelleAction}
            </Bouton>
          </div>
        </div>
      </footer>

      {resultatVisible && battle.status === 'finished' && (
        <ResultOverlay
          battle={battle}
          onRematch={
            battle.kind === 'bot'
              ? () => {
                  setResultatVisible(false)
                  demarrer()
                }
              : undefined
          }
        />
      )}
      {battle.status === 'finished' && !resultatVisible && !reveal && (
        <button type="button" className="absolute inset-0" onClick={() => setResultatVisible(true)} aria-label="Show result" />
      )}
    </div>
  )
}

/** PvP only: after 30 s of silence the waiting player may force the turn. */
function ForceTimeout({ depuis, onForce }: { depuis: string; onForce: () => void }) {
  const [restant, setRestant] = useState(30)
  useEffect(() => {
    const tick = () => setRestant(Math.max(0, 30 - Math.floor((Date.now() - new Date(depuis).getTime()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [depuis])
  return (
    <div className="animate-rise flex items-center gap-3 rounded-full border border-bordure bg-carte/80 px-4 py-2 text-xs text-texte-2">
      {restant > 0 ? (
        <>
          <Icon name="clock" size={14} />
          Waiting for the opponent · you can force the turn in {restant} s
        </>
      ) : (
        <>
          The opponent is silent.
          <Bouton taille="sm" variante="secondaire" onClick={onForce}>
            Force the turn
          </Bouton>
        </>
      )}
    </div>
  )
}

function Plein({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 flex flex-col items-center justify-center bg-fond p-6 text-center">{children}</div>
}
