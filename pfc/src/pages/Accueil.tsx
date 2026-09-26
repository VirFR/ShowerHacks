import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { CarteRang } from '@/components/CarteRang'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { BOOSTERS_MOCK } from '@/mocks'
import { useSession } from '@/lib/session'

/** /home — Lobby: Play button, booster preview, rank preview. */
export function Accueil() {
  const { joueur } = useSession()
  const boosters = BOOSTERS_MOCK

  if (!joueur) return <ConnexionRequise />

  return (
    <>
      <PageHeader titre={`Hey, ${joueur.pseudo} 👋`} sousTitre="Ready for a duel?" />

      <Carte className="relative overflow-hidden bg-gradient-to-br from-accent/30 via-carte to-carte">
        <div className="pointer-events-none absolute -right-6 -top-6 text-[10rem] opacity-10 select-none">
          ✊✋✌️
        </div>
        <p className="text-sm uppercase tracking-widest text-accent-2">Quick match</p>
        <h2 className="mt-1 text-2xl font-bold">Face a random opponent</h2>
        <p className="mt-2 max-w-md text-sm text-texte-2">
          Pick a card from your inventory, attack, and climb the leaderboard.
        </p>
        <Link to="/battle" className="mt-5 inline-block">
          <Bouton taille="lg">▶ Play</Bouton>
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
