import { useState } from 'react'
import { Avatar } from '@/components/Avatar'
import { Bouton } from '@/components/Bouton'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { Icon } from '@/components/Icon'
import { ListeComptes } from '@/components/ListeComptes'
import { Carte } from '@/components/Carte'
import { EditionProfil } from '@/components/EditionProfil'
import { CarteRang } from '@/components/CarteRang'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { CLASSEMENT_MOCK } from '@/mocks'
import { formaterPourcentage, ORDRE_RARETE } from '@/lib/format'
import { useSession } from '@/lib/session'
import type { Joueur } from '@/types'

/** /profile — Sign in to a test account, then the profile card. */
export function Profil() {
  const { joueur, comptes, connecter, deconnecter } = useSession()

  if (!joueur) {
    return (
      <>
        <PageHeader titre="Sign in" sousTitre="One Google account, one player. Your first battle is a warm-up against the Coach." />
        <ConnexionRequise message="Your profile, inventory and battles are tied to your account." />
      </>
    )
  }

  return (
    <>
      <PageHeader
        titre="Profile"
        action={
          <Bouton variante="fantome" taille="sm" onClick={deconnecter}>
            Sign out
          </Bouton>
        }
      />
      <CarteProfil joueur={joueur} />

      {comptes.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-semibold">Switch account</h2>
          <ListeComptes comptes={comptes} actuelId={joueur.id} onChoisir={connecter} />
        </>
      )}
    </>
  )
}

function CarteProfil({ joueur }: { joueur: Joueur }) {
  const [defiEnvoye, setDefiEnvoye] = useState(false)
  const [edition, setEdition] = useState(false)

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
      <Carte className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar pseudo={joueur.pseudo} avatarUrl={joueur.avatarUrl} taille="lg" />
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
            <Icon name={defiEnvoye ? 'check' : 'swords'} size={16} />
            {defiEnvoye ? 'Challenge sent (mock)' : 'Challenge a friend'}
          </Bouton>
          <Bouton variante="secondaire" taille="sm" onClick={() => setEdition((e) => !e)} aria-expanded={edition}>
            <Icon name="user" size={14} />
            Edit profile
          </Bouton>
        </div>
      </Carte>

      {edition && <EditionProfil joueur={joueur} onFermer={() => setEdition(false)} />}

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

      <h2 className="mb-3 mt-6 font-semibold">Best cards</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {meilleursObjets.map((objet, i) => (
          <ObjetCard key={objet.inventaireId ?? `${objet.id}-${i}`} objet={objet} />
        ))}
      </div>
    </>
  )
}
