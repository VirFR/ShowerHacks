import { Link, useParams } from 'react-router-dom'
import { BadgeCategorie } from '@/components/BadgeCategorie'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { StatBadge } from '@/components/StatBadge'
import { HISTORIQUE_MOCK, trouverObjet } from '@/mocks'
import {
  CLASSE_RARETE,
  CLASSE_RESULTAT,
  formaterDate,
  formaterPourcentage,
  LIBELLE_RARETE,
  LIBELLE_RESULTAT,
} from '@/lib/format'

/** /objet/:id — Fiche détail d'un objet. */
export function ObjetDetail() {
  const { id } = useParams<{ id: string }>()
  const objet = trouverObjet(id)

  if (!objet) {
    return (
      <>
        <PageHeader titre="Objet introuvable" />
        <p className="text-texte-2">Aucun objet ne correspond à l’identifiant « {id} ».</p>
        <Link to="/inventaire" className="mt-4 inline-block">
          <Bouton variante="secondaire">← Retour à l’inventaire</Bouton>
        </Link>
      </>
    )
  }

  const historique = HISTORIQUE_MOCK.filter((h) => h.objetId === objet.id)
  const victoires = historique.filter((h) => h.resultat === 'victoire').length
  const defaites = historique.filter((h) => h.resultat === 'defaite').length
  const egalites = historique.length - victoires - defaites
  const ratio = historique.length ? victoires / historique.length : 0

  return (
    <>
      <Link to="/inventaire" className="mb-3 inline-block text-sm text-accent-2 hover:underline">
        ← Inventaire
      </Link>

      <Carte className="flex flex-col gap-5 sm:flex-row">
        <ObjetImage objet={objet} className="h-40 w-40 shrink-0 self-center sm:self-start" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">{objet.nom}</h1>
            <BadgeCategorie categorie={objet.categorie} />
          </div>
          <p className={`mt-1 text-sm font-medium ${CLASSE_RARETE[objet.rarete]}`}>{LIBELLE_RARETE[objet.rarete]}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatBadge type="attaque" valeur={objet.attaque} taille="md" />
            <StatBadge type="defense" valeur={objet.defense} taille="md" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/combat">
              <Bouton>⚔️ Utiliser en combat</Bouton>
            </Link>
            <Link to="/assemblage">
              <Bouton variante="secondaire">🧪 Assembler</Bouton>
            </Link>
          </div>
        </div>
      </Carte>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Carte className="text-center">
          <p className="text-3xl font-black text-succes">{victoires}</p>
          <p className="text-xs text-texte-2">Victoires</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-3xl font-black text-echec">{defaites}</p>
          <p className="text-xs text-texte-2">Défaites</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-3xl font-black">{formaterPourcentage(ratio)}</p>
          <p className="text-xs text-texte-2">Ratio {egalites > 0 && `(${egalites} égalité${egalites > 1 ? 's' : ''})`}</p>
        </Carte>
      </div>

      <Carte className="mt-4">
        <h2 className="font-semibold">Historique des combats</h2>
        {historique.length === 0 ? (
          <p className="mt-3 text-sm text-texte-2">Cet objet n’a pas encore combattu.</p>
        ) : (
          <ul className="mt-3 divide-y divide-bordure">
            {historique.map((h) => {
              const adverse = trouverObjet(h.objetAdverseId)
              return (
                <li key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate">
                      contre <span className="font-medium">{adverse?.nom ?? h.objetAdverseId}</span>{' '}
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
