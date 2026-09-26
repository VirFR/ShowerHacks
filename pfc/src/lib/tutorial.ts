/**
 * First-login warm-up: classic rock-paper-scissors, best of three, against
 * the Coach. The Coach receives the player's throw before choosing, and
 * follows a script that lets the player win narrowly: player, Coach,
 * player. Draws are replayed so the script always completes in three
 * decisive rounds.
 */

export type Throw = 'rock' | 'paper' | 'scissors'
export const THROWS: Throw[] = ['rock', 'paper', 'scissors']

const BEATS: Record<Throw, Throw> = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
const LOSES_TO: Record<Throw, Throw> = { rock: 'paper', paper: 'scissors', scissors: 'rock' }

export type RoundResult = 'player' | 'coach' | 'draw'

export interface TutorialRound {
  player: Throw
  coach: Throw
  result: RoundResult
}

export interface TutorialState {
  rounds: TutorialRound[]
  /** Decisive rounds won by each side. */
  score: { player: number; coach: number }
  finished: boolean
}

/** Script of decisive outcomes, in order. */
export const SCRIPT: RoundResult[] = ['player', 'coach', 'player']

export function createTutorial(): TutorialState {
  return { rounds: [], score: { player: 0, coach: 0 }, finished: false }
}

/** The Coach's answer for the next scripted outcome. */
export function coachThrow(playerThrow: Throw, wanted: RoundResult): Throw {
  if (wanted === 'player') return BEATS[playerThrow]
  if (wanted === 'coach') return LOSES_TO[playerThrow]
  return playerThrow
}

export function judge(player: Throw, coach: Throw): RoundResult {
  if (player === coach) return 'draw'
  return BEATS[player] === coach ? 'player' : 'coach'
}

export function playRound(state: TutorialState, player: Throw): TutorialState {
  if (state.finished) return state
  const decisive = state.score.player + state.score.coach
  const wanted = SCRIPT[decisive]
  const coach = coachThrow(player, wanted)
  const result = judge(player, coach)
  const score = {
    player: state.score.player + (result === 'player' ? 1 : 0),
    coach: state.score.coach + (result === 'coach' ? 1 : 0),
  }
  return {
    rounds: [...state.rounds, { player, coach, result }],
    score,
    finished: score.player + score.coach >= SCRIPT.length,
  }
}

/** What the Coach says before each decisive round and after each result. */
export const COACH_LINES = {
  intro: ['Before you touch a real deck, show me the basics. Rock, paper or scissors?', 'Not bad. Again. I am warming up too.', 'Last one. Beat me and your first booster is yours.'],
  afterPlayerWin: ['You got me. Beginner luck, obviously.', 'Fine. That one counts.', 'You win. Go open that booster before I change my mind.'],
  afterCoachWin: ['Told you I was warming up.', 'See? I can play too.', 'That is one for me.'],
  afterDraw: ['Same throw. Go again.', 'Copying me will not work.', 'Draw. One more.'],
}

/** Why the winning throw beats the other one, e.g. "Rock crushes Scissors". */
export const RULES: Record<Throw, string> = { rock: 'Rock crushes Scissors', paper: 'Paper covers Rock', scissors: 'Scissors cut Paper' }

export function explainRound(round: TutorialRound): string {
  if (round.result === 'draw') return 'Same throw: nobody wins.'
  return round.result === 'player' ? RULES[round.player] : RULES[round.coach]
}

/** What the Coach says right after the last round, while the result is on screen. */
export function coachReaction(state: TutorialState): string {
  const last = state.rounds[state.rounds.length - 1]
  if (!last) return ''
  if (last.result === 'draw') return COACH_LINES.afterDraw[Math.min(state.rounds.length - 1, 2)]
  if (state.finished) return COACH_LINES.afterPlayerWin[2]
  const idx = Math.min(state.score.player + state.score.coach - 1, 2)
  return last.result === 'player' ? COACH_LINES.afterPlayerWin[idx] : COACH_LINES.afterCoachWin[idx]
}

/** What the Coach says before the next throw. */
export function coachIntro(state: TutorialState): string {
  return COACH_LINES.intro[Math.min(state.score.player + state.score.coach, 2)]
}
