import { Link } from 'react-router-dom'
import type { Objet } from '@/types'
import {
  LETTRE_RARETE,
  LIBELLE_RARETE,
  libelleCategorie,
  styleArtCategorie,
  stylePanneauRarete,
  TEINTE_RARETE,
} from '@/lib/format'
import { Icon } from './Icon'
import { ObjetImage } from './ObjetImage'

interface ObjetCardProps {
  objet: Objet
  /** If provided, the card becomes a selectable button. Otherwise it links to /item/:id. */
  onSelect?: (objet: Objet) => void
  selectionne?: boolean
  /** Small card for dense grids: picture, name and ATK / DEF only. */
  compact?: boolean
}

/**
 * Trading card shared by the inventory, crafting, profile and booster
 * screens. Dark body; full-bleed art on the category gradient with the
 * rarity letter in the corner; an info panel tinted by rarity with the
 * name, flavor text and the attack / defense row; a footer with category
 * and rarity.
 */
export function ObjetCard({ objet, onSelect, selectionne = false, compact = false }: ObjetCardProps) {
  const teinte = TEINTE_RARETE[objet.rarete]

  const contenu = (
    <>
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-t-xl ${compact ? 'h-[54%]' : 'h-[50%]'}`}
        style={styleArtCategorie(objet.categorie)}
      >
        <ObjetImage objet={objet} variante="nu" className="h-full w-full" />
        <span
          className={`absolute left-2 top-2 rounded-md font-display font-bold leading-none ${compact ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1 text-xs'}`}
          style={{ background: teinte.badgeFond, color: teinte.badgeTexte }}
        >
          {LETTRE_RARETE[objet.rarete]}
        </span>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col rounded-b-xl text-ink ${compact ? 'px-2 pb-1.5 pt-1.5' : 'px-3 pb-2.5 pt-3'}`} style={stylePanneauRarete(objet.rarete)}>
        <h3 className={`font-display font-bold leading-tight ${compact ? 'line-clamp-2 text-[11px]' : 'text-base'}`}>{objet.nom}</h3>
        {!compact && <p className="mt-1 line-clamp-2 min-h-[2.4em] text-[11.5px] font-semibold leading-snug opacity-80">{objet.description}</p>}
        <div className={`mt-auto border-t border-ink/25 ${compact ? 'pt-1' : 'pt-2'}`}>
          <div className={`flex items-center justify-between font-extrabold tabular-nums ${compact ? 'text-[11px]' : 'text-base'}`}>
            <span className="inline-flex items-center gap-1" title="Attack">
              <Icon name="swords" size={compact ? 11 : 15} strokeWidth={2.6} className="text-attaque" />
              {objet.attaque}
            </span>
            <span className="inline-flex items-center gap-1" title="Defense">
              <Icon name="shield" size={compact ? 11 : 15} strokeWidth={2.6} className="text-defense" />
              {objet.defense}
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex items-end justify-between px-1.5 pb-0.5 pt-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a93ab]">
          <div>
            Category
            <b className="mt-0.5 block text-sm normal-case tracking-normal text-white">{libelleCategorie(objet.categorie)}</b>
          </div>
          <div className="text-right">
            Rarity
            <b className="mt-0.5 block text-sm normal-case tracking-normal text-white">{LIBELLE_RARETE[objet.rarete]}</b>
          </div>
        </div>
      )}
    </>
  )

  const classes = [
    'flex w-full flex-col rounded-2xl border-2 border-ink bg-[#14161f] text-left shadow-hard transition-all',
    compact ? 'aspect-[3/4] p-1.5' : 'aspect-[5/8] p-2',
    selectionne ? 'ring-4 ring-or -translate-y-1' : onSelect ? 'hover:-translate-y-1' : 'hover:-translate-y-0.5',
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
