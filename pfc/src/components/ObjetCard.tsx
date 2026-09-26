import { Link } from 'react-router-dom'
import type { Objet } from '@/types'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { BadgeCategorie } from './BadgeCategorie'
import { ObjetImage } from './ObjetImage'
import { StatBadge } from './StatBadge'

interface ObjetCardProps {
  objet: Objet
  /** If provided, the card becomes a selectable button. Otherwise it links to /item/:id. */
  onSelect?: (objet: Objet) => void
  selectionne?: boolean
  /** Hides the rarity label and description (dense grid). */
  compact?: boolean
}

/**
 * Trading-card style item card, shared by the inventory, battle, crafting
 * and booster-reveal screens: full name + rarity centered up top, a framed
 * picture in the middle with the category badge overlaid on its top-right
 * corner, and a short description + stats at the bottom. The border,
 * background tint and glow all follow the item's rarity.
 */
export function ObjetCard({ objet, onSelect, selectionne = false, compact = false }: ObjetCardProps) {
  const contenu = (
    <>
      <div className="text-center">
        <h3 className="text-sm font-bold leading-tight">{objet.nom}</h3>
        {!compact && (
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${CLASSE_RARETE[objet.rarete]}`}>
            {LIBELLE_RARETE[objet.rarete]}
          </p>
        )}
      </div>

      <div className="relative my-2 flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-fond/40 ring-1 ring-black/30">
        <ObjetImage objet={objet} className="h-full w-full object-cover" />
        <div className="absolute right-1.5 top-1.5">
          <BadgeCategorie categorie={objet.categorie} />
        </div>
      </div>

      {!compact && <p className="mb-1.5 line-clamp-2 text-center text-[11px] italic text-texte-2">{objet.description}</p>}

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <StatBadge type="attaque" valeur={objet.attaque} />
        <StatBadge type="defense" valeur={objet.defense} />
      </div>
    </>
  )

  const classes = [
    'flex aspect-[3/4] w-full flex-col rounded-2xl border-4 p-2.5 transition-all',
    selectionne ? 'border-accent-2 ring-4 ring-accent/60 shadow-lg shadow-accent/30' : CLASSE_CARTE_RARETE[objet.rarete],
  ].join(' ')

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(objet)} aria-pressed={selectionne} className={classes}>
        {contenu}
      </button>
    )
  }

  return (
    <Link to={`/item/${objet.id}`} className={classes}>
      {contenu}
    </Link>
  )
}
