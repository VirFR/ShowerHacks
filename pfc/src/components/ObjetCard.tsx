import { Link } from 'react-router-dom'
import type { Objet } from '@/types'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { BadgeCategorie } from './BadgeCategorie'
import { ObjetImage } from './ObjetImage'
import { StatBadge } from './StatBadge'

interface ObjetCardProps {
  objet: Objet
  /** Si fourni, la carte devient un bouton sélectionnable. Sinon, un lien vers /objet/:id. */
  onSelect?: (objet: Objet) => void
  selectionne?: boolean
  /** Masque le libellé de rareté et la description (grille dense). */
  compact?: boolean
}

/** Carte d'objet réutilisée par l'inventaire, le combat et l'assemblage. */
export function ObjetCard({ objet, onSelect, selectionne = false, compact = false }: ObjetCardProps) {
  const contenu = (
    <>
      <ObjetImage objet={objet} className="h-20 w-20" />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-tight">{objet.nom}</h3>
        </div>
        {!compact && (
          <p className={`mt-0.5 text-xs ${CLASSE_RARETE[objet.rarete]}`}>{LIBELLE_RARETE[objet.rarete]}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatBadge type="attaque" valeur={objet.attaque} />
          <StatBadge type="defense" valeur={objet.defense} />
        </div>
        <div className="mt-2">
          <BadgeCategorie categorie={objet.categorie} />
        </div>
      </div>
    </>
  )

  const classes = [
    'flex w-full gap-3 rounded-2xl border bg-carte p-3 transition-all hover:bg-carte-2',
    selectionne
      ? 'border-accent-2 ring-2 ring-accent/60 shadow-lg shadow-accent/20'
      : CLASSE_CARTE_RARETE[objet.rarete],
  ].join(' ')

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(objet)} aria-pressed={selectionne} className={classes}>
        {contenu}
      </button>
    )
  }

  return (
    <Link to={`/objet/${objet.id}`} className={classes}>
      {contenu}
    </Link>
  )
}
