import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { Icon } from '@/components/Icon'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { useSession } from '@/lib/session'
import { CLASSE_CARTE_RARETE, CLASSE_RARETE, LIBELLE_RARETE } from '@/lib/format'
import { trouverObjet } from '@/mocks'
import { useLivreRecettes } from '@/services/crafting'
import type { Objet, Recette } from '@/types'

/** Small ingredient thumbnail used inside a recipe row. */
function Ingredient({ objet }: { objet: Objet }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <ObjetImage objet={objet} className="h-10 w-10" />
      <p className="max-w-[4.5rem] truncate text-[11px] text-texte-2">{objet.nom}</p>
    </div>
  )
}

/**
 * /recipes — Pokédex-style recipe book. Only the recipes of cards the player
 * has owned at least once reach the client; the rest are locked tiles.
 * Compact card grid (as in Crafting); clicking a card expands its recipes.
 */
export function Recettes() {
  const { joueur } = useSession()
  const livre = useLivreRecettes()
  const [ouvert, setOuvert] = useState<string | null>(null)

  if (!joueur) return <ConnexionRequise />

  // A card can have several recipes: one tile per card, listing all of them.
  const parResultat = new Map<string, Recette[]>()
  for (const r of livre?.recettes ?? []) parResultat.set(r.resultatId, [...(parResultat.get(r.resultatId) ?? []), r])
  const connues = [...parResultat.entries()]
  const total = livre?.total ?? 0
  const verrouillees = Math.max(0, total - connues.length)

  return (
    <>
      <PageHeader
        titre="Recipe Book"
        sousTitre={livre ? `${connues.length} / ${total} craftable cards discovered` : 'Loading…'}
      />

      <div className="grid grid-flow-row-dense grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {connues.map(([resultatId, recettes]) => {
          const resultat = trouverObjet(resultatId)
          if (!resultat) return null
          const estOuvert = ouvert === resultatId

          return (
            <Fragment key={resultatId}>
              <ObjetCard
                objet={resultat}
                compact
                selectionne={estOuvert}
                onSelect={() => setOuvert(estOuvert ? null : resultatId)}
              />
              {estOuvert && (
                <div
                  className={`animate-booster-pop col-span-full rounded-xl border-[3px] bg-carte p-4 shadow-hard ${CLASSE_CARTE_RARETE[resultat.rarete]}`}
                >
                  <div className="flex items-center gap-3">
                    <ObjetImage objet={resultat} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{resultat.nom}</h3>
                      <p className={`text-xs ${CLASSE_RARETE[resultat.rarete]}`}>{LIBELLE_RARETE[resultat.rarete]}</p>
                    </div>
                    <Link to={`/item/${resultat.id}`} className="shrink-0 text-xs font-semibold text-accent-2 hover:underline">
                      View card
                    </Link>
                  </div>

                  {recettes.map((recette) => {
                    const [ingredientA, ingredientB] = recette.ingredients.map((id) => trouverObjet(id))
                    if (!ingredientA || !ingredientB) return null
                    return (
                      <div
                        key={recette.ingredients.join('+')}
                        className="mt-3 flex items-center justify-center gap-3 border-t border-bordure pt-3"
                      >
                        <Ingredient objet={ingredientA} />
                        <span className="text-lg font-black text-accent-2" aria-hidden>
                          +
                        </span>
                        <Ingredient objet={ingredientB} />
                        <span className="text-lg font-black text-accent-2" aria-hidden>
                          =
                        </span>
                        <Ingredient objet={resultat} />
                      </div>
                    )
                  })}
                </div>
              )}
            </Fragment>
          )
        })}

        {Array.from({ length: verrouillees }, (_, i) => (
          <div
            key={`verrou-${i}`}
            title="Pull this card from a booster, or discover the combo by experimenting in Crafting."
            className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-bordure bg-carte/60 text-center"
          >
            <Icon name="lock" size={22} className="text-texte-2" />
            <p className="text-xs font-semibold text-texte-2">???</p>
          </div>
        ))}
      </div>
      {verrouillees > 0 && (
        <p className="mt-3 text-xs text-texte-2">
          Locked cards: pull them from a booster, or discover the combo by experimenting in Crafting.
        </p>
      )}
    </>
  )
}
