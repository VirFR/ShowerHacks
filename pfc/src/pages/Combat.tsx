import { useState } from 'react'
import { BadgeCategorie } from '@/components/BadgeCategorie'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { expliquerCombat, resoudreCombat } from '@/lib/combat'
import { CLASSE_RESULTAT, LIBELLE_RESULTAT } from '@/lib/format'
import { useSession } from '@/lib/session'
import type { Joueur, Objet, ResultatCombat } from '@/types'

function tirerObjet(joueur: Joueur): Objet {
  return joueur.inventaire[Math.floor(Math.random() * joueur.inventaire.length)]
}

/** /battle — Duel screen against another account. */
export function Combat() {
  const { joueur, comptes } = useSession()
  if (!joueur) return <ConnexionRequise />
  return <Duel joueur={joueur} adversaires={comptes.filter((c) => c.id !== joueur.id)} />
}

interface DuelProps {
  joueur: Joueur
  adversaires: Joueur[]
}

function Duel({ joueur, adversaires }: DuelProps) {
  const [adversaire, setAdversaire] = useState<Joueur>(adversaires[0])
  const [selection, setSelection] = useState<Objet | null>(null)
  const [objetAdverse, setObjetAdverse] = useState<Objet | null>(null)
  const [resultat, setResultat] = useState<ResultatCombat | null>(null)

  const attaquer = () => {
    if (!selection) return
    // The opponent plays a random item from their inventory (mock).
    const tirage = tirerObjet(adversaire)
    setObjetAdverse(tirage)
    setResultat(resoudreCombat(selection, tirage))
  }

  const rejouer = () => {
    setSelection(null)
    setObjetAdverse(null)
    setResultat(null)
  }

  return (
    <>
      <PageHeader titre="Battle" sousTitre={`${joueur.pseudo}, pick your opponent and your item.`} />

      {/* Opponent picker */}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Pick an opponent">
        <span className="text-sm text-texte-2">Opponent:</span>
        {adversaires.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={adversaire.id === a.id}
            onClick={() => {
              setAdversaire(a)
              setObjetAdverse(null)
              setResultat(null)
            }}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              adversaire.id === a.id
                ? 'bg-accent text-white'
                : 'bg-carte text-texte-2 ring-1 ring-bordure hover:text-texte',
            ].join(' ')}
          >
            {a.pseudo}
          </button>
        ))}
      </div>

      {/* Arena */}
      <Carte className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Camp titre={joueur.pseudo} objet={selection} />
        <p className="text-2xl font-black text-accent-2">VS</p>
        <Camp titre={adversaire.pseudo} objet={objetAdverse} />
      </Carte>

      {/* Result area */}
      <Carte className="mt-4 text-center" aria-live="polite">
        {resultat && selection && objetAdverse ? (
          <>
            <p className={`text-3xl font-black ${CLASSE_RESULTAT[resultat]}`}>{LIBELLE_RESULTAT[resultat]}</p>
            <p className="mt-1 text-sm text-texte-2">{expliquerCombat(selection, objetAdverse)}</p>
            <Bouton variante="secondaire" className="mt-4" onClick={rejouer}>
              Play again
            </Bouton>
          </>
        ) : (
          <>
            <p className="text-sm text-texte-2">
              {selection ? `Ready? Attack ${adversaire.pseudo}.` : 'Select an item below.'}
            </p>
            <Bouton taille="lg" className="mt-3" disabled={!selection} onClick={attaquer}>
              ⚔️ Attack
            </Bouton>
          </>
        )}
      </Carte>

      {/* Inventory */}
      <h2 className="mb-3 mt-6 font-semibold">Your inventory</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {joueur.inventaire.map((objet, i) => (
          <ObjetCard
            key={`${objet.id}-${i}`}
            objet={objet}
            compact
            selectionne={selection?.id === objet.id}
            onSelect={(o) => {
              setSelection(o)
              setObjetAdverse(null)
              setResultat(null)
            }}
          />
        ))}
      </div>
    </>
  )
}

function Camp({ titre, objet }: { titre: string; objet: Objet | null }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-xs uppercase tracking-widest text-texte-2">{titre}</p>
      {objet ? (
        <>
          <ObjetImage objet={objet} className="h-24 w-24" />
          <p className="font-semibold">{objet.nom}</p>
          <BadgeCategorie categorie={objet.categorie} />
        </>
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-bordure text-3xl text-texte-2">
          ?
        </div>
      )}
    </div>
  )
}
