import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { estOnboarde, useSession } from '@/lib/session'
import { THROWS, coachLine, createTutorial, playRound, type Throw, type TutorialState } from '@/lib/tutorial'

const LABELS: Record<Throw, string> = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' }
const COULEURS: Record<Throw, string> = { rock: '#a8a29e', paper: '#34d399', scissors: '#fb7185' }

/**
 * /welcome — First-login warm-up (full screen). A rigged best-of-three
 * the player wins 2-1, then the first booster.
 */
export function Welcome() {
  const { joueur, chargement, terminerOnboarding } = useSession()
  const [etat, setEtat] = useState<TutorialState>(createTutorial)
  const [reveal, setReveal] = useState<{ player: Throw; coach: Throw } | null>(null)
  const [phase, setPhase] = useState<'jeu' | 'booster' | 'termine'>('jeu')
  const [sauvegarde, setSauvegarde] = useState(false)

  useEffect(() => {
    if (etat.finished && phase === 'jeu') {
      const t = window.setTimeout(() => setPhase('booster'), 1800)
      return () => window.clearTimeout(t)
    }
  }, [etat.finished, phase])

  if (chargement) return <Plein>Loading…</Plein>
  if (!joueur) return <Navigate to="/profile" replace />
  // Already onboarded and not in the middle of the warm-up: nothing to do here.
  if (estOnboarde(joueur) && phase === 'jeu' && etat.rounds.length === 0) return <Navigate to="/battle" replace />

  const jouer = (t: Throw) => {
    if (reveal || etat.finished) return
    const suivant = playRound(etat, t)
    const dernier = suivant.rounds[suivant.rounds.length - 1]
    setReveal({ player: dernier.player, coach: dernier.coach })
    window.setTimeout(() => {
      setEtat(suivant)
      setReveal(null)
    }, 900)
  }

  const reclamer = async () => {
    setSauvegarde(true)
    try {
      await terminerOnboarding()
      setPhase('termine')
    } finally {
      setSauvegarde(false)
    }
  }

  const decisifs = etat.rounds.filter((r) => r.result !== 'draw')

  if (phase === 'termine') {
    return (
      <Plein>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-succes">All set</p>
        <h1 className="mt-2 font-display text-4xl font-black">Welcome to the arena, {joueur.pseudo}</h1>
        <p className="mt-3 max-w-md text-sm text-texte-2">Open your booster, build a deck of five, and go find an opponent.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/boosters">
            <Bouton taille="lg">
              <Icon name="gift" size={18} />
              Open my booster
            </Bouton>
          </Link>
          <Link to="/battle">
            <Bouton taille="lg" variante="secondaire">
              Go to battle
            </Bouton>
          </Link>
        </div>
      </Plein>
    )
  }

  if (phase === 'booster') {
    return (
      <Plein>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-or">You won 2 – 1</p>
        <h1 className="mt-2 font-display text-4xl font-black">Your first booster</h1>
        <div className="animate-booster-pop mt-8 flex h-44 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-2 to-accent shadow-2xl shadow-accent/40">
          <Icon name="gift" size={56} className="text-white" strokeWidth={1.5} />
        </div>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-texte-2">Five cards inside. This unlocks the whole site: inventory, crafting, ranked battles.</p>
        <Bouton taille="lg" className="mt-6" onClick={reclamer} disabled={sauvegarde}>
          {sauvegarde ? 'Claiming…' : 'Claim it'}
          <Icon name="arrowRight" size={18} strokeWidth={2.5} />
        </Bouton>
      </Plein>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col justify-between overflow-y-auto bg-[#0a0914] px-6 py-8 text-texte [background-image:radial-gradient(ellipse_at_50%_30%,#2a1f5a_0%,#0a0914_60%)] md:px-16">
      <header className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-2">Welcome, {joueur.pseudo} · warm-up</p>
        <div className="flex items-center gap-2" aria-label="Score">
          {[0, 1, 2].map((i) => {
            const r = decisifs[i]
            return <span key={i} className={`h-3 w-3 rounded-full ${r ? (r.result === 'player' ? 'bg-succes' : 'bg-echec') : 'border-2 border-bordure'}`} />
          })}
          <span className="ml-2 text-xs text-texte-2">
            Round {Math.min(decisifs.length + 1, 3)} of 3 · {etat.score.player}–{etat.score.coach}
          </span>
        </div>
      </header>

      <section className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-bordure bg-carte">
            {reveal ? <Icon name={reveal.coach} size={56} strokeWidth={1.6} style={{ color: COULEURS[reveal.coach] }} className="animate-rise" /> : <Icon name="bot" size={56} strokeWidth={1.6} className="text-accent-2" />}
          </div>
          <p className="font-display font-bold">Coach</p>
        </div>
        <div className="max-w-xl rounded-2xl border border-bordure bg-carte p-6">
          <p className="font-display text-xl font-bold leading-snug md:text-2xl" aria-live="polite">
            {reveal ? `${LABELS[reveal.coach]}!` : coachLine(etat)}
          </p>
          <p className="mt-2 text-sm text-texte-2">Win this warm-up and your first booster is yours.</p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {THROWS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => jouer(t)}
              disabled={Boolean(reveal) || etat.finished}
              className={`flex h-36 w-28 flex-col items-center justify-center gap-3 rounded-3xl border bg-carte transition-all hover:-translate-y-1 disabled:cursor-not-allowed md:h-48 md:w-48 ${reveal?.player === t ? 'ring-2 ring-accent-2' : ''}`}
              style={{ borderColor: `${COULEURS[t]}88` }}
            >
              <Icon name={t} size={56} strokeWidth={1.6} style={{ color: COULEURS[t] }} />
              <span className="font-display font-bold md:text-lg">{LABELS[t]}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-texte-2">Best of three. No cards, no stats, just the classic. The whole site unlocks right after.</p>
      </section>
    </div>
  )
}

function Plein({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto bg-[#0a0914] p-6 text-center text-texte [background-image:radial-gradient(ellipse_at_50%_30%,#2a1f5a_0%,#0a0914_60%)]">
      {children}
    </div>
  )
}
