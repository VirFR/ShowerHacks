import { ConnexionRequise } from '@/components/ConnexionRequise'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { useSession } from '@/lib/session'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { trouverObjet } from '@/mocks'
import type { Objet } from '@/types'

/** Small ingredient thumbnail used inside a recipe row. */
function Ingredient({ objet }: { objet: Objet }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <ObjetImage objet={objet} className="h-10 w-10" />
      <p className="max-w-[4.5rem] truncate text-[11px] text-texte-2">{objet.nom}</p>
    </div>
  )
}

/** /recipes — Pokédex-style recipe book: discovered crafts are revealed, the rest stay a mystery. */
export function Recettes() {
  const { joueur, livreRecettes } = useSession()

  if (!joueur) return <ConnexionRequise />

  const { total, decouvertes } = livreRecettes
  const verrouillees = Math.max(0, total - decouvertes.length)

  return (
    <>
      <PageHeader
        titre="Recipe Book"
        sousTitre={`${decouvertes.length} / ${total} recipes discovered`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decouvertes.map((recette) => {
          const resultat = trouverObjet(recette.resultatId)
          const [idA, idB] = recette.ingredients
          const ingredientA = trouverObjet(idA)
          const ingredientB = trouverObjet(idB)

          if (!resultat || !ingredientA || !ingredientB) return null

          return (
            <div
              key={recette.resultatId}
              className={`rounded-2xl border bg-carte p-4 ${CLASSE_CARTE_RARETE[resultat.rarete]}`}
            >
              <div className="flex items-center gap-3">
                <ObjetImage objet={resultat} className="h-16 w-16" />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{resultat.nom}</h3>
                  <p className={`text-xs ${CLASSE_RARETE[resultat.rarete]}`}>{LIBELLE_RARETE[resultat.rarete]}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3 border-t border-bordure pt-3">
                <Ingredient objet={ingredientA} />
                <span className="text-lg font-black text-accent-2" aria-hidden>
                  +
                </span>
                <Ingredient objet={ingredientB} />
              </div>
            </div>
          )
        })}

        {Array.from({ length: verrouillees }, (_, i) => (
          <div
            key={`locked-${i}`}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-bordure bg-carte/40 p-4 text-center"
          >
            <span className="text-3xl" aria-hidden>
              🔒
            </span>
            <p className="text-sm font-semibold text-texte-2">???</p>
            <p className="text-xs text-texte-2">
              Pull this card from a booster, or discover the combo by experimenting in Crafting.
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
