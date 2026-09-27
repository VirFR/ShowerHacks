import { useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ChoixVue, InventaireVue } from '@/components/InventaireVue'
import { empiler, trierInventaire, useModeVue, type Pile } from '@/lib/inventaire'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { useSession } from '@/lib/session'
import type { Objet, ResultatAssemblage } from '@/types'

type Emplacement = 'a' | 'b'

/** Same inventory copy (two copies of one item are different cards). */
const memeCopie = (a: Objet | null, b: Objet | null) => Boolean(a && b && a.inventaireId === b.inventaireId)

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
        'flex h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-center transition-colors',
        survole ? 'border-accent bg-sky-100' : 'border-bordure bg-fond/60',
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
  const { joueur, crafter } = useSession()
  const inventaire = trierInventaire(joueur?.inventaire ?? [])
  const piles = empiler(inventaire)
  const [mode, setMode] = useModeVue()
  const [slotA, setSlotA] = useState<Objet | null>(null)
  const [slotB, setSlotB] = useState<Objet | null>(null)
  const [resultat, setResultat] = useState<ResultatAssemblage | null>(null)
  const [survol, setSurvol] = useState<Emplacement | null>(null)
  const [enCours, setEnCours] = useState(false)

  const placer = (pile: Pile, emplacement?: Emplacement) => {
    setResultat(null)
    // Two-click selection: first click → slot A, second → slot B.
    const cible: Emplacement = emplacement ?? (slotA && !slotB ? 'b' : 'a')
    // The same item can fill both slots (Iron Ore + Iron Ore): a second copy is used
    // when there is one, otherwise the single copy goes in both and is consumed once.
    const autre = cible === 'a' ? slotB : slotA
    const objet = pile.copies.find((c) => !memeCopie(c, autre)) ?? pile.copies[0]
    if (cible === 'a') setSlotA(objet)
    else setSlotB(objet)
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

  /**
   * Tries the combination (any two owned cards, no prior knowledge needed).
   * On success both ingredients are consumed and the crafted card is added.
   */
  const combiner = async () => {
    if (!slotA || !slotB || enCours) return
    setEnCours(true)
    try {
      const issue = await crafter(slotA, slotB)
      setResultat(issue)
      if (issue.succes) {
        setSlotA(null)
        setSlotB(null)
      }
    } finally {
      setEnCours(false)
    }
  }

  // Native HTML5 drag & drop: the item id travels through dataTransfer, `placer` picks the copy.
  const onDragStart = (e: DragEvent, pile: Pile) => {
    e.dataTransfer.setData('text/plain', pile.objet.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDrop = (e: DragEvent, emplacement: Emplacement) => {
    e.preventDefault()
    setSurvol(null)
    const id = e.dataTransfer.getData('text/plain')
    const pile = piles.find((p) => p.objet.id === id)
    if (pile) placer(pile, emplacement)
  }

  const propsSlot = { onSurvol: setSurvol, onDrop, onRetirer: retirer }

  if (!joueur) return <ConnexionRequise />

  return (
    <>
      <PageHeader
        titre="Crafting"
        sousTitre="Combine two cards to create a new one. Rock, leaf and scissors are infinite: they are never used up."
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
          <Bouton taille="lg" disabled={!slotA || !slotB || enCours} onClick={combiner}>
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
            {resultat.nouvelleDecouverte && (
              <p className="mt-1 text-sm text-texte-2">
                New discovery! Its recipe is now in your{' '}
                <Link to="/recipes" className="text-accent-2 hover:underline">
                  recipe book
                </Link>
                .
              </p>
            )}
            {resultat.objetResultat && (
              <div className="mx-auto mt-3 max-w-xs">
                <ObjetCard objet={resultat.objetResultat} nouveau={resultat.nouvelleDecouverte} />
              </div>
            )}
          </div>
        )}
      </Carte>

      <div className="mb-3 mt-6 flex items-center justify-between gap-2">
        <h2 className="font-semibold">Your inventory</h2>
        <ChoixVue mode={mode} onChange={setMode} />
      </div>
      <InventaireVue
        piles={piles}
        mode={mode}
        estSelectionne={(p) => p.copies.some((c) => memeCopie(slotA, c) || memeCopie(slotB, c))}
        onSelect={(p) => placer(p)}
        onDragStart={onDragStart}
      />
    </>
  )
}
