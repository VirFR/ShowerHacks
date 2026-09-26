import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { categoryLabel, type Chart, type EngineCard } from '@/lib/engine'
import { CLASSE_RARETE, LIBELLE_RARETE, couleurCategorie } from '@/lib/format'
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
  xs: 'w-10 h-14 rounded-md',
  sm: 'w-28 h-44 rounded-xl',
  md: 'w-36 h-52 rounded-2xl',
  lg: 'w-48 h-[17rem] rounded-2xl md:w-56 md:h-[19.5rem]',
}

/**
 * A card in the arena, the hand or the deck builder. Never renders the
 * emoji fallback: a broken image becomes a category-coloured monogram.
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
  const couleur = couleurCategorie(card.category)
  const petite = taille === 'xs'
  const rarete = card.rarity as Rarete | undefined

  const contenu = (
    <>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${couleur}${selectionne ? '99' : '66'} 0%, #1a1930 62%)` }}
      />
      {!petite && (
        <div className="relative flex items-center justify-between gap-1 px-3 pt-2.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: couleur }}>
          <span className="truncate">{categoryLabel(chart, card.category)}</span>
          {momentum > 0 ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-or px-1.5 py-0.5 text-[10px] font-black text-fond">
              <Icon name="bolt" size={10} strokeWidth={3} />+{momentum}
            </span>
          ) : badge ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-fond/70 px-1.5 py-0.5 text-[9px] font-bold tracking-normal text-texte">{badge}</span>
          ) : rarete && rarete !== 'commun' ? (
            <span className={`text-[10px] font-semibold ${CLASSE_RARETE[rarete]}`}>{LIBELLE_RARETE[rarete]}</span>
          ) : null}
        </div>
      )}
      <div className={`relative flex flex-1 items-center justify-center ${petite ? 'p-1' : 'p-3'}`}>
        {card.imageUrl && !imageKo ? (
          <img
            src={card.imageUrl}
            alt=""
            draggable={false}
            onError={() => setImageKo(true)}
            className={`object-contain drop-shadow-lg ${petite ? 'h-8 w-8 rounded' : taille === 'sm' ? 'h-14 w-14 rounded-lg' : taille === 'md' ? 'h-24 w-24 rounded-xl' : 'h-32 w-32 rounded-2xl md:h-36 md:w-36'}`}
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-xl font-display font-black text-fond ${petite ? 'h-7 w-7 text-sm' : 'h-20 w-20 text-4xl'}`}
            style={{ backgroundColor: couleur }}
          >
            {card.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {!petite && (
        <div className="relative px-3 pb-3">
          <p className={`truncate font-display font-bold ${taille === 'lg' ? 'text-lg' : taille === 'md' ? 'text-sm' : 'text-xs'}`}>{card.name}</p>
          <div className="mt-1.5 flex gap-1.5 text-[11px] font-bold">
            <span className="whitespace-nowrap rounded-md bg-attaque/25 px-1.5 py-0.5 text-rose-200">ATK {card.attack}</span>
            <span className="whitespace-nowrap rounded-md bg-defense/25 px-1.5 py-0.5 text-sky-200">DEF {card.defense}</span>
          </div>
        </div>
      )}
    </>
  )

  const classes = [
    'relative flex flex-col overflow-hidden border text-left transition-all',
    DIMENSIONS[taille],
    selectionne ? 'border-accent-2 ring-2 ring-accent-2 shadow-xl shadow-accent/30 -translate-y-2' : 'border-bordure',
    estompe ? 'opacity-40 grayscale' : '',
    onClick && !estompe ? 'cursor-pointer hover:-translate-y-1 hover:border-texte-2' : '',
    className,
  ].join(' ')

  if (onClick) {
    return (
      <button type="button" data-role="card" onClick={onClick} disabled={estompe} aria-pressed={selectionne} className={classes} style={{ borderColor: selectionne ? undefined : `${couleur}66` }}>
        {contenu}
      </button>
    )
  }
  return (
    <div className={classes} style={{ borderColor: `${couleur}${selectionne ? '' : '66'}` }}>
      {contenu}
    </div>
  )
}

/** The back of a card (opponent's hidden hand). */
export function CardBack({ taille = 'xs', className = '' }: { taille?: Taille; className?: string }) {
  return (
    <div
      className={`${DIMENSIONS[taille]} border border-bordure bg-[repeating-linear-gradient(135deg,#232244_0_6px,#1a1930_6px_12px)] ${className}`}
      aria-hidden
    />
  )
}
