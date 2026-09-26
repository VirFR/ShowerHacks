import { useState } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { StatBadge } from '@/components/StatBadge'
import { JOUEUR_COURANT, OBJETS_MOCK } from '@/mocks'
import type { Objet, ResultatCombat } from '@/types'
import { CLASSE_RESULTAT, LIBELLE_RESULTAT } from '@/lib/format'
import { resoudreCombat } from '@/lib/combat'

/** Objet adverse mock : un objet que le joueur ne possède pas. */
const OBJET_ADVERSE: Objet =
  OBJETS_MOCK.find((o) => !JOUEUR_COURANT.inventaire.some((i) => i.id === o.id)) ?? OBJETS_MOCK[0]

/** /combat — Écran de duel. */
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
      <PageHeader titre="Combat" sousTitre="Choisis ton objet, puis attaque." />

      {/* Arène : mon objet vs objet adverse */}
      <Carte className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-texte-2">Toi</p>
          {selection ? (
            <>
              <ObjetImage objet={selection} className="h-24 w-24" />
              <p className="font-semibold">{selection.nom}</p>
              <div className="flex gap-1.5">
                <StatBadge type="attaque" valeur={selection.attaque} />
                <StatBadge type="defense" valeur={selection.defense} />
              </div>
            </>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-bordure text-3xl text-texte-2">
              ?
            </div>
          )}
        </div>

        <p className="text-2xl font-black text-accent-2">VS</p>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-texte-2">Adversaire</p>
          <ObjetImage objet={OBJET_ADVERSE} className="h-24 w-24" />
          <p className="font-semibold">{OBJET_ADVERSE.nom}</p>
          <div className="flex gap-1.5">
            <StatBadge type="attaque" valeur={OBJET_ADVERSE.attaque} />
            <StatBadge type="defense" valeur={OBJET_ADVERSE.defense} />
          </div>
        </div>
      </Carte>

      {/* Zone de résultat */}
      <Carte className="mt-4 text-center" aria-live="polite">
        {resultat ? (
          <>
            <p className={`text-3xl font-black ${CLASSE_RESULTAT[resultat]}`}>{LIBELLE_RESULTAT[resultat]}</p>
            <p className="mt-1 text-sm text-texte-2">
              {selection?.nom} contre {OBJET_ADVERSE.nom}
            </p>
            <Bouton variante="secondaire" className="mt-4" onClick={rejouer}>
              Rejouer
            </Bouton>
          </>
        ) : (
          <>
            <p className="text-sm text-texte-2">
              {selection ? 'Prêt ? Lance l’attaque.' : 'Sélectionne un objet ci-dessous.'}
            </p>
            <Bouton taille="lg" className="mt-3" disabled={!selection} onClick={attaquer}>
              ⚔️ Attaquer
            </Bouton>
          </>
        )}
      </Carte>

      {/* Inventaire */}
      <h2 className="mb-3 mt-6 font-semibold">Ton inventaire</h2>
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
