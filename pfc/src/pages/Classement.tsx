import { Carte } from '@/components/Carte'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { CLASSEMENT_MOCK } from '@/mocks'
import { useSession } from '@/lib/session'
import { formaterNombre, formaterPourcentage } from '@/lib/format'

const MEDAILLES = ['text-or', 'text-slate-500', 'text-amber-700']

/** /leaderboard — Players ranked by score. */
export function Classement() {
  const { joueur } = useSession()

  return (
    <>
      <PageHeader titre="Leaderboard" sousTitre={`${CLASSEMENT_MOCK.length} ranked players`} />

      <Carte className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b-2 border-ink bg-carte-2 text-left text-xs font-extrabold uppercase tracking-wider text-texte-2">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 text-right font-medium">Score</th>
              <th className="px-4 py-3 text-right font-medium">Games</th>
              <th className="px-4 py-3 text-right font-medium">Wins</th>
              <th className="px-4 py-3 text-right font-medium">Win rate</th>
            </tr>
          </thead>
          <tbody>
            {CLASSEMENT_MOCK.map((e) => {
              const moi = e.joueurId === joueur?.id
              return (
                <tr
                  key={e.joueurId}
                  className={[
                    'border-b border-bordure/60 last:border-b-0',
                    moi ? 'bg-amber-100 font-bold' : 'odd:bg-carte even:bg-carte-2/60 hover:bg-sky-50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 tabular-nums">
                    {MEDAILLES[e.position - 1] ? (
                      <span className={`inline-flex items-center gap-1 ${MEDAILLES[e.position - 1]}`}>
                        <Icon name="medal" size={16} />
                        {e.position}
                      </span>
                    ) : (
                      e.position
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.pseudo}
                    {moi && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] text-white">You</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formaterNombre(e.score)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.nbParties}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.nbVictoires}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex items-center gap-2">
                      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-fond sm:inline-block">
                        <span className="block h-full bg-succes" style={{ width: `${e.ratio * 100}%` }} />
                      </span>
                      {formaterPourcentage(e.ratio)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Carte>
    </>
  )
}
