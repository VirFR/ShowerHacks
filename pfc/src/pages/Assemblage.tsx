import { useState, type DragEvent } from 'react'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { trouverRecette } from '@/lib/assemblage'
import { ORDRE_RARETE } from '@/lib/format'
import { useSession } from '@/lib/session'
import { trouverObjet } from '@/mocks'
import type { Objet, ResultatAssemblage } from '@/types'

type Emplacement = 'a' | 'b'

/**
 * Little-Alchemy-style resolution: any two owned cards can be tried, no
 * prior knowledge of the recipe required. A match consumes both ingredients
 * and produces the result (see `retirerObjets`/`ajouterObjets` in the page
 * component, which also unlocks the recipe in the recipe book).
 */
function assembler(a: Objet, b: Objet): ResultatAssemblage {
  if (a.id === b.id) {
    return { succes: false, message: 'Can’t combine: you need two different cards.' }
  }
  const recette = trouverRecette(a.id, b.id)
  const resultat = recette ? trouverObjet(recette.resultatId) : undefined
  if (!recette || !resultat) {
    return { succes: false, message: `Can’t combine: no known recipe for ${a.nom} + ${b.nom}.` }
  }
  return { succes: true, message: `You crafted ${resultat.nom}!`, objetResultat: resultat }
}

interface SlotProps {
  emplacement: Emplacement
  objet: Objet | null
  survole: boolean
  onSurvol: (emplacement: Emplacement | null) => void
  onDrop: (e: DragEvent, emplacement: Emplacement) => void
  onRetirer: (emplacement: Emplacement) => void
}

/** Drop slot for an item (drag & drop target). */
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
            Remove
          </button>
        </>
      ) : (
        <>
          <p className="text-3xl text-texte-2">＋</p>
          <p className="text-xs text-texte-2">
            Drag a card here
            <br />
            or click one in your inventory
          </p>
        </>
      )}
    </div>
  )
}

/** /crafting — Combine two items (drag & drop or two-click selection). */
export function Assemblage() {
  const { joueur, ajouterObjets, retirerObjets } = useSession()
  const inventaire = (joueur?.inventaire ?? []).toSorted((a, b) => ORDRE_RARETE[a.rarete] - ORDRE_RARETE[b.rarete])
  const [slotA, setSlotA] = useState<Objet | null>(null)
  const [slotB, setSlotB] = useState<Objet | null>(null)
  const [resultat, setResultat] = useState<ResultatAssemblage | null>(null)
  const [survol, setSurvol] = useState<Emplacement | null>(null)

  const placer = (objet: Objet, emplacement?: Emplacement) => {
    setResultat(null)
    // Two-click selection: first click → slot A, second → slot B.
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

  /** Tries the combination: on success, consumes the two ingredients and adds the crafted card. */
  const combiner = () => {
    if (!slotA || !slotB) return
    const issue = assembler(slotA, slotB)
    setResultat(issue)
    if (issue.succes && issue.objetResultat) {
      retirerObjets([slotA.id, slotB.id])
      ajouterObjets([issue.objetResultat])
      setSlotA(null)
      setSlotB(null)
    }
  }

  // Native HTML5 drag & drop: the item id travels through dataTransfer.
  const onDragStart = (e: DragEvent, objet: Objet) => {
    e.dataTransfer.setData('text/plain', objet.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDrop = (e: DragEvent, emplacement: Emplacement) => {
    e.preventDefault()
    setSurvol(null)
    const id = e.dataTransfer.getData('text/plain')
    const objet = inventaire.find((o) => o.id === id)
    if (objet) placer(objet, emplacement)
  }

  const propsSlot = { onSurvol: setSurvol, onDrop, onRetirer: retirer }

  if (!joueur) return <ConnexionRequise />

  return (
    <>
      <PageHeader
        titre="Crafting"
        sousTitre="Combine two cards to create a new one."
        action={
          (slotA || slotB) && (
            <Bouton variante="fantome" taille="sm" onClick={reinitialiser}>
              Reset
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
          <Bouton taille="lg" disabled={!slotA || !slotB} onClick={combiner}>
            <Icon name="flask" size={18} />
            Combine
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

      <h2 className="mb-3 mt-6 font-semibold">Your inventory</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {inventaire.map((objet, i) => (
          <div key={`${objet.id}-${i}`} draggable onDragStart={(e) => onDragStart(e, objet)} className="cursor-grab active:cursor-grabbing">
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
