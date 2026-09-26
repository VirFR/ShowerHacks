import { useEffect, useState } from 'react'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ObjetCard } from '@/components/ObjetCard'
import { PageHeader } from '@/components/PageHeader'
import { BOOSTERS_MOCK, OBJETS_MOCK } from '@/mocks'
import { BOOSTER_INTERVALLE_MS, type Objet } from '@/types'
import { formaterDuree } from '@/lib/format'

type EtatOuverture = 'idle' | 'ouverture' | 'revele'

/** /boosters — Stack de boosters, ouverture animée, timer avant le prochain. */
interface EtatStack {
  actuel: number
  /** Timestamp (ms) du prochain booster. */
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
  const [objetObtenu, setObjetObtenu] = useState<Objet | null>(null)

  const { actuel, prochainA } = stack
  const plein = actuel >= MAX

  // Tick du timer (1 s). Quand le compte à rebours atteint 0, +1 booster (mock).
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
    setObjetObtenu(null)
    // Animation "shake" puis révélation d'un objet aléatoire (mock).
    window.setTimeout(() => {
      const tirage = OBJETS_MOCK[Math.floor(Math.random() * OBJETS_MOCK.length)]
      setObjetObtenu(tirage)
      setStack((s) => ({
        actuel: Math.max(0, s.actuel - 1),
        // Si le stack était plein, le timer repart de maintenant.
        prochainA: s.actuel >= MAX ? Date.now() + BOOSTER_INTERVALLE_MS : s.prochainA,
      }))
      setEtat('revele')
    }, 900)
  }

  return (
    <>
      <PageHeader titre="Boosters" sousTitre="Un nouveau booster toutes les 10 minutes." />

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        {/* Ouverture */}
        <Carte className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div
            className={[
              'flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-2 text-7xl shadow-2xl shadow-accent/40',
              etat === 'ouverture' ? 'animate-booster-shake' : '',
            ].join(' ')}
            aria-hidden
          >
            🎁
          </div>

          {etat === 'revele' && objetObtenu ? (
            <div className="animate-booster-pop w-full max-w-xs">
              <p className="mb-2 text-sm font-semibold text-accent-2">Tu as obtenu :</p>
              <ObjetCard objet={objetObtenu} />
            </div>
          ) : (
            <p className="text-sm text-texte-2">
              {actuel > 0 ? 'Ouvre un booster pour découvrir un nouvel objet.' : 'Plus de booster disponible, patiente un peu.'}
            </p>
          )}

          <Bouton taille="lg" disabled={actuel <= 0 || etat === 'ouverture'} onClick={ouvrir}>
            {etat === 'ouverture' ? 'Ouverture…' : etat === 'revele' ? 'Ouvrir un autre' : 'Ouvrir'}
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
            <div className="mt-3 grid grid-cols-5 gap-2" aria-label={`${actuel} boosters sur ${MAX}`}>
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
            <h2 className="font-semibold">Prochain booster</h2>
            {plein ? (
              <p className="mt-2 text-sm text-or">Stack plein ! Ouvre un booster pour relancer le timer.</p>
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
