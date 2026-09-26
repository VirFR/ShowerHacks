import { Link } from 'react-router-dom'
import type { Objet } from '@/types'
import { CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { ObjetImage } from './ObjetImage'

interface ObjetCardProps {
  objet: Objet
  /** If provided, the card becomes a selectable button. Otherwise it links to /item/:id. */
  onSelect?: (objet: Objet) => void
  selectionne?: boolean
  /** Hides the rarity label (dense grid). */
  compact?: boolean
}

/** Item card shared by the inventory, battle and crafting pages. */
export function ObjetCard({ objet, onSelect, selectionne = false, compact = false }: ObjetCardProps) {
  const contenu = (
    <>
      <ObjetImage objet={objet} className="h-20 w-20" />
      <div className="min-w-0 flex-1 text-left">
        <h3 className="truncate font-semibold leading-tight">{objet.nom}</h3>
        {!compact && (
          <p className={`mt-0.5 text-xs ${CLASSE_RARETE[objet.rarete]}`}>{LIBELLE_RARETE[objet.rarete]}</p>
        )}
      </div>
    </>
  )

  const classes = [
    'flex w-full items-center gap-3 rounded-2xl border bg-carte p-3 transition-all',
    selectionne
      ? 'border-accent-2 ring-2 ring-accent/60 shadow-lg shadow-accent/20'
      : 'border-bordure hover:border-accent/60 hover:bg-carte-2',
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
