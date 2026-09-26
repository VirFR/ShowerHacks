import { useState } from 'react'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { useSession } from '@/lib/session'
import { CATEGORIES, type Categorie } from '@/types'
import { libelleCategorie, ORDRE_RARETE } from '@/lib/format'

type Filtre = Categorie | 'toutes'

/** /inventory — Grid of owned items, filterable by category, common first and rarest last. */
export function Inventaire() {
  const { joueur } = useSession()
  const [filtre, setFiltre] = useState<Filtre>('toutes')
  const inventaire = joueur?.inventaire ?? []

  const objets = (filtre === 'toutes' ? inventaire : inventaire.filter((o) => o.categorie === filtre))
    .toSorted((a, b) => ORDRE_RARETE[a.rarete] - ORDRE_RARETE[b.rarete])

  const filtres: { valeur: Filtre; label: string }[] = [
    { valeur: 'toutes', label: 'All' },
    ...CATEGORIES.map((c) => ({ valeur: c, label: libelleCategorie(c) })),
  ]

  if (!joueur) return <ConnexionRequise />

  const total = inventaire.length

  return (
    <>
      <PageHeader
        titre="Inventory"
        sousTitre={`${total} card${total === 1 ? '' : 's'} owned`}
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {filtres.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            aria-pressed={filtre === f.valeur}
            className={filtre === f.valeur ? 'chip-active' : 'chip'}
          >
            {f.label}
          </button>
        ))}
      </div>

      {objets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-bordure p-8 text-center text-texte-2">
          No cards in this category.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {objets.map((objet, i) => (
            <ObjetCard key={`${objet.id}-${i}`} objet={objet} />
          ))}
        </div>
      )}
    </>
  )
}
