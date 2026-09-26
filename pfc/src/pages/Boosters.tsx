import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { BadgeCategorie } from '@/components/BadgeCategorie'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { ObjetImage } from '@/components/ObjetImage'
import { PageHeader } from '@/components/PageHeader'
import { tirerObjetPondere } from '@/lib/boosters'
import { CLASSE_RARETE, formaterDuree, LIBELLE_RARETE } from '@/lib/format'
import { BOOSTERS_MOCK, OBJETS_BOOSTER_MOCK } from '@/mocks'
import { BOOSTER_INTERVALLE_MS, OBJETS_PAR_BOOSTER, type Objet, type Rarete } from '@/types'

/** /boosters — Booster stack, interactive tear-open, cards revealed one by one. */
type EtatOuverture = 'idle' | 'dechirure' | 'ouverture' | 'cartes' | 'revele'

interface EtatStack {
  actuel: number
  /** Timestamp (ms) of the next booster. */
  prochainA: number
}

const MAX = BOOSTERS_MOCK.max
/** Distance (px) to drag to tear the booster open. */
const SEUIL_DECHIRURE_PX = 90

const RARETE_GLOW: Record<Rarete, string> = {
  commun: 'border-bordure',
  peu_commun: 'border-succes/60 shadow-lg shadow-succes/25',
  rare: 'border-defense/70 shadow-lg shadow-defense/30',
  epique: 'border-accent-2 shadow-lg shadow-accent/40',
  legendaire: 'border-or shadow-lg shadow-or/50',
  secret_rare: 'border-white/70 shadow-2xl shadow-white/30',
}

