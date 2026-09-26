import type { Categorie, Objet, ResultatCombat } from '@/types'

/**
 * Règle de base pierre-feuille-ciseaux : quelle catégorie bat laquelle.
 * C'est le minimum pour tester des duels ; les stats attaque/défense,
 * les objets spéciaux et les égalités avancées viendront plus tard.
 */
const BAT: Record<Categorie, Categorie> = {
  pierre: 'ciseaux',
  ciseaux: 'feuille',
  feuille: 'pierre',
}

export function resoudreCombat(mien: Objet, adverse: Objet): ResultatCombat {
  if (mien.categorie === adverse.categorie) return 'egalite'
  return BAT[mien.categorie] === adverse.categorie ? 'victoire' : 'defaite'
}

/** Phrase d'explication du résultat ("Pierre écrase Ciseaux"). */
export function expliquerCombat(mien: Objet, adverse: Objet): string {
  const resultat = resoudreCombat(mien, adverse)
  if (resultat === 'egalite') return `${mien.nom} contre ${adverse.nom} : personne ne l’emporte.`
  const [gagnant, perdant] = resultat === 'victoire' ? [mien, adverse] : [adverse, mien]
  const verbe: Record<Categorie, string> = { pierre: 'écrase', feuille: 'enveloppe', ciseaux: 'découpent' }
  return `${gagnant.nom} ${verbe[gagnant.categorie]} ${perdant.nom}.`
}
