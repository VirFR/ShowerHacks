import { useState } from 'react'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { useSession } from '@/lib/session'
import { CATEGORIES, type Categorie } from '@/types'
import { ICONE_CATEGORIE, LIBELLE_CATEGORIE } from '@/lib/format'

type Filtre = Categorie | 'toutes'

/** /inventaire — Grille des objets possédés, filtrable par catégorie. */
export function Inventaire() {
  const { joueur } = useSession()
  const [filtre, setFiltre] = useState<Filtre>('toutes')
  const inventaire = joueur?.inventaire ?? []

  const objets = filtre === 'toutes' ? inventaire : inventaire.filter((o) => o.categorie === filtre)

  const filtres: { valeur: Filtre; label: string }[] = [
    { valeur: 'toutes', label: 'Toutes' },
    ...CATEGORIES.map((c) => ({ valeur: c, label: `${ICONE_CATEGORIE[c]} ${LIBELLE_CATEGORIE[c]}` })),
  ]

  if (!joueur) return <ConnexionRequise />

  return (
    <>
      <PageHeader
        titre="Inventaire"
        sousTitre={`${inventaire.length} objets possédés`}
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {filtres.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            aria-pressed={filtre === f.valeur}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              filtre === f.valeur
                ? 'bg-accent text-white'
                : 'bg-carte text-texte-2 ring-1 ring-bordure hover:text-texte',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {objets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-bordure p-8 text-center text-texte-2">
          Aucun objet dans cette catégorie.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {objets.map((objet) => (
            <ObjetCard key={objet.id} objet={objet} />
          ))}
        </div>
      )}
    </>
  )
}
