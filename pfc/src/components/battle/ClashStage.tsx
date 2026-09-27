import { Icon } from '@/components/Icon'
import type { BattleState, Chart, Side, TurnRecord } from '@/lib/engine'
import { BattleCard } from './BattleCard'

interface ClashStageProps {
  state: BattleState
  chart: Chart
  mySide: Side
  /** Turn being replayed, or null while players decide. */
  reveal: TurnRecord | null
  /** Opponent has locked a move in (PvP waiting state). */
  adversairePret: boolean
  moiPret: boolean
}

/** Centre of the arena: the two champions and the reveal of the clash. */
export function ClashStage({ state, chart, mySide, reveal, adversairePret, moiPret }: ClashStageProps) {
  const theirSide: Side = mySide === 'a' ? 'b' : 'a'

  if (reveal) {
    const mine = reveal.champions[mySide]
    const theirs = reveal.champions[theirSide]
    const iLost = reveal.eliminated.includes(mySide)
    const theyLost = reveal.eliminated.includes(theirSide)
    const verdict = reveal.clash.outcome === mySide ? 'You win the clash' : 'They win the clash'
    const teinte = reveal.clash.outcome === mySide ? 'bg-succes/15 text-succes' : 'bg-echec/15 text-echec'
    const REASON_LABEL: Partial<Record<TurnRecord['clash']['reason'], string>> = {
      explicit: 'Explicit win · ',
      points: 'Fighting points · ',
      statsum: 'Stats · ',
      attack: 'Attack · ',
      rarity: 'Rarity · ',
    }
    return (
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-14">
        <Champion label="Their champion" side="left" perdu={theyLost}>
          <BattleCard card={theirs} chart={chart} taille="lg" momentum={reveal.momentum[theirSide]} />
        </Champion>
        <div className="flex w-72 flex-col items-center gap-3 text-center">
          <p className="animate-clash-word font-pixel text-2xl text-white [text-shadow:0_0_40px_rgba(79,156,245,0.8)] md:text-4xl">
            CLASH
          </p>
          <p className="animate-rise-late text-sm leading-relaxed text-violet-100">{reveal.clash.text}</p>
          <span className={`animate-rise-late rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${teinte}`}>
            {REASON_LABEL[reveal.clash.reason] ?? ''}
            {verdict}
          </span>
        </div>
        <Champion label="Your champion" side="right" perdu={iLost}>
          <BattleCard card={mine} chart={chart} taille="lg" momentum={reveal.momentum[mySide]} />
        </Champion>
      </div>
    )
  }

  const mine = state.sides[mySide].champion
  const theirs = state.sides[theirSide].champion
  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:gap-14">
      <Champion label="Their champion" side="left">
        {theirs ? (
          <BattleCard card={theirs} chart={chart} taille="lg" momentum={state.sides[theirSide].momentum} />
        ) : (
          <Placeholder texte={adversairePret ? 'Locked in' : 'Choosing a card'} pret={adversairePret} />
        )}
      </Champion>
      <div className="flex w-72 flex-col items-center gap-2 text-center">
        <p className="font-display text-3xl font-black tracking-tight text-texte-2">VS</p>
        <p className="text-xs uppercase tracking-[0.2em] text-texte-2">
          {moiPret && !adversairePret ? 'Waiting for the opponent' : 'Both moves reveal together'}
        </p>
      </div>
      <Champion label="Your champion" side="right">
        {mine ? (
          <BattleCard card={mine} chart={chart} taille="lg" momentum={state.sides[mySide].momentum} />
        ) : (
          <Placeholder texte={moiPret ? 'Locked in' : 'Pick a card below'} pret={moiPret} />
        )}
      </Champion>
    </div>
  )
}

function Champion({ label, side, perdu = false, children }: { label: string; side: 'left' | 'right'; perdu?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${side === 'left' ? 'animate-clash-left' : 'animate-clash-right'} ${perdu ? 'animate-shatter' : ''}`}>{children}</div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-texte-2">{label}</p>
    </div>
  )
}

function Placeholder({ texte, pret }: { texte: string; pret: boolean }) {
  return (
    <div
      className={`flex h-[17rem] w-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center text-sm md:h-[19.5rem] md:w-56 ${pret ? 'border-accent-2/70 text-accent-2' : 'border-bordure text-texte-2'}`}
    >
      <Icon name={pret ? 'check' : 'clock'} size={26} />
      {texte}
    </div>
  )
}
