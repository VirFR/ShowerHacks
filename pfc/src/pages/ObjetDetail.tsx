import { Link, useParams } from 'react-router-dom'
import { BadgeCategorie } from '@/components/BadgeCategorie'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { Carte } from '@/components/Carte'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { HISTORIQUE_MOCK, trouverObjet } from '@/mocks'
import { StatBadge } from '@/components/StatBadge'
import { useSession } from '@/lib/session'
import { useLivreRecettes } from '@/services/crafting'
import { estCarteDeBase } from '@/types'
import {
  TEINTE_RARETE,
  CLASSE_RESULTAT,
  formaterDate,
  formaterPourcentage,
  LIBELLE_RARETE,
  LIBELLE_RESULTAT,
} from '@/lib/format'

/** /item/:id — Item detail page. */
export function ObjetDetail() {
  const { id } = useParams<{ id: string }>()
  const objet = trouverObjet(id)
  const { joueur, decouvertes } = useSession()
  const livre = useLivreRecettes()

  if (!objet) {
    return (
      <>
        <PageHeader titre="Card not found" />
        <p className="text-texte-2">No card matches the id “{id}”.</p>
        <Link to="/inventory" className="mt-4 inline-block">
          <Bouton variante="secondaire">Back to inventory</Bouton>
        </Link>
      </>
    )
  }

  const historique = HISTORIQUE_MOCK.filter((h) => h.objetId === objet.id)
  const victoires = historique.filter((h) => h.resultat === 'victoire').length
  const defaites = historique.filter((h) => h.resultat === 'defaite').length
  const egalites = historique.length - victoires - defaites
  const ratio = historique.length ? victoires / historique.length : 0
  const recettes = (livre?.recettes ?? [])
    .filter((r) => r.resultatId === objet.id)
    .map((r) => r.ingredients.map((i) => trouverObjet(i)?.nom ?? i).join(' + '))
  const starter = estCarteDeBase(objet)
  const victoiresExplicites = (objet.victoiresExplicites ?? [])
    .map((id) => trouverObjet(id))
    .filter((o): o is NonNullable<typeof o> => o !== undefined)

  return (
    <>
      <Link to="/inventory" className="mb-3 inline-block text-sm text-accent-2 hover:underline">
        Inventory
      </Link>

      <section
        className="flex flex-col gap-5 rounded-2xl border-2 border-ink bg-[#14161f] p-4 text-white shadow-hard sm:flex-row md:p-5"
      >
        <ObjetImage
          objet={objet}
          className="h-40 w-40 shrink-0 self-center rounded-xl sm:self-start"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">{objet.nom}</h1>
            <BadgeCategorie categorie={objet.categorie} />
          </div>
          <p className="mt-1.5 inline-block rounded-md px-2 py-0.5 font-display text-xs font-bold" style={{ background: TEINTE_RARETE[objet.rarete].badgeFond, color: TEINTE_RARETE[objet.rarete].badgeTexte }}>{LIBELLE_RARETE[objet.rarete]}</p>
          <p className="mt-2 text-sm italic text-white/70">{objet.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatBadge type="attaque" valeur={objet.attaque} taille="md" />
            <StatBadge type="defense" valeur={objet.defense} taille="md" />
          </div>

          {victoiresExplicites.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-succes">Always beats</p>
              <p className="mt-1 text-white/70">{victoiresExplicites.map((o) => o.nom).join(', ')}</p>
            </div>
          )}

          {joueur && (
            <div className="mt-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-accent-2">Recipe</p>
              <p className="mt-1 text-white/70">
                {starter
                  ? 'Base card: infinite, never used up. Everything is crafted from rock, leaf and scissors.'
                  : recettes.length > 0
                    ? recettes.join(' · ')
                    : !livre
                      ? '…'
                      : decouvertes.includes(objet.id)
                      ? 'Booster only: this card can’t be crafted.'
                      : 'Unknown recipe. Craft or win this card to reveal it.'}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/battle/deck">
              <Bouton>
                <Icon name="swords" size={16} />
                Use in battle
              </Bouton>
            </Link>
            <Link to="/crafting">
              <Bouton variante="secondaire">
                <Icon name="flask" size={16} />
                Craft
              </Bouton>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Carte className="text-center">
          <p className="text-3xl font-black text-succes">{victoires}</p>
          <p className="text-xs text-texte-2">Wins</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-3xl font-black text-echec">{defaites}</p>
          <p className="text-xs text-texte-2">Losses</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-3xl font-black">{formaterPourcentage(ratio)}</p>
          <p className="text-xs text-texte-2">Win rate {egalites > 0 && `(${egalites} draw${egalites > 1 ? 's' : ''})`}</p>
        </Carte>
      </div>

      <Carte className="mt-4">
        <h2 className="font-semibold">Battle history</h2>
        {historique.length === 0 ? (
          <p className="mt-3 text-sm text-texte-2">This card hasn’t fought yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-bordure">
            {historique.map((h) => {
              const adverse = trouverObjet(h.objetAdverseId)
              return (
                <li key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">
                      vs <span className="font-medium">{adverse?.nom ?? h.objetAdverseId}</span>{' '}
                      <span className="text-texte-2">({h.adversairePseudo})</span>
                    </p>
                    <p className="text-xs text-texte-2">{formaterDate(h.date)}</p>
                  </div>
                  <span className={`shrink-0 font-semibold ${CLASSE_RESULTAT[h.resultat]}`}>
                    {LIBELLE_RESULTAT[h.resultat]}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Carte>
    </>
  )
}
