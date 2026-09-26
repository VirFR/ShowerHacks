import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { CarteRang } from '@/components/CarteRang'
import { PageHeader } from '@/components/PageHeader'
import { GoogleMark, Icon } from '@/components/Icon'
import { BOOSTERS_MOCK } from '@/mocks'
import { useSession } from '@/lib/session'

/** /home — Lobby: Play button, booster preview, rank preview. */
export function Accueil() {
  const { joueur } = useSession()
  const boosters = BOOSTERS_MOCK

  if (!joueur) return <Landing />

  return (
    <>
      <PageHeader titre={`Hey, ${joueur.pseudo}`} sousTitre="Ready for a duel?" />

      <Carte className="relative overflow-hidden bg-gradient-to-br from-accent/30 via-carte to-carte">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <p className="text-sm uppercase tracking-widest text-accent-2">Gauntlet</p>
        <h2 className="mt-1 font-display text-2xl font-bold">Five cards, one champion, no hit points</h2>
        <p className="mt-2 max-w-md text-sm text-texte-2">
          Build a deck of five cards, challenge a player or the Coach, and climb the leaderboard.
        </p>
        <Link to="/battle" className="mt-5 inline-block">
          <Bouton taille="lg">
            <Icon name="play" size={18} />
            Play
          </Bouton>
        </Link>
      </Carte>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Carte>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Boosters</h2>
            <Link to="/boosters" className="text-xs text-accent-2 hover:underline">
              View stack →
            </Link>
          </div>
          <p className="mt-3 text-4xl font-black tabular-nums">
            {boosters.actuel}
            <span className="text-lg font-semibold text-texte-2"> / {boosters.max}</span>
          </p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-fond"
            role="progressbar"
            aria-valuenow={boosters.actuel}
            aria-valuemin={0}
            aria-valuemax={boosters.max}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
              style={{ width: `${(boosters.actuel / boosters.max) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-texte-2">+1 booster every 10 min</p>
        </Carte>

        <Carte>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your rank</h2>
            <Link to="/leaderboard" className="text-xs text-accent-2 hover:underline">
              Leaderboard →
            </Link>
          </div>
          <div className="mt-3">
            <CarteRang rang={joueur.rang} score={joueur.score} />
          </div>
          <p className="mt-3 text-xs text-texte-2">
            {joueur.nbVictoires} wins out of {joueur.nbParties} games
          </p>
        </Carte>
      </div>
    </>
  )
}

/** Public landing for visitors: browse freely, sign in to play. */
function Landing() {
  const { connecterGoogle } = useSession()
  return (
    <>
      <PageHeader titre="PFC" sousTitre="Objects at war. Rock-paper-scissors, evolved." />
      <Carte className="relative overflow-hidden p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight md:text-4xl">Collect odd objects. Fight with five of them.</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-texte-2">
          Every object has a category and two numbers. The category chart decides most clashes, attack against defense settles the rest.
          Open boosters, craft, build a deck, and duel live. Nobody ever loses a card.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Bouton taille="lg" onClick={() => connecterGoogle()} variante="clair">
            <GoogleMark />
            Continue with Google
          </Bouton>
          <Link to="/battle">
            <Bouton taille="lg" variante="secondaire">
              How battles work
            </Bouton>
          </Link>
        </div>
      </Carte>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { icone: 'gift' as const, titre: 'Boosters', texte: 'A new one every 10 minutes, five cards inside.' },
          { icone: 'flask' as const, titre: 'Crafting', texte: 'Combine two objects into something stranger.' },
          { icone: 'trophy' as const, titre: 'Leaderboard', texte: 'Points from every battle, six ranks to climb.' },
        ].map((c) => (
          <Carte key={c.titre}>
            <Icon name={c.icone} size={22} className="text-accent-2" />
            <h3 className="mt-3 font-display font-bold">{c.titre}</h3>
            <p className="mt-1 text-sm text-texte-2">{c.texte}</p>
          </Carte>
        ))}
      </div>
    </>
  )
}
