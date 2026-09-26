import { useState } from 'react'
import { useSession } from '@/lib/session'
import { Bouton } from './Bouton'
import { GoogleMark, Icon } from './Icon'
import { ListeComptes } from './ListeComptes'

/** Screen shown by pages that need a signed-in player. */
export function ConnexionRequise({ message = 'This page needs your account.' }: { message?: string }) {
  const { connecterGoogle, mode, comptes, connecter: connecterCompte } = useSession()
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const connecter = async () => {
    setEnCours(true)
    setErreur(null)
    try {
      await connecterGoogle()
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Sign-in failed.')
      setEnCours(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-bordure px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-carte text-accent-2">
        <Icon name="lock" size={26} />
      </span>
      <h2 className="font-display text-xl font-bold">{mode === 'mock' ? 'Who are you?' : 'Sign in to continue'}</h2>
      <p className="max-w-sm text-sm text-texte-2">{message} You can still browse the rest of the site.</p>
      {mode === 'mock' ? (
        <div className="w-full max-w-xl">
          <ListeComptes comptes={comptes} onChoisir={connecterCompte} />
        </div>
      ) : (
        <Bouton onClick={connecter} disabled={enCours} variante="clair">
          <GoogleMark />
          {enCours ? 'Redirecting…' : 'Continue with Google'}
        </Bouton>
      )}
      {erreur && <p className="text-xs text-echec">{erreur}</p>}
    </div>
  )
}
