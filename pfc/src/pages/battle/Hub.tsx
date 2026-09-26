import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { BoutonConnexion } from '@/components/BoutonConnexion'
import { Carte } from '@/components/Carte'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { BattleCard } from '@/components/battle/BattleCard'
import { versCarte } from '@/lib/combat'
import { beatenBy, categoryLabel, chartCategories, matchup } from '@/lib/engine'
import { useSession } from '@/lib/session'
import { chargerDeck } from '@/services/deck'
import { useLobby } from '@/services/lobby'
import type { Objet } from '@/types'
import { useDemarrerBot } from './useDemarrerBot'

/** /battle — Entry point: ranked duel, practice, your deck. */
export function Hub() {
  const { joueur, chart } = useSession()
  if (!joueur) return <Vitrine chartCount={chartCategories(chart).length} />
  return <HubConnecte />
}

function HubConnecte() {
  const { joueur, chart } = useSession()
  const lobby = useLobby()
  const { demarrer, enCours, erreur } = useDemarrerBot()
  const [deck, setDeck] = useState<Objet[] | null | undefined>(undefined)

  useEffect(() => {
    if (!joueur) return
    let actif = true
    chargerDeck(joueur).then((d) => actif && setDeck(d))
    return () => {
      actif = false
    }
  }, [joueur])

  if (!joueur) return null
  const enLigne = lobby.joueurs.filter((j) => j.enLigne).length
  const cartes = deck?.map(versCarte) ?? []
  const couvre = new Set(cartes.flatMap((c) => chart.beats[c.category] ?? []))
  const faible = chartCategories(chart).filter(
    (cat) => cartes.some((c) => beatenBy(chart, c.category).includes(cat)) && !cartes.some((c) => matchup(chart, c.category, cat) === 'wins'),
  )

  return (
    <>
      <PageHeader
        titre="Battle"
        sousTitre="Gauntlet · 5 cards · the chart decides first, then attack against defense."
        action={
          <span className="inline-flex items-center gap-2 rounded-xl border border-bordure bg-carte px-3 py-2 text-xs text-texte-2">
            <span className={`h-2 w-2 rounded-full ${lobby.enLigne ? 'bg-succes' : 'bg-texte-2'}`} />
            {lobby.enLigne ? `${enLigne} player${enLigne === 1 ? '' : 's'} online` : 'Offline mode'}
          </span>
        }
      />

      {lobby.defisRecus.length > 0 && (
        <Carte className="mb-4 flex items-center gap-4 border-accent/60 bg-accent/10">
          <Icon name="swords" size={22} className="text-accent-2" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">{lobby.defisRecus[0].from.pseudo}</span> wants to fight you.
          </p>
          <Link to="/battle/opponent">
            <Bouton taille="sm">Answer</Bouton>
          </Link>
        </Carte>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/battle/opponent"
          className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-bordure bg-carte p-6 transition-colors hover:border-accent/70 md:col-span-2"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/20 blur-2xl" />
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-2">
            <Icon name="users" size={16} />
            Ranked duel
          </p>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Challenge a player</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-texte-2">
              Live, both of you online. Win points, earn boosters. Cards never leave your inventory.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-colors group-hover:bg-accent-2">
            Find an opponent
            <Icon name="arrowRight" size={16} strokeWidth={2.5} />
          </span>
        </Link>

        <Carte className="flex flex-col justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-texte-2">
            <Icon name="bot" size={16} />
            Practice
          </p>
          <div>
            <h2 className="font-display text-xl font-bold">Fight the Coach</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-texte-2">Half points, no pressure. Good for testing a new deck.</p>
          </div>
          <Bouton variante="secondaire" onClick={demarrer} disabled={enCours}>
            {enCours ? 'Starting…' : 'Start practice'}
          </Bouton>
          {erreur && <p className="text-xs text-echec">{erreur}</p>}
        </Carte>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Carte>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">Your deck</h2>
            <Link to="/battle/deck" className="text-xs font-semibold text-accent-2 hover:underline">
              {deck ? 'Edit deck' : 'Build your deck'}
            </Link>
          </div>
          {deck === undefined ? (
            <p className="mt-4 text-sm text-texte-2">Loading…</p>
          ) : deck ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {cartes.map((c) => (
                  <BattleCard key={c.id} card={c} chart={chart} taille="sm" />
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-texte-2">
                Beats {couvre.size === 0 ? 'nothing yet' : [...couvre].map((c) => categoryLabel(chart, c)).join(', ')}.
                {faible.length > 0 ? ` No answer to ${faible.map((c) => categoryLabel(chart, c)).join(', ')}.` : ' Every category is covered.'}
              </p>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-bordure p-6 text-center text-sm text-texte-2">
              Pick 5 of your {joueur.inventaire.length} card{joueur.inventaire.length === 1 ? '' : 's'} before your first fight.
              <div className="mt-3">
                <Link to="/battle/deck">
                  <Bouton taille="sm">Build your deck</Bouton>
                </Link>
              </div>
            </div>
          )}
        </Carte>

        <Carte>
          <h2 className="font-display font-bold">How a battle works</h2>
          <ol className="mt-3 space-y-2.5 text-sm text-texte-2">
            <Regle n={1}>Both players send a card face down. They flip at the same time.</Regle>
            <Regle n={2}>The chart decides. Neutral matchup? Attack must beat defense to break through.</Regle>
            <Regle n={3}>The loser's card is out. The winner stays on the field, visible, and gains momentum.</Regle>
            <Regle n={4}>Once per battle you may retreat your champion for a hidden card. Bluff wisely.</Regle>
            <Regle n={5}>Out of cards? You lose. A stand-off takes both cards down.</Regle>
          </ol>
        </Carte>
      </div>
    </>
  )
}

function Regle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-carte-2 font-display text-xs font-bold text-texte">{n}</span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}

/** What visitors see before signing in. */
function Vitrine({ chartCount }: { chartCount: number }) {
  return (
    <>
      <PageHeader titre="Battle" sousTitre="Five cards, one champion on the field, no hit points." />
      <Carte className="relative overflow-hidden p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-2">
          <Icon name="swords" size={16} />
          Gauntlet mode
        </p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight md:text-4xl">Your toaster against their cactus. Who wins?</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-texte-2">
          {chartCount} categories in a circular chart, attack and defense for the rest. Send a card, watch the flip, keep your champion or
          bluff with a retreat. Sign in to build a deck and fight live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BoutonConnexion />
          <Link to="/leaderboard">
            <Bouton taille="lg" variante="secondaire">
              See the leaderboard
            </Bouton>
          </Link>
        </div>
      </Carte>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Carte>
          <Icon name="bolt" size={22} className="text-or" />
          <h3 className="mt-3 font-display font-bold">Momentum</h3>
          <p className="mt-1 text-sm text-texte-2">A champion that keeps winning hits harder. Sweeps happen.</p>
        </Carte>
        <Carte>
          <Icon name="undo" size={22} className="text-accent-2" />
          <h3 className="mt-3 font-display font-bold">One retreat</h3>
          <p className="mt-1 text-sm text-texte-2">Swap your visible champion for a hidden card, once. The bluff of the game.</p>
        </Carte>
        <Carte>
          <Icon name="gift" size={22} className="text-succes" />
          <h3 className="mt-3 font-display font-bold">Boosters, not losses</h3>
          <p className="mt-1 text-sm text-texte-2">Every battle pays points. Points become boosters. Nobody loses a card.</p>
        </Carte>
      </div>
    </>
  )
}
