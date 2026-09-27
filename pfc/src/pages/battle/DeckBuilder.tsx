import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { BattleCard } from '@/components/battle/BattleCard'
import { CategoryCircleModal } from '@/components/battle/CategoryCircleModal'
import { versCarte } from '@/lib/combat'
import { DECK_SIZE, beatenBy, categoryLabel, chartCategories, matchup } from '@/lib/engine'
import { couleurCategorie, libelleCategorie } from '@/lib/format'
import { trierInventaire } from '@/lib/inventaire'
import { useSession } from '@/lib/session'
import { battleService } from '@/services/battle'
import { mucheBattleService } from '@/services/battle/mouche'
import { chargerDeckIds, sauverDeckIds } from '@/services/deck'
import type { Objet } from '@/types'

/** /battle/deck — Pick the five cards you fight with. */
export function DeckBuilder() {
  const { joueur } = useSession()
  if (!joueur) return <ConnexionRequise />
  return <Builder key={joueur.id} />
}

function Builder() {
  const { joueur, chart } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [ids, setIds] = useState<string[]>([])
  const [filtre, setFiltre] = useState<string>('toutes')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [circleOuvert, setCircleOuvert] = useState(false)

  const inventaire = joueur!.inventaire
  const cleDe = (o: Objet) => o.inventaireId ?? o.id

  useEffect(() => {
    chargerDeckIds(joueur!.id).then((saved) => {
      const valides = saved.filter((id) => inventaire.some((o) => cleDe(o) === id))
      setIds(valides)
    })
  }, [joueur, inventaire])

  const parId = useMemo(() => new Map(inventaire.map((o) => [cleDe(o), o])), [inventaire])
  const deck = ids.map((id) => parId.get(id)).filter((o): o is Objet => Boolean(o))
  const cartes = deck.map(versCarte)
  const categories = chartCategories(chart)
  const couvre = new Set(cartes.flatMap((c) => chart.beats[c.category] ?? []))
  const faible = categories.filter(
    (cat) => cartes.some((c) => beatenBy(chart, c.category).includes(cat)) && !cartes.some((c) => matchup(chart, c.category, cat) === 'wins'),
  )
  const complet = deck.length === DECK_SIZE

  const basculer = (o: Objet) => {
    const id = cleDe(o)
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < DECK_SIZE ? [...prev, id] : prev))
  }

  const sauver = async () => {
    if (!complet) return
    setSauvegarde(true)
    setErreur(null)
    try {
      await sauverDeckIds(joueur!.id, ids)
      const next = params.get('next')
      if (next === 'bot') {
        const id = await battleService.creerContreBot(joueur!, deck, chart)
        navigate(`/battle/${id}`)
      } else if (next === 'mouche') {
        const id = await mucheBattleService.creerCombat(joueur!, deck, chart)
        navigate(`/battle/${id}`)
      } else {
        navigate('/battle/opponent')
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Could not save the deck.')
    } finally {
      setSauvegarde(false)
    }
  }

  const visibles = trierInventaire(filtre === 'toutes' ? inventaire : inventaire.filter((o) => o.categorie === filtre))
  const categoriesInventaire = [...new Set(inventaire.map((o) => o.categorie))]

  return (
    <>
      <Link to="/battle" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-2 hover:underline">
        <Icon name="arrowLeft" size={16} />
        Back to battle
      </Link>
      <PageHeader
        titre="Build your deck"
        sousTitre={`Pick ${DECK_SIZE} cards. Fighting points decide first, then attack, defense and rarity.`}
        action={
          <Bouton onClick={sauver} disabled={!complet || sauvegarde}>
            {sauvegarde
              ? 'Saving…'
              : params.get('next') === 'bot'
                ? 'Save · Fight the Coach'
                : params.get('next') === 'mouche'
                  ? 'Save · Fight La Mouche'
                  : 'Save · Choose opponent'}
            <Icon name="arrowRight" size={16} strokeWidth={2.5} />
          </Bouton>
        }
      />
      {erreur && <p className="mb-4 text-sm text-echec">{erreur}</p>}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: DECK_SIZE }).map((_, i) => {
            const c = cartes[i]
            return c ? (
              <BattleCard key={c.id} card={c} chart={chart} taille="sm" badge={`${i + 1}`} onClick={() => basculer(deck[i])} />
            ) : (
              <div key={`vide-${i}`} className="flex h-44 w-28 items-center justify-center rounded-xl border-2 border-dashed border-bordure p-3 text-center text-xs text-texte-2">
                Slot {i + 1}
                <br />
                pick a card below
              </div>
            )
          })}
        </div>
        <Carte>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold">Coverage</h2>
            <Bouton taille="sm" variante="secondaire" onClick={() => setCircleOuvert(true)}>
              <Icon name="grid" size={14} />
              Category circle
            </Bouton>
          </div>
          <dl className="mt-3 flex flex-col gap-2 text-sm md:flex-row md:gap-8">
            <div className="flex flex-wrap items-center gap-2">
              <dt className="w-16 text-texte-2">Beats</dt>
              <dd className="flex flex-wrap gap-1.5">
                {couvre.size === 0 ? <span className="text-texte-2">nothing yet</span> : [...couvre].map((c) => <Pastille key={c} categorie={c} />)}
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="w-16 text-texte-2">Weak to</dt>
              <dd className="flex flex-wrap gap-1.5">
                {cartes.length === 0 ? <span className="text-texte-2">—</span> : faible.length === 0 ? <span className="text-succes">nothing, every category is answered</span> : faible.map((c) => <Pastille key={c} categorie={c} />)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-texte-2">
            {deck.length}/{DECK_SIZE} cards. Spread your categories: the opponent sees your champion and will counter it.
          </p>
        </Carte>
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-bold">
          Inventory · {inventaire.length} card{inventaire.length === 1 ? '' : 's'}
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[{ v: 'toutes', l: 'All' }, ...categoriesInventaire.map((c) => ({ v: c, l: libelleCategorie(c) }))].map((f) => (
            <button
              key={f.v}
              type="button"
              onClick={() => setFiltre(f.v)}
              aria-pressed={filtre === f.v}
              className={filtre === f.v ? 'chip-active text-xs' : 'chip text-xs'}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>
      {inventaire.length < DECK_SIZE && (
        <p className="mb-3 rounded-lg border-2 border-amber-500 bg-amber-100 p-3 text-sm font-semibold text-amber-900">
          You need at least {DECK_SIZE} cards. Open a booster first.
        </p>
      )}
      <div className="flex flex-wrap gap-3" data-section="inventory">
        {visibles.map((o) => {
          const id = cleDe(o)
          const dedans = ids.includes(id)
          return (
            <BattleCard
              key={id}
              card={versCarte(o)}
              chart={chart}
              taille="sm"
              selectionne={dedans}
              estompe={!dedans && complet}
              badge={dedans ? 'deck' : undefined}
              onClick={() => basculer(o)}
            />
          )
        })}
      </div>
      {circleOuvert && <CategoryCircleModal chart={chart} onClose={() => setCircleOuvert(false)} />}
    </>
  )
}

function Pastille({ categorie }: { categorie: string }) {
  const { chart } = useSession()
  const couleur = couleurCategorie(categorie)
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${couleur}22`, color: couleur }}>
      {categoryLabel(chart, categorie)}
    </span>
  )
}