export function Boosters() {
  const [stack, setStack] = useState<EtatStack>(() => ({
    actuel: BOOSTERS_MOCK.actuel,
    prochainA: new Date(BOOSTERS_MOCK.prochainA).getTime(),
  }))
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [etat, setEtat] = useState<EtatOuverture>('idle')
  const [objetsObtenus, setObjetsObtenus] = useState<Objet[]>([])
  const [indexCarte, setIndexCarte] = useState(0)
  const [carteRetournee, setCarteRetournee] = useState(false)

  const [dragProgress, setDragProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const dechirureEnCours = useRef(false)

  const { actuel, prochainA } = stack
  const plein = actuel >= MAX

  // Timer tick (1 s). When the countdown hits 0, +1 booster (mock).
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now()
      setMaintenant(now)
      setStack((s) =>
        s.actuel < MAX && now >= s.prochainA
          ? { actuel: s.actuel + 1, prochainA: s.prochainA + BOOSTER_INTERVALLE_MS }
          : s,
      )
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const restant = plein ? 0 : Math.max(0, prochainA - maintenant)
  const progression = plein ? 1 : 1 - restant / BOOSTER_INTERVALLE_MS

  /** Arms the booster: the player now has to tear it open. */
  const commencerOuverture = () => {
    if (actuel <= 0) return
    setDragProgress(0)
    setEtat('dechirure')
  }

  /** Finishes the tear (drag threshold reached, or a direct tap as a fallback): draws the items. */
  const terminerDechirure = () => {
    if (dechirureEnCours.current) return
    dechirureEnCours.current = true
    setEtat('ouverture')
    window.setTimeout(() => {
      const tirage = Array.from({ length: OBJETS_PAR_BOOSTER }, () => tirerObjetPondere(OBJETS_BOOSTER_MOCK))
      setObjetsObtenus(tirage)
      setIndexCarte(0)
      setCarteRetournee(false)
      setStack((s) => ({
        actuel: Math.max(0, s.actuel - 1),
        // If the stack was full, the timer restarts from now.
        prochainA: s.actuel >= MAX ? Date.now() + BOOSTER_INTERVALLE_MS : s.prochainA,
      }))
      setEtat('cartes')
      dechirureEnCours.current = false
    }, 480)
  }

  const onPointerDownPack = (e: PointerEvent<HTMLDivElement>) => {
    if (etat !== 'dechirure') return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartY.current = e.clientY
    setIsDragging(true)
  }

  const onPointerMovePack = (e: PointerEvent<HTMLDivElement>) => {
    if (etat !== 'dechirure' || dragStartY.current === null) return
    const dy = e.clientY - dragStartY.current
    const nouvelleProgression = Math.min(1, Math.max(0, dy / SEUIL_DECHIRURE_PX))
    setDragProgress(nouvelleProgression)
    if (nouvelleProgression >= 1) {
      dragStartY.current = null
      setIsDragging(false)
      terminerDechirure()
    }
  }

  const onPointerUpPack = () => {
    if (dragStartY.current === null) return
    dragStartY.current = null
    setIsDragging(false)
    setDragProgress(0)
  }

  /** Taps/clicks the card: reveals it, then advances to the next one (or the recap). */
  const onTapCarte = () => {
    if (!carteRetournee) {
      setCarteRetournee(true)
      return
    }
    if (indexCarte + 1 < objetsObtenus.length) {
      setIndexCarte((i) => i + 1)
      setCarteRetournee(false)
    } else {
      setEtat('revele')
    }
  }

  const objetActuel = objetsObtenus[indexCarte]
  const transitionRessort = isDragging ? 'none' : 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <>
      <PageHeader
        titre="Boosters"
        sousTitre={`A new booster every 10 minutes, ${OBJETS_PAR_BOOSTER} items per booster.`}
      />

      {/* Opening: the booster floats front and center, no card chrome around it */}
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        {(etat === 'idle' || etat === 'dechirure' || etat === 'ouverture') && (
          <div
            className={`relative h-72 w-52 sm:h-80 sm:w-60 ${etat === 'idle' ? 'animate-pack-float' : ''}`}
            style={{ touchAction: 'none' }}
            onPointerDown={onPointerDownPack}
            onPointerMove={onPointerMovePack}
            onPointerUp={onPointerUpPack}
            onPointerCancel={onPointerUpPack}
            onClick={() => etat === 'dechirure' && terminerDechirure()}
            role={etat === 'dechirure' ? 'button' : undefined}
            tabIndex={etat === 'dechirure' ? 0 : undefined}
            aria-label={etat === 'dechirure' ? 'Tear the booster open: drag or tap' : undefined}
            onKeyDown={(e) => {
              if (etat === 'dechirure' && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                terminerDechirure()
              }
            }}
          >
            {/* Ambient glow, which grows further while tearing */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl bg-or blur-2xl transition-opacity"
              style={{ opacity: etat === 'dechirure' ? 0.25 + dragProgress * 0.65 : etat === 'ouverture' ? 0.9 : 0.25 }}
              aria-hidden
            />

            {/* Top half */}
            <div
              className={[
                'foil-pack pack-encoche absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-xl shadow-2xl shadow-black/50 ring-1 ring-white/40',
                etat === 'ouverture' ? 'animate-tear-burst-haut' : '',
              ].join(' ')}
              style={
                etat === 'dechirure'
                  ? {
                      transform: `translateY(${-dragProgress * 60}px) rotate(${-dragProgress * 10}deg)`,
                      transition: transitionRessort,
                    }
                  : undefined
              }
            >
              <div className="foil-pack-shine animate-foil-shine pointer-events-none absolute -inset-x-10 -inset-y-24" aria-hidden />
              <div className="foil-crimp absolute inset-x-3 top-3" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 left-1" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 right-1" aria-hidden />
            </div>

            {/* Bottom half */}
            <div
              className={[
                'foil-pack absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-xl shadow-2xl shadow-black/50 ring-1 ring-white/40',
                etat === 'ouverture' ? 'animate-tear-burst-bas' : '',
              ].join(' ')}
              style={
                etat === 'dechirure'
                  ? {
                      transform: `translateY(${dragProgress * 60}px) rotate(${dragProgress * 10}deg)`,
                      transition: transitionRessort,
                    }
                  : undefined
              }
            >
              <div className="foil-pack-shine animate-foil-shine pointer-events-none absolute -inset-x-10 -inset-y-24" aria-hidden />
              <div className="foil-crimp absolute inset-x-3 bottom-1.5" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 left-1" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 right-1" aria-hidden />
            </div>

            {etat !== 'ouverture' && (
              <>
                <div
                  className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-fond/50"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-fond"
                  aria-hidden
                >
                  <span className="text-4xl drop-shadow-sm">✊✋✌️</span>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-fond/70">PFC Booster</span>
                </div>
              </>
            )}

            {etat === 'ouverture' && (
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-white animate-flash" aria-hidden />
            )}

            {etat === 'dechirure' && dragProgress < 0.15 && (
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-10 text-2xl text-fond/80"
                aria-hidden
              >
                <span className="animate-bounce">▲</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                  ▼
                </span>
              </div>
            )}
          </div>
        )}

        {etat === 'cartes' && objetActuel && (
          <div
            className="perspective-dist cursor-pointer select-none"
            onClick={onTapCarte}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTapCarte()
              }
            }}
            aria-label={carteRetournee ? `${objetActuel.nom}, tap to continue` : 'Face-down card, tap to reveal'}
          >
            <div className={`flip-inner relative h-72 w-52 ${carteRetournee ? 'retournee' : ''}`}>
              <div className="flip-face absolute inset-0 flex items-center justify-center rounded-2xl border border-bordure bg-gradient-to-br from-carte-2 to-fond-2 text-5xl shadow-xl">
                ✊✋✌️
              </div>
              <div className="flip-face flip-face-arriere absolute inset-0">
                <div
                  className={[
                    'relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border bg-carte p-4',
                    RARETE_GLOW[objetActuel.rarete],
                  ].join(' ')}
                >
                  {objetActuel.rarete === 'secret_rare' && (
                    <div
                      className="shimmer-holo pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 rotate-12 blur-md animate-shimmer"
                      aria-hidden
                    />
                  )}
                  {(objetActuel.rarete === 'epique' || objetActuel.rarete === 'legendaire') && (
                    <div
                      className="pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 rotate-12 bg-white/30 blur-md animate-shimmer"
                      aria-hidden
                    />
                  )}
                  <ObjetImage objet={objetActuel} className="h-28 w-28" />
                  <div>
                    <h3 className="font-bold">{objetActuel.nom}</h3>
                    <p className={`text-xs ${CLASSE_RARETE[objetActuel.rarete]}`}>{LIBELLE_RARETE[objetActuel.rarete]}</p>
                  </div>
                  <BadgeCategorie categorie={objetActuel.categorie} />
                </div>
              </div>
            </div>
          </div>
        )}

        {etat === 'revele' && objetsObtenus.length > 0 && (
          <div className="animate-booster-pop w-full max-w-lg">
            <p className="mb-2 text-sm font-semibold text-accent-2">You got {objetsObtenus.length} items:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {objetsObtenus.map((objet, i) => (
                <ObjetCard key={`${objet.id}-${i}`} objet={objet} />
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-texte-2">
          {etat === 'idle' &&
            (actuel > 0
              ? `Open a booster to discover ${OBJETS_PAR_BOOSTER} new items.`
              : 'No boosters left, hang on a bit.')}
          {etat === 'dechirure' && 'Drag the booster to tear it open ✋'}
          {etat === 'ouverture' && 'Ripping…'}
          {etat === 'cartes' &&
            (carteRetournee
              ? `Item ${indexCarte + 1} / ${objetsObtenus.length} — tap to continue`
              : `Card ${indexCarte + 1} / ${objetsObtenus.length} — tap to reveal`)}
        </p>

        {(etat === 'idle' || etat === 'revele') && (
          <Bouton taille="lg" disabled={actuel <= 0} onClick={commencerOuverture}>
            {etat === 'revele' ? 'Open another' : 'Open'}
          </Bouton>
        )}
      </div>

      {/* Stack + timer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Carte>
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Stack</h2>
            <p className="text-2xl font-black tabular-nums">
              {actuel}
              <span className="text-sm font-semibold text-texte-2"> / {MAX}</span>
            </p>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2" aria-label={`${actuel} of ${MAX} boosters`}>
            {Array.from({ length: MAX }, (_, i) => (
              <div
                key={i}
                className={[
                  'flex aspect-square items-center justify-center rounded-xl text-xl transition-all',
                  i < actuel
                    ? 'bg-gradient-to-br from-accent to-accent-2 shadow-md shadow-accent/30'
                    : 'border border-dashed border-bordure bg-fond/40 opacity-50 grayscale',
                ].join(' ')}
                aria-hidden
              >
                🎁
              </div>
            ))}
          </div>
        </Carte>

        <Carte>
          <h2 className="font-semibold">Next booster</h2>
          {plein ? (
            <p className="mt-2 text-sm text-or">Stack full! Open a booster to restart the timer.</p>
          ) : (
            <>
              <p className="mt-2 text-4xl font-black tabular-nums">{formaterDuree(restant)}</p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-fond"
                role="progressbar"
                aria-valuenow={Math.round(progression * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-defense to-accent-2 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${progression * 100}%` }}
                />
              </div>
            </>
          )}
        </Carte>
      </div>
    </>
  )
}
