import { useState } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { CarteRang } from '@/components/CarteRang'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { CLASSEMENT_MOCK, JOUEUR_COURANT } from '@/mocks'
import { formaterPourcentage, ORDRE_RARETE } from '@/lib/format'

/** /profile — Player profile card + "Challenge a friend" button. */
export function Profil() {
  const joueur = JOUEUR_COURANT
  const [defiEnvoye, setDefiEnvoye] = useState(false)

  const position = CLASSEMENT_MOCK.find((e) => e.joueurId === joueur.id)?.position
  const ratio = joueur.nbParties ? joueur.nbVictoires / joueur.nbParties : 0
  // Rarest items first.
  const meilleursObjets = [...joueur.inventaire]
    .sort((a, b) => ORDRE_RARETE[b.rarete] - ORDRE_RARETE[a.rarete])
    .slice(0, 3)

  const defier = () => {
    // Mock: to be wired to a real invitation system (link / notification).
    setDefiEnvoye(true)
    window.setTimeout(() => setDefiEnvoye(false), 2500)
  }

  return (
    <>
      <PageHeader titre="Profile" />

      <Carte className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-defense text-4xl font-black text-white shadow-lg">
          {joueur.pseudo.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{joueur.pseudo}</h2>
          <p className="text-sm text-texte-2">
            {position ? `#${position} on the leaderboard · ` : ''}
            {joueur.nbParties} games · {formaterPourcentage(ratio)} win rate
          </p>
          <div className="mt-4">
            <CarteRang rang={joueur.rang} score={joueur.score} taille="lg" />
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Bouton onClick={defier} disabled={defiEnvoye}>
            {defiEnvoye ? '✅ Challenge sent (mock)' : '🤝 Challenge a friend'}
          </Bouton>
          <Bouton variante="secondaire" taille="sm" disabled title="Auth coming soon">
            Edit profile
          </Bouton>
        </div>
      </Carte>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums">{joueur.inventaire.length}</p>
          <p className="text-xs text-texte-2">Items</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums text-succes">{joueur.nbVictoires}</p>
          <p className="text-xs text-texte-2">Wins</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums text-echec">{joueur.nbParties - joueur.nbVictoires}</p>
          <p className="text-xs text-texte-2">Losses</p>
        </Carte>
      </div>

      <h2 className="mb-3 mt-6 font-semibold">Best items</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {meilleursObjets.map((objet) => (
          <ObjetCard key={objet.id} objet={objet} />
        ))}
      </div>
    </>
  )
}
