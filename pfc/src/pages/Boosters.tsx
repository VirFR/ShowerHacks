import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { RARETE_PONDERATION, tirerObjetPondere } from '@/lib/boosters'
import { formaterDuree, LIBELLE_RARETE, ORDRE_RARETE } from '@/lib/format'
import { useSession } from '@/lib/session'
import { BOOSTERS_MOCK, OBJETS_BOOSTER_MOCK } from '@/mocks'
import { BOOSTER_INTERVALLE_MS, OBJETS_PAR_BOOSTER, type Objet, type Rarete } from '@/types'

/** The two rarest tiers get the slower, more dramatic spin-in. */
const SPIN_LENT: Partial<Record<Rarete, true>> = { legendaire: true, secret_rare: true }

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

/** Drop odds shown on the back of the pack, lowest rarity first. */
const TOTAL_PONDERATION = Object.values(RARETE_PONDERATION).reduce((somme, poids) => somme + poids, 0)
const CHANCES_RARETE = (Object.entries(RARETE_PONDERATION) as [Rarete, number][])
  .sort((a, b) => ORDRE_RARETE[a[0]] - ORDRE_RARETE[b[0]])
  .map(([rarete, poids]) => ({ rarete, pourcentage: Math.round((poids / TOTAL_PONDERATION) * 1000) / 10 }))

/** Fraction of the strip's drag distance restored per Enter/Space press (keyboard fallback). */
const PAS_CLAVIER = 0.34

