import { useState, type DragEvent } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { JOUEUR_COURANT, OBJETS_MOCK } from '@/mocks'
import type { Objet, ResultatAssemblage } from '@/types'

type Emplacement = 'a' | 'b'

/**
 * Résultat factice : deux objets de la même catégorie se combinent,
 * sinon la combinaison échoue. À remplacer par la vraie logique de crafting.
 */
function assemblerMock(a: Objet, b: Objet): ResultatAssemblage {
  if (a.id === b.id) {
    return { succes: false, message: 'Combinaison impossible : il faut deux objets différents.' }
  }
  if (a.categorie !== b.categorie) {
    return { succes: false, message: 'Combinaison impossible : les catégories ne correspondent pas.' }
  }
  const candidats = OBJETS_MOCK.filter(
    (o) => o.categorie === a.categorie && o.id !== a.id && o.id !== b.id,
  )
  const objetResultat = candidats[0] ?? OBJETS_MOCK.find((o) => o.categorie === 'fight')
  return {
    succes: true,
    message: 'Combinaison réussie !',
    objetResultat,
  }
}

interface SlotProps {
  emplacement: Emplacement
  objet: Objet | null
  survole: boolean
  onSurvol: (emplacement: Emplacement | null) => void
  onDrop: (e: DragEvent, emplacement: Emplacement) => void
  onRetirer: (emplacement: Emplacement) => void
}

/** Emplacement de dépôt d'un objet (cible du drag & drop). */
function Slot({ emplacement, objet, survole, onSurvol, onDrop, onRetirer }: SlotProps) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        onSurvol(emplacement)
      }}
      onDragLeave={() => onSurvol(null)}
      onDrop={(e) => onDrop(e, emplacement)}
      className={[
        'flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 text-center transition-colors',
        survole ? 'border-accent-2 bg-accent/20' : 'border-bordure bg-fond/40',
      ].join(' ')}
    >
      {objet ? (
        <>
          <ObjetImage objet={objet} className="h-16 w-16" />
          <p className="text-sm font-semibold">{objet.nom}</p>
          <button
            type="button"
            onClick={() => onRetirer(emplacement)}
            className="text-xs text-texte-2 hover:text-echec"
          >
            Retirer
          </button>
        </>
      ) : (
        <>
          <p className="text-3xl text-texte-2">＋</p>
          <p className="text-xs text-texte-2">
            Glisse un objet ici
            <br />
            ou clique dessus dans l’inventaire
          </p>
        </>
      )}
    </div>
  )
}

/** /assemblage — Combiner deux objets (drag & drop ou sélection à deux clics). */
export function Assemblage() {
  const [slotA, setSlotA] = useState<Objet | null>(null)
  const [slotB, setSlotB] = useState<Objet | null>(null)
  const [resultat, setResultat] = useState<ResultatAssemblage | null>(null)
  const [survol, setSurvol] = useState<Emplacement | null>(null)

  const placer = (objet: Objet, emplacement?: Emplacement) => {
    setResultat(null)
    // Sélection à deux clics : premier clic → slot A, second → slot B.
    const cible: Emplacement = emplacement ?? (slotA && !slotB ? 'b' : 'a')
    if (cible === 'a') {
      setSlotA(objet)
      if (slotB?.id === objet.id) setSlotB(null)
    } else {
      setSlotB(objet)
      if (slotA?.id === objet.id) setSlotA(null)
    }
  }

  const retirer = (emplacement: Emplacement) => {
    setResultat(null)
    if (emplacement === 'a') setSlotA(null)
    else setSlotB(null)
  }

  const reinitialiser = () => {
    setSlotA(null)
    setSlotB(null)
    setResultat(null)
  }

  // Drag & drop natif HTML5 : l'id de l'objet transite par dataTransfer.
  const onDragStart = (e: DragEvent, objet: Objet) => {
    e.dataTransfer.setData('text/plain', objet.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDrop = (e: DragEvent, emplacement: Emplacement) => {
    e.preventDefault()
    setSurvol(null)
    const id = e.dataTransfer.getData('text/plain')
    const objet = JOUEUR_COURANT.inventaire.find((o) => o.id === id)
    if (objet) placer(objet, emplacement)
  }

  const propsSlot = { onSurvol: setSurvol, onDrop, onRetirer: retirer }

  return (
    <>
      <PageHeader
        titre="Assemblage"
        sousTitre="Combine deux objets pour en créer un nouveau."
        action={
          (slotA || slotB) && (
            <Bouton variante="fantome" taille="sm" onClick={reinitialiser}>
              Réinitialiser
            </Bouton>
          )
        }
      />

      <Carte>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Slot emplacement="a" objet={slotA} survole={survol === 'a'} {...propsSlot} />
          <span className="text-3xl font-black text-accent-2">+</span>
          <Slot emplacement="b" objet={slotB} survole={survol === 'b'} {...propsSlot} />
        </div>

        <div className="mt-5 text-center">
          <Bouton
            taille="lg"
            disabled={!slotA || !slotB}
            onClick={() => slotA && slotB && setResultat(assemblerMock(slotA, slotB))}
          >
            🧪 Combiner
          </Bouton>
        </div>

        {resultat && (
          <div
            role="status"
            className={[
              'animate-booster-pop mt-5 rounded-2xl border p-4 text-center',
              resultat.succes ? 'border-succes/50 bg-succes/10' : 'border-echec/50 bg-echec/10',
            ].join(' ')}
          >
            <p className={`text-lg font-bold ${resultat.succes ? 'text-succes' : 'text-echec'}`}>
              {resultat.message}
            </p>
            {resultat.objetResultat && (
              <div className="mx-auto mt-3 max-w-xs">
                <ObjetCard objet={resultat.objetResultat} />
              </div>
            )}
          </div>
        )}
      </Carte>

      <h2 className="mb-3 mt-6 font-semibold">Ton inventaire</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {JOUEUR_COURANT.inventaire.map((objet) => (
          <div key={objet.id} draggable onDragStart={(e) => onDragStart(e, objet)} className="cursor-grab active:cursor-grabbing">
            <ObjetCard
              objet={objet}
              compact
              selectionne={slotA?.id === objet.id || slotB?.id === objet.id}
              onSelect={(o) => placer(o)}
            />
          </div>
        ))}
      </div>
    </>
  )
}
