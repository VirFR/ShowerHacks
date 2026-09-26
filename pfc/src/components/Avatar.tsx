interface AvatarProps {
  pseudo: string
  avatarUrl?: string
  taille?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAILLES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-24 w-24 text-4xl',
}

/** Player avatar: the Google picture when there is one, else a monogram. */
export function Avatar({ pseudo, avatarUrl, taille = 'md', className = '' }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full border-2 border-ink object-cover ${TAILLES[taille]} ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-gradient-to-br from-accent to-defense font-display font-bold text-white shadow-hard-sm ${TAILLES[taille]} ${className}`}
      aria-hidden
    >
      {pseudo.charAt(0).toUpperCase()}
    </div>
  )
}
