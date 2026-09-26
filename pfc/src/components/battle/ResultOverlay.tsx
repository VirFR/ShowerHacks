import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import type { Battle } from '@/types'

interface ResultOverlayProps {
  battle: Battle
  onRematch?: () => void
}

const TITRES = { win: 'VICTORY', draw: 'DRAW', loss: 'DEFEAT' } as const
const COULEURS = {
  win: 'text-white [text-shadow:0_0_50px_rgba(74,222,128,0.5)]',
  draw: 'text-white [text-shadow:0_0_50px_rgba(251,191,36,0.5)]',
  loss: 'text-white [text-shadow:0_0_50px_rgba(248,113,113,0.5)]',
}
const TIER_CLASSES = { bronze: 'bg-amber-700/30 text-amber-300', silver: 'bg-slate-300/20 text-slate-200', gold: 'bg-or/20 text-or' }

/** Full-screen result: outcome, points breakdown, boosters earned. */
export function ResultOverlay({ battle, onRematch }: ResultOverlayProps) {
  const reward = battle.reward
  const result = reward?.result ?? (battle.state.winner === 'draw' ? 'draw' : battle.state.winner === battle.mySide ? 'win' : 'loss')
  const alive = battle.state.sides[battle.mySide].handCount + (battle.state.sides[battle.mySide].champion ? 1 : 0)
  const sousTitre =
    result === 'win'
      ? `You beat ${battle.opponent.pseudo} with ${alive} card${alive === 1 ? '' : 's'} still standing.`
      : result === 'draw'
        ? `You and ${battle.opponent.pseudo} took each other down.`
        : `${battle.opponent.pseudo} outplayed you this time.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-fond/85 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-labelledby="result-title">
      <div className="animate-rise w-full max-w-3xl rounded-3xl border border-bordure bg-fond-2 p-6 shadow-2xl shadow-black/60 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${result === 'win' ? 'text-succes' : result === 'draw' ? 'text-or' : 'text-echec'}`}>
              {battle.kind === 'bot' ? 'Practice battle' : 'Ranked duel'} · {battle.state.turns.length} turn{battle.state.turns.length === 1 ? '' : 's'}
            </p>
            <h2 id="result-title" className={`mt-1 font-display text-6xl font-black leading-none tracking-tight ${COULEURS[result]}`}>
              {TITRES[result]}
            </h2>
            <p className="mt-3 text-sm text-texte-2">{sousTitre}</p>
          </div>
          {reward && (
            <div className="flex flex-col items-start md:items-end">
              <p className="font-display text-4xl font-black leading-none text-or">+{reward.points}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-texte-2">points</p>
            </div>
          )}
        </div>

        {reward && (
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <ul className="text-sm">
              {reward.breakdown.map((l, i) => (
                <li key={i} className="flex items-center justify-between border-b border-bordure py-2 last:border-b-0">
                  <span className="text-texte-2">{l.label}</span>
                  <span className={`font-bold tabular-nums ${l.points < 0 ? 'text-texte-2' : ''}`}>
                    {l.points >= 0 ? '+' : ''}
                    {l.points}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-bordure bg-carte p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold">Boosters earned</p>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${TIER_CLASSES[reward.tier]}`}>{reward.tier} tier</span>
              </div>
              <div className="mt-4 flex min-h-16 items-end gap-2">
                {reward.boosters === 0 ? (
                  <p className="text-sm text-texte-2">No booster this time. Win to earn some.</p>
                ) : (
                  Array.from({ length: reward.boosters }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-16 w-12 items-end justify-center rounded-lg pb-1 text-[9px] font-black shadow-lg ${
                        reward.bonusBooster && i === reward.boosters - 1
                          ? 'bg-gradient-to-br from-accent-2 to-accent text-white'
                          : reward.tier === 'gold'
                            ? 'bg-gradient-to-br from-or to-amber-700 text-fond'
                            : reward.tier === 'silver'
                              ? 'bg-gradient-to-br from-slate-200 to-slate-500 text-fond'
                              : 'bg-gradient-to-br from-amber-600 to-amber-900 text-white'
                      }`}
                    >
                      {reward.bonusBooster && i === reward.boosters - 1 ? 'DAILY' : ''}
                    </div>
                  ))
                )}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-texte-2">
                {reward.tier === 'gold' ? 'Best odds of rare cards.' : reward.tier === 'silver' ? 'Better odds of rare cards.' : 'Standard odds.'} Your cards never change hands.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-end gap-2">
          <Link to="/battle">
            <Bouton variante="fantome">Back to battle</Bouton>
          </Link>
          {onRematch && (
            <Bouton variante="secondaire" onClick={onRematch}>
              <Icon name="refresh" size={16} />
              Rematch
            </Bouton>
          )}
          {reward && reward.boosters > 0 && (
            <Link to="/boosters">
              <Bouton variante="or">
                Claim {reward.boosters} booster{reward.boosters > 1 ? 's' : ''}
                <Icon name="arrowRight" size={16} strokeWidth={2.5} />
              </Bouton>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
