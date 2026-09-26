import type { Categorie } from '@/types'
import { CLASSE_CATEGORIE, ICONE_CATEGORIE, LIBELLE_CATEGORIE } from '@/lib/format'

interface BadgeCategorieProps {
  categorie: Categorie
}

export function BadgeCategorie({ categorie }: BadgeCategorieProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${CLASSE_CATEGORIE[categorie]}`}
    >
      <span aria-hidden>{ICONE_CATEGORIE[categorie]}</span>
      {LIBELLE_CATEGORIE[categorie]}
    </span>
  )
}
