import { useState } from 'react'
import type { Objet } from '@/types'
import { styleArtCategorie } from '@/lib/format'

interface ObjetImageProps {
  objet: Pick<Objet, 'nom' | 'imageUrl' | 'categorie'>
  className?: string
  /**
   * `tuile` (default): a rounded tile with the category gradient behind the
   * white icon. `nu`: just the icon, for a parent that paints its own art area.
   */
  variante?: 'tuile' | 'nu'
}

/** Item picture: a white glyph on the category's gradient. Falls back to the item's initial. */
export function ObjetImage({ objet, className = 'h-16 w-16', variante = 'tuile' }: ObjetImageProps) {
  const [erreur, setErreur] = useState(false)

  const glyphe = erreur ? (
    <span className="font-display text-2xl font-bold text-white" aria-hidden>
      {objet.nom.charAt(0).toUpperCase()}
    </span>
  ) : (
    <img
      src={objet.imageUrl}
      alt={objet.nom}
      className="h-[64%] w-[64%] object-contain drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]"
      onError={() => setErreur(true)}
      draggable={false}
    />
  )

  if (variante === 'nu') {
    return (
      <div className={`flex items-center justify-center ${className}`} role={erreur ? 'img' : undefined} aria-label={erreur ? objet.nom : undefined}>
        {glyphe}
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-ink ${className}`}
      style={styleArtCategorie(objet.categorie)}
      role={erreur ? 'img' : undefined}
      aria-label={erreur ? objet.nom : undefined}
    >
      {glyphe}
    </div>
  )
}
