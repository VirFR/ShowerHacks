import { useState } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { CarteRang } from '@/components/CarteRang'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { CLASSEMENT_MOCK } from '@/mocks'
import { formaterPourcentage } from '@/lib/format'
import { useSession } from '@/lib/session'
import type { Joueur } from '@/types'

/** /profil — Connexion à un compte de test, puis carte de profil. */
export function Profil() {
  const { joueur, comptes, connecter, deconnecter } = useSession()

  if (!joueur) {
    return (
      <>
        <PageHeader titre="Connexion" sousTitre="Choisis ton compte de test (pas de mot de passe pour l’instant)." />
        <ListeComptes comptes={comptes} onChoisir={connecter} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        titre="Profil"
        action={
          <Bouton variante="fantome" taille="sm" onClick={deconnecter}>
            Se déconnecter
          </Bouton>
        }
      />
      <CarteProfil joueur={joueur} />

      <h2 className="mb-3 mt-8 font-semibold">Changer de compte</h2>
      <ListeComptes comptes={comptes} actuelId={joueur.id} onChoisir={connecter} />
    </>
  )
}

interface ListeComptesProps {
  comptes: Joueur[]
  actuelId?: string
  onChoisir: (id: string) => void
}

function ListeComptes({ comptes, actuelId, onChoisir }: ListeComptesProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {comptes.map((c) => {
        const actuel = c.id === actuelId
        return (
          <button
            key={c.id}
            type="button"
            disabled={actuel}
            onClick={() => onChoisir(c.id)}
            aria-pressed={actuel}
            className={[
              'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
              actuel
                ? 'cursor-default border-accent-2 bg-accent/15 ring-2 ring-accent/60'
                : 'border-bordure bg-carte hover:border-accent/60 hover:bg-carte-2',
            ].join(' ')}
          >
            <Avatar pseudo={c.pseudo} taille="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{c.pseudo}</p>
              <p className="text-xs text-texte-2">
                {c.rang} · {c.score} pts · {c.inventaire.length} objets
              </p>
            </div>
            <span className="text-xs font-medium text-accent-2">{actuel ? 'Connecté' : 'Se connecter →'}</span>
          </button>
        )
      })}
    </div>
  )
}

function CarteProfil({ joueur }: { joueur: Joueur }) {
  const [defiEnvoye, setDefiEnvoye] = useState(false)

  const position = CLASSEMENT_MOCK.find((e) => e.joueurId === joueur.id)?.position
  const ratio = joueur.nbParties ? joueur.nbVictoires / joueur.nbParties : 0
  const meilleursObjets = [...joueur.inventaire]
    .sort((a, b) => b.attaque + b.defense - (a.attaque + a.defense))
    .slice(0, 3)

  const defier = () => {
    // Mock : à brancher sur un vrai système d'invitation (lien / notification).
    setDefiEnvoye(true)
    window.setTimeout(() => setDefiEnvoye(false), 2500)
  }

  return (
    <>
      <Carte className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar pseudo={joueur.pseudo} taille="lg" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{joueur.pseudo}</h2>
          <p className="text-sm text-texte-2">
            {position ? `#${position} au classement · ` : ''}
            {joueur.nbParties} parties · {formaterPourcentage(ratio)} de victoires
          </p>
          <div className="mt-4">
            <CarteRang rang={joueur.rang} score={joueur.score} taille="lg" />
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Bouton onClick={defier} disabled={defiEnvoye}>
            {defiEnvoye ? '✅ Défi envoyé (mock)' : '🤝 Défier un ami'}
          </Bouton>
          <Bouton variante="secondaire" taille="sm" disabled title="Auth à venir">
            Modifier le profil
          </Bouton>
        </div>
      </Carte>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums">{joueur.inventaire.length}</p>
          <p className="text-xs text-texte-2">Objets</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums text-succes">{joueur.nbVictoires}</p>
          <p className="text-xs text-texte-2">Victoires</p>
        </Carte>
        <Carte className="text-center">
          <p className="text-2xl font-black tabular-nums text-echec">{joueur.nbParties - joueur.nbVictoires}</p>
          <p className="text-xs text-texte-2">Défaites</p>
        </Carte>
      </div>

      <h2 className="mb-3 mt-6 font-semibold">Meilleurs objets</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {meilleursObjets.map((objet) => (
          <ObjetCard key={objet.id} objet={objet} />
        ))}
      </div>
    </>
  )
}

function Avatar({ pseudo, taille }: { pseudo: string; taille: 'sm' | 'lg' }) {
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-defense font-black text-white shadow-lg',
        taille === 'lg' ? 'h-24 w-24 text-4xl' : 'h-12 w-12 text-lg',
      ].join(' ')}
      aria-hidden
    >
      {pseudo.charAt(0).toUpperCase()}
    </div>
  )
}
