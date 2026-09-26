import type { Categorie } from '@/types'
import { classeCategorie, couleurCategorie, libelleCategorie } from '@/lib/format'

interface BadgeCategorieProps {
  categorie: Categorie
  /** Optional label override (e.g. from the chart loaded in the session). */
  label?: string
}

export function BadgeCategorie({ categorie, label }: BadgeCategorieProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${classeCategorie(categorie)}`}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: couleurCategorie(categorie) }}
      />
      {label ?? libelleCategorie(categorie)}
    </span>
  )
}
