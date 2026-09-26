import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ModeVue, Pile } from '@/lib/inventaire'
import { estCarteDeBase } from '@/types'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { BadgeCategorie } from './BadgeCategorie'
import { Icon } from './Icon'
import { ObjetCard } from './ObjetCard'
import { ObjetImage } from './ObjetImage'
import { StatBadge } from './StatBadge'

/** Two-button grid / list switch. */
export function ChoixVue({ mode, onChange }: { mode: ModeVue; onChange: (m: ModeVue) => void }) {
  const options: { valeur: ModeVue; icone: 'grid' | 'list'; label: string }[] = [
    { valeur: 'grille', icone: 'grid', label: 'Grid view' },
    { valeur: 'liste', icone: 'list', label: 'List view' },
  ]
  return (
    <div className="flex gap-1" role="group" aria-label="Display">
      {options.map((o) => (
        <button
          key={o.valeur}
          type="button"
          onClick={() => onChange(o.valeur)}
          aria-pressed={mode === o.valeur}
          aria-label={o.label}
          title={o.label}
          className={mode === o.valeur ? 'chip-active !px-2' : 'chip !px-2'}
        >
          <Icon name={o.icone} size={16} />
        </button>
      ))}
    </div>
  )
}

interface LigneProps {
  pile: Pile
  selectionne?: boolean
  onSelect?: () => void
}

/** Copy count label: base cards are infinite. */
const quantite = (pile: Pile) => (estCarteDeBase(pile.objet) ? '∞' : `×${pile.copies.length}`)

/** One compact row of the list view: small picture, name, rarity, category, stats, count. */
function Ligne({ pile, selectionne = false, onSelect }: LigneProps) {
  const { objet } = pile
  const contenu = (
    <>
      <ObjetImage objet={objet} className="h-9 w-9 shrink-0" />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-bold leading-tight">{objet.nom}</p>
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${CLASSE_RARETE[objet.rarete]}`}>
          {LIBELLE_RARETE[objet.rarete]}
        </p>
      </div>
      <div className="hidden sm:block">
        <BadgeCategorie categorie={objet.categorie} />
      </div>
      <div className="flex shrink-0 gap-1">
        <StatBadge type="attaque" valeur={objet.attaque} />
        <StatBadge type="defense" valeur={objet.defense} />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-extrabold tabular-nums">{quantite(pile)}</span>
    </>
  )
  const classes = [
    'flex w-full items-center gap-3 rounded-lg border-2 px-2 py-1.5 transition-all',
    selectionne ? 'border-ink bg-carte ring-4 ring-or' : CLASSE_CARTE_RARETE[objet.rarete],
  ].join(' ')

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={selectionne} className={classes}>
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

interface InventaireVueProps {
  piles: Pile[]
  mode: ModeVue
  estSelectionne?: (pile: Pile) => boolean
  onSelect?: (pile: Pile) => void
  onDragStart?: (e: DragEvent, pile: Pile) => void
}

/** Inventory as a dense grid of small cards or as a list, one entry per item with its copy count. */
export function InventaireVue({ piles, mode, estSelectionne, onSelect, onDragStart }: InventaireVueProps) {
  const glisser = (pile: Pile) =>
    onDragStart ? { draggable: true, onDragStart: (e: DragEvent) => onDragStart(e, pile) } : {}
  const curseur = onDragStart ? 'cursor-grab active:cursor-grabbing' : ''

  if (mode === 'liste') {
    return (
      <ul className="flex flex-col gap-1.5">
        {piles.map((pile) => (
          <li key={pile.objet.id} className={curseur} {...glisser(pile)}>
            <Ligne
              pile={pile}
              selectionne={estSelectionne?.(pile)}
              onSelect={onSelect && (() => onSelect(pile))}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {piles.map((pile) => (
        <div key={pile.objet.id} className={`relative ${curseur}`} {...glisser(pile)}>
          <ObjetCard
            objet={pile.objet}
            compact
            selectionne={estSelectionne?.(pile)}
            onSelect={onSelect && (() => onSelect(pile))}
          />
          {(pile.copies.length > 1 || estCarteDeBase(pile.objet)) && (
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 rounded-full border-2 border-ink bg-or px-1.5 text-xs font-extrabold tabular-nums text-ink">
              {quantite(pile)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
