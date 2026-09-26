import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Bouton } from '@/components/Bouton'
import { Carte } from '@/components/Carte'
import { ConnexionRequise } from '@/components/ConnexionRequise'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { BattleCard } from '@/components/battle/BattleCard'
import { versCarte } from '@/lib/combat'
import { useSession } from '@/lib/session'
import { chargerDeck } from '@/services/deck'
import { useLobby } from '@/services/lobby'
import type { Objet } from '@/types'
import { useDemarrerBot } from './useDemarrerBot'

/** /battle/opponent — Online players, challenges, practice. */
export function OpponentPicker() {
  const { joueur } = useSession()
  if (!joueur) return <ConnexionRequise />
  return <Picker />
}

function Picker() {
  const { joueur, chart } = useSession()
  const lobby = useLobby()
  const navigate = useNavigate()
  const { demarrer, enCours, erreur: erreurBot } = useDemarrerBot()
  const [deck, setDeck] = useState<Objet[] | null | undefined>(undefined)
  const [occupe, setOccupe] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!joueur) return
    chargerDeck(joueur).then(setDeck)
  }, [joueur])

  // A challenge I sent got accepted: the battle exists, go fight.
  useEffect(() => {
    const d = lobby.defiEnvoye
    if (d?.status === 'accepted' && d.battleId) navigate(`/battle/${d.battleId}`)
  }, [lobby.defiEnvoye, navigate])

  useEffect(() => {
    if (deck === null) navigate('/battle/deck')
  }, [deck, navigate])

  const executer = async (cle: string, action: () => Promise<unknown>) => {
    setOccupe(cle)
    setErreur(null)
    try {
      return await action()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setOccupe(null)
    }
  }

  const enLigne = lobby.joueurs.filter((j) => j.enLigne)
  const horsLigne = lobby.joueurs.filter((j) => !j.enLigne)

  return (
    <>
      <Link to="/battle/deck" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-2 hover:underline">
        <Icon name="arrowLeft" size={16} />
        Back to deck
      </Link>
      <PageHeader
        titre="Choose your opponent"
        sousTitre="Only players who are online right now can accept a challenge."
        action={
          deck ? (
            <div className="flex gap-1.5" aria-label="Your deck">
              {deck.map((o) => (
                <BattleCard key={o.inventaireId ?? o.id} card={versCarte(o)} chart={chart} taille="xs" />
              ))}
            </div>
          ) : undefined
        }
      />
      {erreur && <p className="mb-4 text-sm text-echec">{erreur}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <Carte className="flex flex-col gap-1 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display font-bold">Online now</h2>
            <span className="inline-flex items-center gap-2 text-xs text-texte-2">
              <span className={`h-2 w-2 rounded-full ${lobby.enLigne ? 'bg-succes' : 'bg-texte-2'}`} />
              {lobby.enLigne ? `${enLigne.length} player${enLigne.length === 1 ? '' : 's'}` : 'offline mode'}
            </span>
          </div>

          {!lobby.enLigne && (
            <p className="rounded-xl border border-dashed border-bordure p-4 text-sm text-texte-2">
              Live challenges need the online mode (Supabase keys in <code className="text-texte">.env</code>). Fight the Coach meanwhile.
            </p>
          )}
          {lobby.enLigne && lobby.chargement && <p className="p-4 text-sm text-texte-2">Looking for players…</p>}
          {lobby.enLigne && !lobby.chargement && enLigne.length === 0 && (
            <p className="rounded-xl border border-dashed border-bordure p-4 text-sm text-texte-2">Nobody else is online. Ask a friend to open the battle page, or fight the Coach.</p>
          )}

          {enLigne.map((a) => {
            const defiPour = lobby.defiEnvoye?.status === 'pending' && lobby.defiEnvoye.to.id === a.id
            return (
              <div key={a.id} className={`flex items-center gap-4 rounded-xl border p-3 ${defiPour ? 'border-accent/60 bg-accent/10' : 'border-transparent hover:bg-carte-2'}`}>
                <Avatar pseudo={a.pseudo} avatarUrl={a.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.pseudo}</p>
                  <p className="text-xs text-texte-2">
                    {a.rang} · {a.score} pts
                  </p>
                </div>
                {defiPour ? (
                  <Bouton variante="secondaire" taille="sm" onClick={() => executer('annuler', lobby.annuler)} disabled={occupe !== null}>
                    <Icon name="clock" size={14} className="animate-pulse" />
                    Waiting… cancel
                  </Bouton>
                ) : (
                  <Bouton taille="sm" onClick={() => executer(a.id, () => lobby.defier(a.id))} disabled={occupe !== null || lobby.defiEnvoye?.status === 'pending'}>
                    <Icon name="swords" size={14} />
                    Challenge
                  </Bouton>
                )}
              </div>
            )
          })}

          {horsLigne.length > 0 && (
            <details className="mt-2 text-sm text-texte-2">
              <summary className="cursor-pointer select-none py-1 text-xs uppercase tracking-wider">
                {horsLigne.length} offline player{horsLigne.length === 1 ? '' : 's'}
              </summary>
              <div className="mt-1 flex flex-col">
                {horsLigne.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 rounded-xl p-3 opacity-60">
                    <Avatar pseudo={a.pseudo} avatarUrl={a.avatarUrl} taille="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-texte">{a.pseudo}</p>
                      <p className="text-xs">
                        {a.rang} · {a.score} pts
                      </p>
                    </div>
                    <span className="text-xs">Offline</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </Carte>

        <div className="flex flex-col gap-4">
          <Carte className="flex flex-col gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-carte-2 text-accent-2">
              <Icon name="bot" size={22} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Practice vs Coach</h2>
              <p className="mt-1 text-sm leading-relaxed text-texte-2">Nobody online? The Coach plays a balanced deck and never rage-quits. Half points.</p>
            </div>
            <Bouton variante="secondaire" onClick={demarrer} disabled={enCours || deck === undefined}>
              {enCours ? 'Starting…' : 'Start practice'}
            </Bouton>
            {erreurBot && <p className="text-xs text-echec">{erreurBot}</p>}
          </Carte>

          {lobby.defisRecus.map((d) => (
            <Carte key={d.id} className="flex flex-col gap-3 border-accent/60">
              <h2 className="font-display text-sm font-bold">Incoming challenge</h2>
              <p className="text-sm text-texte-2">
                <span className="font-semibold text-texte">{d.from.pseudo}</span> wants to fight you.
              </p>
              <div className="flex gap-2">
                <Bouton
                  className="flex-1 bg-succes text-fond hover:bg-emerald-300"
                  taille="sm"
                  disabled={occupe !== null}
                  onClick={() =>
                    executer(d.id, async () => {
                      const battleId = await lobby.accepter(d.id)
                      if (battleId) navigate(`/battle/${battleId}`)
                    })
                  }
                >
                  Accept
                </Bouton>
                <Bouton className="flex-1" variante="secondaire" taille="sm" disabled={occupe !== null} onClick={() => executer(d.id, () => lobby.refuser(d.id))}>
                  Decline
                </Bouton>
              </div>
            </Carte>
          ))}
        </div>
      </div>
    </>
  )
}
