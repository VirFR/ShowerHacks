import { Link } from 'react-router-dom'
import type { Objet } from '@/types'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { BadgeCategorie } from './BadgeCategorie'
import { Icon } from './Icon'
import { ObjetImage } from './ObjetImage'
import { StatBadge } from './StatBadge'

interface ObjetCardProps {
  objet: Objet
  /** If provided, the card becomes a selectable button. Otherwise it links to /item/:id. */
  onSelect?: (objet: Objet) => void
  selectionne?: boolean
  /** Small card for dense grids: name, picture and ATK / DEF only. */
  compact?: boolean
  /** Pins a "New" corner badge: first time the player ever gets this card (booster or craft). */
  nouveau?: boolean
}

/**
 * Trading-card style item card, shared by the inventory, battle, crafting
 * and booster-reveal screens: full name + rarity centered up top, a framed
 * picture in the middle with the category badge overlaid on its top-right
 * corner, and a short description + stats at the bottom. The border,
 * background tint and glow all follow the item's rarity.
 */
export function ObjetCard({ objet, onSelect, selectionne = false, compact = false, nouveau = false }: ObjetCardProps) {
  const badge = nouveau && (
    <span
      className={`pointer-events-none absolute z-10 inline-flex -rotate-6 items-center gap-0.5 animate-booster-pop rounded-md border-2 border-ink bg-or font-extrabold uppercase tracking-wide text-ink shadow-hard ${
        compact ? '-left-2 -top-2 px-1 py-0.5 text-[9px]' : '-left-3 -top-3 px-2 py-1 text-xs'
      }`}
    >
      <Icon name="sparkles" size={compact ? 9 : 12} strokeWidth={3} />
      New
    </span>
  )

  const contenu = (
    <>
      <div className="text-center">
        <h3 className={`font-bold leading-tight ${compact ? 'line-clamp-2 text-[11px]' : 'text-sm'}`}>{objet.nom}</h3>
        {!compact && (
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${CLASSE_RARETE[objet.rarete]}`}>
            {LIBELLE_RARETE[objet.rarete]}
          </p>
        )}
      </div>

      <div
        className={`sticker-bg relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border-2 border-ink/70 ${compact ? 'my-1' : 'my-2'}`}
      >
        <ObjetImage objet={objet} className={`h-full w-full ${compact ? 'p-1' : 'p-2'}`} />
        {!compact && (
          <div className="absolute right-1.5 top-1.5">
            <BadgeCategorie categorie={objet.categorie} />
          </div>
        )}
      </div>

      {!compact && <p className="mb-1.5 line-clamp-2 text-center text-[11px] italic text-texte-2">{objet.description}</p>}

      {compact ? (
        <p className="text-center text-[10px] font-extrabold tabular-nums">
          <span className="text-attaque">{objet.attaque}</span>
          <span className="text-texte-2"> / </span>
          <span className="text-defense">{objet.defense}</span>
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <StatBadge type="attaque" valeur={objet.attaque} />
          <StatBadge type="defense" valeur={objet.defense} />
        </div>
      )}
    </>
  )

  const classes = [
    'relative flex aspect-[3/4] w-full flex-col rounded-xl border-[3px] shadow-hard transition-all',
    compact ? 'p-1.5' : 'p-2.5',
    selectionne ? 'border-ink bg-carte ring-4 ring-or' : CLASSE_CARTE_RARETE[objet.rarete],
  ].join(' ')

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(objet)} aria-pressed={selectionne} className={classes}>
        {badge}
        {contenu}
      </button>
    )
  }

  return (
    <Link to={`/item/${objet.id}`} className={classes}>
      {badge}
      {contenu}
    </Link>
  )
}
