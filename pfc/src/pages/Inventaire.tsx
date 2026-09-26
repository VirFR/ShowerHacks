import { useState } from 'react'
import { ChoixVue, InventaireVue } from '@/components/InventaireVue'
import { empiler, trierInventaire, useModeVue } from '@/lib/inventaire'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { useSession } from '@/lib/session'
import { CATEGORIES, type Categorie } from '@/types'
import { libelleCategorie } from '@/lib/format'

type Filtre = Categorie | 'toutes'

/** /inventory — Owned items as a grid or a list, filterable by category, rock, leaf and scissors first, then common to rarest. */
export function Inventaire() {
  const { joueur } = useSession()
  const [filtre, setFiltre] = useState<Filtre>('toutes')
  const [mode, setMode] = useModeVue()
  const inventaire = joueur?.inventaire ?? []

  const objets = trierInventaire(filtre === 'toutes' ? inventaire : inventaire.filter((o) => o.categorie === filtre))

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

      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
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
        <ChoixVue mode={mode} onChange={setMode} />
      </div>

      {objets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-bordure p-8 text-center text-texte-2">
          No cards in this category.
        </p>
      ) : (
        <InventaireVue piles={empiler(objets)} mode={mode} />
      )}
    </>
  )
}
