import { useEffect, useState } from 'react'
import { Bouton } from '@/components/Bouton'
import { Icon } from '@/components/Icon'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { BOOSTERS_MOCK, OBJETS_MOCK } from '@/mocks'
import { BOOSTER_INTERVALLE_MS, OBJETS_PAR_BOOSTER, type Objet } from '@/types'
import { formaterDuree } from '@/lib/format'

type EtatOuverture = 'idle' | 'ouverture' | 'revele'

/** /boosters — Booster stack, animated opening, countdown to the next one. */
interface EtatStack {
  actuel: number
  /** Timestamp (ms) of the next booster. */
  prochainA: number
}

const MAX = BOOSTERS_MOCK.max

export function Boosters() {
  const [stack, setStack] = useState<EtatStack>(() => ({
    actuel: BOOSTERS_MOCK.actuel,
    prochainA: new Date(BOOSTERS_MOCK.prochainA).getTime(),
  }))
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [etat, setEtat] = useState<EtatOuverture>('idle')
  const [objetsObtenus, setObjetsObtenus] = useState<Objet[]>([])

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

  const ouvrir = () => {
    if (actuel <= 0 || etat === 'ouverture') return
    setEtat('ouverture')
    setObjetsObtenus([])
    // "Shake" animation, then reveal OBJETS_PAR_BOOSTER random items (mock).
    window.setTimeout(() => {
      const tirage = Array.from(
        { length: OBJETS_PAR_BOOSTER },
        () => OBJETS_MOCK[Math.floor(Math.random() * OBJETS_MOCK.length)],
      )
      setObjetsObtenus(tirage)
      setStack((s) => ({
        actuel: Math.max(0, s.actuel - 1),
        // If the stack was full, the timer restarts from now.
        prochainA: s.actuel >= MAX ? Date.now() + BOOSTER_INTERVALLE_MS : s.prochainA,
      }))
      setEtat('revele')
    }, 900)
  }

  return (
    <>
      <PageHeader
        titre="Boosters"
        sousTitre={`A new booster every 10 minutes, ${OBJETS_PAR_BOOSTER} items per booster.`}
      />

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        {/* Opening */}
        <Carte className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div
            className={[
              'flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-2 text-7xl shadow-2xl shadow-accent/40',
              etat === 'ouverture' ? 'animate-booster-shake' : '',
            ].join(' ')}
            aria-hidden
          >
            <Icon name="gift" size={64} strokeWidth={1.5} className="text-white" />
          </div>

          {etat === 'revele' && objetsObtenus.length > 0 ? (
            <div className="animate-booster-pop w-full max-w-lg">
              <p className="mb-2 text-sm font-semibold text-accent-2">You got {objetsObtenus.length} items:</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {objetsObtenus.map((objet, i) => (
                  <ObjetCard key={`${objet.id}-${i}`} objet={objet} compact />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-texte-2">
              {actuel > 0 ? `Open a booster to discover ${OBJETS_PAR_BOOSTER} new items.` : 'No boosters left, hang on a bit.'}
            </p>
          )}

          <Bouton taille="lg" disabled={actuel <= 0 || etat === 'ouverture'} onClick={ouvrir}>
            {etat === 'ouverture' ? 'Opening…' : etat === 'revele' ? 'Open another' : 'Open'}
          </Bouton>
        </Carte>

        {/* Stack + timer */}
        <div className="flex flex-col gap-4">
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
                  <Icon name="gift" size={22} strokeWidth={1.8} />
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
      </div>
    </>
  )
}
