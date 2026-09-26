import { Carte } from '@/components/Carte'
import { PageHeader } from '@/components/PageHeader'
import { CLASSEMENT_MOCK } from '@/mocks'
import { useSession } from '@/lib/session'
import { formaterPourcentage } from '@/lib/format'

const MEDAILLES = ['🥇', '🥈', '🥉']

/** /classement — Tableau des joueurs par score. */
export function Classement() {
  const { joueur } = useSession()

  return (
    <>
      <PageHeader titre="Classement" sousTitre={`${CLASSEMENT_MOCK.length} joueurs classés`} />

      <Carte className="overflow-x-auto p-0 md:p-0">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-bordure text-left text-xs uppercase tracking-wider text-texte-2">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Joueur</th>
              <th className="px-4 py-3 text-right font-medium">Score</th>
              <th className="px-4 py-3 text-right font-medium">Parties</th>
              <th className="px-4 py-3 text-right font-medium">Victoires</th>
              <th className="px-4 py-3 text-right font-medium">Ratio</th>
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
                    moi ? 'bg-accent/15 font-semibold' : 'hover:bg-carte-2',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 tabular-nums">
                    {MEDAILLES[e.position - 1] ?? e.position}
                  </td>
                  <td className="px-4 py-3">
                    {e.pseudo}
                    {moi && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] text-white">Toi</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.score.toLocaleString('fr-FR')}</td>
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