export function Boosters() {
  const { joueur, ajouterObjets } = useSession()
  const [stack, setStack] = useState<EtatStack>(() => ({
    actuel: BOOSTERS_MOCK.actuel,
    prochainA: new Date(BOOSTERS_MOCK.prochainA).getTime(),
  }))
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [etat, setEtat] = useState<EtatOuverture>('idle')
  const [objetsObtenus, setObjetsObtenus] = useState<Objet[]>([])
  const [indexCarte, setIndexCarte] = useState(0)
  /** Save state of the last draw: the cards only count once they're in the inventory. */
  const [sauvegarde, setSauvegarde] = useState<'ok' | 'en_cours' | 'echec'>('ok')
  /** Pack flipped over to inspect its back (only while idle, before arming the tear). */
  const [retourne, setRetourne] = useState(false)

  const [dragProgress, setDragProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef<number | null>(null)
  /** Tear progress at the start of the current grab, so releasing the strip doesn't undo it. */
  const progressDepart = useRef(0)
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
    setRetourne(false)
    progressDepart.current = 0
    setDragProgress(0)
    setEtat('dechirure')
  }

  /** Saves a draw to the inventory; on failure the player can retry the same cards. */
  const sauvegarder = (tirage: Objet[]) => {
    setSauvegarde('en_cours')
    ajouterObjets(tirage).then(
      () => setSauvegarde('ok'),
      () => setSauvegarde('echec'),
    )
  }

  /** Finishes the tear once it's fully torn (drag progress reached 1): draws the items. */
  const terminerDechirure = () => {
    if (dechirureEnCours.current) return
    dechirureEnCours.current = true
    setEtat('ouverture')
    window.setTimeout(() => {
      const tirage = Array.from({ length: OBJETS_PAR_BOOSTER }, () => tirerObjetPondere(OBJETS_BOOSTER_MOCK))
      setObjetsObtenus(tirage)
      setIndexCarte(0)
      sauvegarder(tirage)
      setStack((s) => ({
        actuel: Math.max(0, s.actuel - 1),
        // If the stack was full, the timer restarts from now.
        prochainA: s.actuel >= MAX ? Date.now() + BOOSTER_INTERVALLE_MS : s.prochainA,
      }))
      setEtat('cartes')
      dechirureEnCours.current = false
    }, 480)
  }

  /** The strip can be grabbed straight from idle: no need to press "Open" first. */
  const peutDechirer = (e: EtatOuverture) => e === 'idle' || e === 'dechirure'

  const onPointerDownBandelette = (e: PointerEvent<HTMLDivElement>) => {
    if (!peutDechirer(etat) || actuel <= 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartX.current = e.clientX
    progressDepart.current = dragProgress
    setIsDragging(true)
  }

  /**
   * Only a right-to-left drag adds progress; pulling the other way gives it back.
   * Progress builds on top of `progressDepart`, so releasing and re-grabbing the
   * strip (several back-and-forths) keeps what was already torn instead of resetting it.
   * The first bit of real movement is what actually arms the booster (from idle).
   */
  const onPointerMoveBandelette = (e: PointerEvent<HTMLDivElement>) => {
    if (!peutDechirer(etat) || dragStartX.current === null) return
    const dx = dragStartX.current - e.clientX
    const nouvelleProgression = Math.min(1, Math.max(0, progressDepart.current + dx / SEUIL_DECHIRURE_PX))
    if (etat === 'idle' && nouvelleProgression > 0) {
      setRetourne(false)
      setEtat('dechirure')
    }
    setDragProgress(nouvelleProgression)
    if (nouvelleProgression >= 1) {
      dragStartX.current = null
      setIsDragging(false)
      terminerDechirure()
    }
  }

  /** Releasing the strip before it's fully torn keeps the current progress: it isn't lost. */
  const onPointerUpBandelette = () => {
    if (dragStartX.current === null) return
    dragStartX.current = null
    setIsDragging(false)
  }

  /** Keyboard fallback: each Enter/Space press pulls the strip a bit further, arming it from idle if needed. */
  const avancerDechirureClavier = () => {
    if (!peutDechirer(etat) || actuel <= 0) return
    if (etat === 'idle') setRetourne(false)
    setEtat('dechirure')
    const suivant = Math.min(1, dragProgress + PAS_CLAVIER)
    setDragProgress(suivant)
    if (suivant >= 1) terminerDechirure()
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

  if (!joueur) return <ConnexionRequise />

  return (
    <>
      <PageHeader
        titre="Boosters"
        sousTitre={`A new booster every 10 minutes, ${OBJETS_PAR_BOOSTER} cards per booster.`}
      />

      {/* Opening: the booster floats front and center, no card chrome around it */}
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        {(etat === 'idle' || etat === 'dechirure' || etat === 'ouverture') && (
          <div
            className={`relative h-72 w-52 sm:h-80 sm:w-60 ${etat === 'idle' ? 'animate-pack-float' : ''}`}
            style={{ perspective: '1200px' }}
          >
            {/* Ambient glow, which grows further while tearing */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl bg-or blur-2xl transition-opacity"
              style={{ opacity: etat === 'dechirure' ? 0.25 + dragProgress * 0.65 : etat === 'ouverture' ? 0.9 : 0.25 }}
              aria-hidden
            />

            {/* Flip wrapper: while idle, tap the pack to inspect its back before opening it */}
            <div
              className={`absolute inset-0 ${etat === 'idle' ? 'cursor-pointer' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 500ms cubic-bezier(0.4, 0.1, 0.2, 1)',
                transform: retourne ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
              onClick={() => etat === 'idle' && setRetourne((r) => !r)}
              role={etat === 'idle' ? 'button' : undefined}
              tabIndex={etat === 'idle' ? 0 : undefined}
              aria-label={
                etat === 'idle'
                  ? retourne
                    ? 'Back of the booster. Tap to flip back to the front.'
                    : 'Tap to flip the booster and inspect its back.'
                  : undefined
              }
              onKeyDown={(e) => {
                if (etat === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  setRetourne((r) => !r)
                }
              }}
            >
              {/* Front face: the pack as it gets torn open */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                {/* Body: the big lower 3/4 of the pack, stays put */}
                <div className="foil-pack absolute inset-x-0 bottom-0 h-3/4 overflow-hidden rounded-b-xl shadow-2xl shadow-black/50 ring-1 ring-white/40">
                  <div className="foil-crimp absolute inset-x-3 bottom-1.5" aria-hidden />
                  <div className="foil-crimp-vert absolute inset-y-2 left-1" aria-hidden />
                  <div className="foil-crimp-vert absolute inset-y-2 right-1" aria-hidden />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink" aria-hidden>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-ink/70">RPS Booster</span>
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
                  role={peutDechirer(etat) && actuel > 0 ? 'button' : undefined}
                  tabIndex={peutDechirer(etat) && actuel > 0 ? 0 : undefined}
                  aria-label={
                    peutDechirer(etat) && actuel > 0
                      ? `Tear strip, ${Math.round(dragProgress * 100)}% torn: drag right to left, you can let go and pull again`
                      : undefined
                  }
                  onKeyDown={(e) => {
                    if (peutDechirer(etat) && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      avancerDechirureClavier()
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
                    className="pointer-events-none absolute inset-x-4 top-1/4 -translate-y-1/2 border-t-2 border-dashed border-ink/50"
                    aria-hidden
                  />
                )}
              </div>

              {/* Back face: drop odds, only reachable by flipping the pack while idle */}
              <div
                className="foil-pack absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl p-4 text-center text-ink shadow-2xl shadow-black/50 ring-1 ring-white/40"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-xs font-black uppercase tracking-[0.3em] text-ink/70">Drop odds</span>
                <ul className="mt-1 w-full max-w-[10.5rem] space-y-1 text-xs">
                  {CHANCES_RARETE.map(({ rarete, pourcentage }) => (
                    <li key={rarete} className="flex items-center justify-between gap-2">
                      <span className="font-medium">{LIBELLE_RARETE[rarete]}</span>
                      <span className="font-black tabular-nums">{pourcentage}%</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-1 text-[0.65rem] text-ink/60">{OBJETS_PAR_BOOSTER} cards per pack</span>
              </div>
            </div>
          </div>
        )}

        {etat === 'cartes' && objetActuel && (
          <div className="perspective-dist relative w-52 sm:w-60">
            {/* Static glow behind rare-and-up cards: fixed in place, highlights
                the whole card, no sweep or pulse */}
            {objetActuel.rarete !== 'commun' && objetActuel.rarete !== 'peu_commun' && (
              <div
                className={`pointer-events-none absolute -inset-10 rounded-3xl rarity-glow rarity-glow-${
                  objetActuel.rarete === 'secret_rare' ? 'secret' : objetActuel.rarete
                }`}
                aria-hidden
              />
            )}

            {/* The card spins into view; the two rarest tiers turn noticeably slower */}
            <div key={indexCarte} className={SPIN_LENT[objetActuel.rarete] ? 'animate-card-spin-in-slow' : 'animate-card-spin-in'}>
              <ObjetCard objet={objetActuel} onSelect={onTapCarte} />
            </div>
          </div>
        )}

        {etat === 'revele' && objetsObtenus.length > 0 && (
          <div className="animate-booster-pop w-full max-w-lg">
            <p className="mb-2 text-sm font-semibold text-accent-2">You got {objetsObtenus.length} cards:</p>
            {sauvegarde === 'echec' && (
              <div role="alert" className="mb-3 rounded-2xl border border-echec/50 bg-echec/10 p-3 text-center text-sm">
                <p className="font-semibold text-echec">These cards couldn’t be saved to your inventory.</p>
                <Bouton taille="sm" variante="secondaire" className="mt-2" onClick={() => sauvegarder(objetsObtenus)}>
                  Try again
                </Bouton>
              </div>
            )}
            {sauvegarde === 'en_cours' && <p className="mb-2 text-xs text-texte-2">Saving to your inventory…</p>}
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
              ? 'Tap to flip it over, or drag the top strip right to left to tear it open ✋'
              : 'No boosters left, hang on a bit.')}
          {etat === 'dechirure' &&
            (dragProgress > 0
              ? 'Keep dragging right to left — let go and grab it again if you need to ✋'
              : 'Drag the strip right to left to tear it open ✋')}
          {etat === 'ouverture' && 'Ripping…'}
          {etat === 'cartes' && `Card ${indexCarte + 1} / ${objetsObtenus.length} — tap to continue`}
        </p>

        {(etat === 'idle' || etat === 'revele') && (
          <Bouton taille="lg" disabled={actuel <= 0 || sauvegarde === 'en_cours'} onClick={commencerOuverture}>
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
            {Array.from({ length: MAX }, (_, i) =>
              i < actuel ? (
                <div
                  key={i}
                  className="foil-pack relative aspect-square overflow-hidden rounded-md shadow-md shadow-accent/30 ring-1 ring-white/40 transition-all"
                  aria-hidden
                >
                  <div className="absolute inset-x-0 top-[30%] border-t border-dashed border-ink/40" aria-hidden />
                </div>
              ) : (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-dashed border-bordure bg-fond/40 opacity-50 transition-all"
                  aria-hidden
                />
              ),
            )}
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
