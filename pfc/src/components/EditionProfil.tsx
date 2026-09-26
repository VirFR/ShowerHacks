import { useState, type FormEvent } from 'react'
import { useSession } from '@/lib/session'
import { PSEUDO_MAX } from '@/services/profile'
import type { Joueur } from '@/types'
import { Avatar } from './Avatar'
import { Bouton } from './Bouton'
import { Carte } from './Carte'
import { ObjetImage } from './ObjetImage'

type SourceAvatar = 'initiale' | 'carte' | 'lien'

const CHAMP =
  'w-full rounded-lg border-2 border-ink bg-carte px-3 py-2 text-sm text-texte outline-none focus-visible:ring-2 focus-visible:ring-or'

interface EditionProfilProps {
  joueur: Joueur
  onFermer: () => void
}

/** "Edit profile" form: username, and an avatar picked from the monogram, one of the player's cards, or a link. */
export function EditionProfil({ joueur, onFermer }: EditionProfilProps) {
  const { modifierProfil } = useSession()
  // One picture per owned item, in inventory order.
  const cartes = [...new Map(joueur.inventaire.filter((o) => o.imageUrl).map((o) => [o.id, o])).values()]
  const avatarCarte = cartes.some((o) => o.imageUrl === joueur.avatarUrl)

  const [pseudo, setPseudo] = useState(joueur.pseudo)
  const [source, setSource] = useState<SourceAvatar>(!joueur.avatarUrl ? 'initiale' : avatarCarte ? 'carte' : 'lien')
  const [imageCarte, setImageCarte] = useState(avatarCarte ? joueur.avatarUrl! : (cartes[0]?.imageUrl ?? ''))
  const [lien, setLien] = useState(!avatarCarte ? (joueur.avatarUrl ?? '') : '')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  const avatarUrl = source === 'carte' ? imageCarte || null : source === 'lien' ? lien.trim() || null : null

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault()
    if (enCours) return
    setErreur(null)
    setEnCours(true)
    try {
      await modifierProfil({ pseudo: pseudo.trim(), avatarUrl })
      onFermer()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Could not save your profile, try again.')
    } finally {
      setEnCours(false)
    }
  }

  const sources: { valeur: SourceAvatar; label: string }[] = [
    { valeur: 'initiale', label: 'Initial' },
    { valeur: 'carte', label: 'One of my cards' },
    { valeur: 'lien', label: 'Image link' },
  ]

  return (
    <Carte className="mt-4">
      <form onSubmit={enregistrer} className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <Avatar pseudo={pseudo.trim() || joueur.pseudo} avatarUrl={avatarUrl ?? undefined} taille="lg" />
          <div className="flex-1">
            <h2 className="text-lg font-bold">Edit profile</h2>
            <p className="text-sm text-texte-2">This is how other players see you.</p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Username</span>
          <input
            className={CHAMP}
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={PSEUDO_MAX}
            autoComplete="nickname"
            required
          />
          <span className="text-xs text-texte-2">3 to {PSEUDO_MAX} characters: letters, numbers, . _ -</span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Avatar</legend>
          <div className="flex flex-wrap gap-2" role="group">
            {sources.map((s) => (
              <button
                key={s.valeur}
                type="button"
                onClick={() => setSource(s.valeur)}
                aria-pressed={source === s.valeur}
                className={source === s.valeur ? 'chip-active' : 'chip'}
              >
                {s.label}
              </button>
            ))}
          </div>

          {source === 'carte' &&
            (cartes.length === 0 ? (
              <p className="text-sm text-texte-2">You don’t own any card yet.</p>
            ) : (
              <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto p-1 sm:grid-cols-8">
                {cartes.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setImageCarte(o.imageUrl)}
                    aria-pressed={imageCarte === o.imageUrl}
                    title={o.nom}
                    className={[
                      'sticker-bg aspect-square rounded-lg border-2 p-1 transition-all',
                      imageCarte === o.imageUrl ? 'border-ink ring-4 ring-or' : 'border-ink/40 hover:border-ink',
                    ].join(' ')}
                  >
                    <ObjetImage objet={o} className="h-full w-full" />
                  </button>
                ))}
              </div>
            ))}

          {source === 'lien' && (
            <input
              className={CHAMP}
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
            />
          )}
        </fieldset>

        {erreur && (
          <p role="alert" className="rounded-lg border border-echec/50 bg-echec/10 px-3 py-2 text-sm font-semibold text-echec">
            {erreur}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Bouton variante="fantome" onClick={onFermer} disabled={enCours}>
            Cancel
          </Bouton>
          <Bouton type="submit" disabled={enCours}>
            {enCours ? 'Saving…' : 'Save'}
          </Bouton>
        </div>
      </form>
    </Carte>
  )
}
