import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { categoryLabel, type Chart, type EngineCard } from '@/lib/engine'
import { LETTRE_RARETE, styleArtCategorie, stylePanneauRarete, TEINTE_RARETE } from '@/lib/format'
import type { Rarete } from '@/types'

type Taille = 'xs' | 'sm' | 'md' | 'lg'

interface BattleCardProps {
  card: EngineCard
  chart: Chart
  taille?: Taille
  selectionne?: boolean
  /** Greyed out (eliminated, unavailable). */
  estompe?: boolean
  momentum?: number
  onClick?: () => void
  className?: string
  /** Extra badge in the top-right corner (slot number, "in deck"…). */
  badge?: string
}

const DIMENSIONS: Record<Taille, string> = {
  xs: 'w-10 h-14 rounded-lg p-0.5',
  sm: 'w-28 h-44 rounded-xl p-1',
  md: 'w-36 h-52 rounded-2xl p-1.5',
  lg: 'w-48 h-[17rem] rounded-2xl p-2 md:w-56 md:h-[19.5rem]',
}

/**
 * A card in the arena, the hand or the deck builder: the same dark body,
 * category art and rarity panel as the collection card, in fixed sizes.
 * A broken image becomes the card's initial.
 */
export function BattleCard({
  card,
  chart,
  taille = 'md',
  selectionne = false,
  estompe = false,
  momentum = 0,
  onClick,
  className = '',
  badge,
}: BattleCardProps) {
  const [imageKo, setImageKo] = useState(false)
  const petite = taille === 'xs'
  const rarete = (card.rarity as Rarete | undefined) ?? 'commun'
  const teinte = TEINTE_RARETE[rarete]
  const grande = taille === 'lg'

  const contenu = (
    <>
      <div
        className={`relative flex items-center justify-center overflow-hidden ${petite ? 'h-full rounded-md' : 'h-[52%] rounded-t-lg'}`}
        style={styleArtCategorie(card.category)}
      >
        {card.imageUrl && !imageKo ? (
          <img
            src={card.imageUrl}
            alt=""
            draggable={false}
            onError={() => setImageKo(true)}
            className="h-[64%] w-[64%] object-contain drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]"
          />
        ) : (
          <span className={`font-display font-bold text-white ${petite ? 'text-sm' : 'text-3xl'}`}>{card.name.charAt(0).toUpperCase()}</span>
        )}
        {!petite && (
          <span
            className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 font-display text-[10px] font-bold leading-none"
            style={{ background: teinte.badgeFond, color: teinte.badgeTexte }}
          >
            {LETTRE_RARETE[rarete]}
          </span>
        )}
        {!petite && momentum > 0 && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full border border-ink bg-or px-1.5 py-0.5 text-[10px] font-black text-ink">
            <Icon name="bolt" size={10} strokeWidth={3} />+{momentum}
          </span>
        )}
        {!petite && momentum <= 0 && badge && (
          <span className="absolute right-1.5 top-1.5 rounded-full border border-ink bg-or px-1.5 py-0.5 text-[9px] font-bold text-ink">{badge}</span>
        )}
      </div>
      {!petite && (
        <div className={`flex min-h-0 flex-1 flex-col rounded-b-lg text-ink ${grande ? 'px-3 pb-2.5 pt-2.5' : 'px-2 pb-1.5 pt-1.5'}`} style={stylePanneauRarete(rarete)}>
          <p className={`font-display font-bold leading-tight ${grande ? 'text-base' : 'line-clamp-2 text-[11px]'}`}>{card.name}</p>
          {grande && <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">{categoryLabel(chart, card.category)}</p>}
          <div className={`mt-auto flex items-center justify-between border-t border-ink/25 font-extrabold tabular-nums ${grande ? 'pt-2 text-base' : 'pt-1 text-[11px]'}`}>
            <span className="inline-flex items-center gap-1">
              <Icon name="swords" size={grande ? 15 : 11} strokeWidth={2.6} className="text-attaque" />
              {card.attack}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="shield" size={grande ? 15 : 11} strokeWidth={2.6} className="text-defense" />
              {card.defense}
            </span>
          </div>
        </div>
      )}
    </>
  )

  const classes = [
    'relative flex flex-col overflow-hidden border-2 border-ink bg-[#14161f] text-left shadow-hard-sm transition-all',
    DIMENSIONS[taille],
    selectionne ? 'ring-4 ring-or -translate-y-2' : '',
    estompe ? 'opacity-40 grayscale' : '',
    onClick && !estompe ? 'cursor-pointer hover:-translate-y-1' : '',
    className,
  ].join(' ')

  if (onClick) {
    return (
      <button type="button" data-role="card" onClick={onClick} disabled={estompe} aria-pressed={selectionne} className={classes}>
        {contenu}
      </button>
    )
  }
  return <div className={classes}>{contenu}</div>
}

/** The back of a card (opponent's hidden hand). */
export function CardBack({ taille = 'xs', className = '' }: { taille?: Taille; className?: string }) {
  return (
    <div
      className={`${DIMENSIONS[taille]} border-2 border-ink bg-[#14161f] shadow-hard-sm ${className}`}
      aria-hidden
    >
      <div className="h-full w-full rounded-md bg-[repeating-linear-gradient(135deg,#2a2d3f_0_6px,#1c1f2d_6px_12px)]" />
    </div>
  )
}
