import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { tirerObjetPondere } from '@/lib/boosters'
import { formaterDuree } from '@/lib/format'
import { BOOSTERS_MOCK, OBJETS_BOOSTER_MOCK } from '@/mocks'
import { BOOSTER_INTERVALLE_MS, OBJETS_PAR_BOOSTER, type Objet } from '@/types'

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

export function Boosters() {
  const [stack, setStack] = useState<EtatStack>(() => ({
    actuel: BOOSTERS_MOCK.actuel,
    prochainA: new Date(BOOSTERS_MOCK.prochainA).getTime(),
  }))
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [etat, setEtat] = useState<EtatOuverture>('idle')
  const [objetsObtenus, setObjetsObtenus] = useState<Objet[]>([])
  const [indexCarte, setIndexCarte] = useState(0)

  const [dragProgress, setDragProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef<number | null>(null)
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
      setStack((s) => ({
        actuel: Math.max(0, s.actuel - 1),
        // If the stack was full, the timer restarts from now.
        prochainA: s.actuel >= MAX ? Date.now() + BOOSTER_INTERVALLE_MS : s.prochainA,
      }))
      setEtat('cartes')
      dechirureEnCours.current = false
    }, 480)
  }

  const onPointerDownBandelette = (e: PointerEvent<HTMLDivElement>) => {
    if (etat !== 'dechirure') return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartX.current = e.clientX
    setIsDragging(true)
  }

  /** Only a right-to-left drag counts: pulling the strip the other way makes no progress. */
  const onPointerMoveBandelette = (e: PointerEvent<HTMLDivElement>) => {
    if (etat !== 'dechirure' || dragStartX.current === null) return
    const dx = dragStartX.current - e.clientX
    const nouvelleProgression = Math.min(1, Math.max(0, dx / SEUIL_DECHIRURE_PX))
    setDragProgress(nouvelleProgression)
    if (nouvelleProgression >= 1) {
      dragStartX.current = null
      setIsDragging(false)
      terminerDechirure()
    }
  }

  const onPointerUpBandelette = () => {
    if (dragStartX.current === null) return
    dragStartX.current = null
    setIsDragging(false)
    setDragProgress(0)
  }

  /** Taps/clicks the card: advances to the next one (or the recap). */
  const onTapCarte = () => {
    if (indexCarte + 1 < objetsObtenus.length) {
      setIndexCarte((i) => i + 1)
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
          <div className={`relative h-72 w-52 sm:h-80 sm:w-60 ${etat === 'idle' ? 'animate-pack-float' : ''}`}>
            {/* Ambient glow, which grows further while tearing */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl bg-or blur-2xl transition-opacity"
              style={{ opacity: etat === 'dechirure' ? 0.25 + dragProgress * 0.65 : etat === 'ouverture' ? 0.9 : 0.25 }}
              aria-hidden
            />

            {/* Body: the big lower 3/4 of the pack, stays put */}
            <div className="foil-pack absolute inset-x-0 bottom-0 h-3/4 overflow-hidden rounded-b-xl shadow-2xl shadow-black/50 ring-1 ring-white/40">
              <div className="foil-crimp absolute inset-x-3 bottom-1.5" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 left-1" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-2 right-1" aria-hidden />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-fond" aria-hidden>
                <span className="text-4xl drop-shadow-sm">✊✋✌️</span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-fond/70">PFC Booster</span>
              </div>
              {etat === 'ouverture' && (
                <div className="pointer-events-none absolute inset-0 bg-white animate-flash" aria-hidden />
              )}
            </div>

            {/* Tear strip: the top 1/4, dragged right-to-left to open */}
            <div
              className={[
                'foil-pack pack-encoche-droite absolute inset-x-0 top-0 h-1/4 overflow-hidden rounded-t-xl shadow-2xl shadow-black/50 ring-1 ring-white/40',
                etat === 'ouverture' ? 'animate-tear-burst-gauche' : '',
              ].join(' ')}
              style={{
                touchAction: 'none',
                ...(etat === 'dechirure'
                  ? {
                      transform: `translateX(${-dragProgress * 70}px) rotate(${-dragProgress * 6}deg)`,
                      transition: transitionRessort,
                    }
                  : undefined),
              }}
              onPointerDown={onPointerDownBandelette}
              onPointerMove={onPointerMoveBandelette}
              onPointerUp={onPointerUpBandelette}
              onPointerCancel={onPointerUpBandelette}
              onClick={() => etat === 'dechirure' && terminerDechirure()}
              role={etat === 'dechirure' ? 'button' : undefined}
              tabIndex={etat === 'dechirure' ? 0 : undefined}
              aria-label={etat === 'dechirure' ? 'Tear strip: drag right to left, or tap' : undefined}
              onKeyDown={(e) => {
                if (etat === 'dechirure' && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  terminerDechirure()
                }
              }}
            >
              <div className="foil-pack-shine animate-foil-shine pointer-events-none absolute -inset-x-10 -inset-y-24" aria-hidden />
              <div className="foil-crimp absolute inset-x-3 top-1.5" aria-hidden />
              <div className="foil-crimp-vert absolute inset-y-1 left-1" aria-hidden />
            </div>

            {/* Perforated seam between the strip and the body */}
            {etat !== 'ouverture' && (
              <div
                className="pointer-events-none absolute inset-x-4 top-1/4 -translate-y-1/2 border-t-2 border-dashed border-fond/50"
                aria-hidden
              />
            )}
          </div>
        )}

        {etat === 'cartes' && objetActuel && (
          <div className="perspective-dist relative w-52 sm:w-60">
            {/* Ambient pulsing glow behind legendary cards */}
            {objetActuel.rarete === 'legendaire' && (
              <div className="pointer-events-none absolute -inset-4 animate-legendary-glow rounded-3xl" aria-hidden />
            )}

            {/* The card spins into view; legendary items turn noticeably slower */}
            <div
              key={indexCarte}
              className={objetActuel.rarete === 'legendaire' ? 'animate-card-spin-in-slow' : 'animate-card-spin-in'}
            >
              <ObjetCard objet={objetActuel} onSelect={onTapCarte} />
            </div>

            {objetActuel.rarete === 'secret_rare' && (
              <div
                className="shimmer-holo pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 rotate-12 rounded-3xl blur-md animate-shimmer"
                aria-hidden
              />
            )}
            {objetActuel.rarete === 'epique' && (
              <div
                className="pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 rotate-12 rounded-3xl bg-white/30 blur-md animate-shimmer"
                aria-hidden
              />
            )}
            {objetActuel.rarete === 'legendaire' && (
              <div
                className="pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 rotate-12 rounded-3xl bg-amber-300/50 blur-md animate-shimmer"
                aria-hidden
              />
            )}
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
          {etat === 'dechirure' && 'Drag the strip right to left to tear it open ✋'}
          {etat === 'ouverture' && 'Ripping…'}
          {etat === 'cartes' && `Item ${indexCarte + 1} / ${objetsObtenus.length} — tap to continue`}
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
