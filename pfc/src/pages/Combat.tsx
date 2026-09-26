import { useState } from 'react'
import { BadgeCategorie } from '@/components/BadgeCategorie'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { JOUEUR_COURANT, OBJETS_MOCK } from '@/mocks'
import type { Objet, ResultatCombat } from '@/types'
import { CLASSE_RESULTAT, LIBELLE_CATEGORIE, LIBELLE_RESULTAT } from '@/lib/format'
import { resoudreCombat } from '@/lib/combat'

/** Mock opponent item: one the player does not own. */
const OBJET_ADVERSE: Objet =
  OBJETS_MOCK.find((o) => !JOUEUR_COURANT.inventaire.some((i) => i.id === o.id)) ?? OBJETS_MOCK[0]

/** One-line explanation of the outcome, e.g. "Rock beats Scissors". */
function expliquer(mien: Objet, adverse: Objet, resultat: ResultatCombat): string {
  const a = LIBELLE_CATEGORIE[mien.categorie]
  const b = LIBELLE_CATEGORIE[adverse.categorie]
  if (resultat === 'egalite') return `${a} vs ${b}: nobody wins.`
  return resultat === 'victoire' ? `${a} beats ${b}.` : `${b} beats ${a}.`
}

/** /battle — Duel screen. */
export function Combat() {
  const [selection, setSelection] = useState<Objet | null>(null)
  const [resultat, setResultat] = useState<ResultatCombat | null>(null)

  const attaquer = () => {
    if (!selection) return
    setResultat(resoudreCombat(selection, OBJET_ADVERSE))
  }

  const rejouer = () => {
    setSelection(null)
    setResultat(null)
  }

  return (
    <>
      <PageHeader titre="Battle" sousTitre="Pick your item, then attack." />

      {/* Arena: my item vs the opponent's item */}
      <Carte className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-texte-2">You</p>
          {selection ? (
            <>
              <ObjetImage objet={selection} className="h-24 w-24" />
              <p className="font-semibold">{selection.nom}</p>
              <BadgeCategorie categorie={selection.categorie} />
            </>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-bordure text-3xl text-texte-2">
              ?
            </div>
          )}
        </div>

        <p className="text-2xl font-black text-accent-2">VS</p>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-texte-2">Opponent</p>
          <ObjetImage objet={OBJET_ADVERSE} className="h-24 w-24" />
          <p className="font-semibold">{OBJET_ADVERSE.nom}</p>
          <BadgeCategorie categorie={OBJET_ADVERSE.categorie} />
        </div>
      </Carte>

      {/* Result area */}
      <Carte className="mt-4 text-center" aria-live="polite">
        {resultat && selection ? (
          <>
            <p className={`text-3xl font-black ${CLASSE_RESULTAT[resultat]}`}>{LIBELLE_RESULTAT[resultat]}</p>
            <p className="mt-1 text-sm text-texte-2">{expliquer(selection, OBJET_ADVERSE, resultat)}</p>
            <Bouton variante="secondaire" className="mt-4" onClick={rejouer}>
              Play again
            </Bouton>
          </>
        ) : (
          <>
            <p className="text-sm text-texte-2">
              {selection ? 'Ready? Launch the attack.' : 'Select an item below.'}
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
        {JOUEUR_COURANT.inventaire.map((objet) => (
          <ObjetCard
            key={objet.id}
            objet={objet}
            compact
            selectionne={selection?.id === objet.id}
            onSelect={(o) => {
              setSelection(o)
              setResultat(null)
            }}
          />
        ))}
      </div>
    </>
  )
}
