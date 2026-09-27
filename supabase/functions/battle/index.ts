// PFC · `battle` edge function. Owns the hidden hands and runs the engine.
//
// POST { action, ...payload } with the user's JWT in Authorization.
//   create   { kind: 'bot' }                 -> { id }
//   get      { battleId }                    -> Battle (public state + my hand)
//   move     { battleId, move }              -> { ok }
//   timeout  { battleId }                    -> { ok }   (forces a stalled opponent)
//   forfeit  { battleId }                    -> { ok }
//   challenge{ toUser }                      -> { id }
//   accept   { challengeId }                 -> { battleId }
//   decline  { challengeId }                 -> { ok }
//
// Deploy: `supabase functions deploy battle --project-ref <ref>` from the
// repository root (the engine is imported from ../_shared/engine, a copy of
// pfc/src/lib/engine kept in sync by `node scripts/sync-engine.mjs`).

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import {
  botDeck,
  botMove,
  computeReward,
  createBattle,
  fallbackMove,
  isLegal,
  normalizeRarity,
  publicView,
  resolveTurn,
  type BattleState,
  type Chart,
  type EngineCard,
  type FullState,
  type Move,
  type Side,
} from '../_shared/engine/index.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const BOT_ID = '00000000-0000-0000-0000-000000000000'
const TURN_TIMEOUT_MS = 30_000
const CHALLENGE_TTL_MS = 90_000

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

interface ProfileRow {
  id: string
  username: string
  avatar_url: string | null
  score: number
  win_streak: number
  last_win_at: string | null
}

interface BattleRow {
  id: string
  kind: 'pvp' | 'bot'
  player_a: string
  player_b: string | null
  status: 'waiting' | 'active' | 'finished'
  turn: number
  state: BattleState
  winner: string | null
  updated_at: string
}

interface SecretRow {
  battle_id: string
  user_id: string
  side: Side
  hand: EngineCard[]
  pending_move: Move | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const auth = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) throw new HttpError(401, 'Not signed in.')
    const uid = userData.user.id
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const body = await req.json().catch(() => ({}))
    const action = String(body.action ?? '')

    switch (action) {
      case 'create':
        return json(await createBotBattle(admin, uid))
      case 'get':
        return json(await getBattle(admin, uid, String(body.battleId)))
      case 'move':
        return json(await submitMove(admin, uid, String(body.battleId), body.move as Move))
      case 'timeout':
        return json(await forceTimeout(admin, uid, String(body.battleId)))
      case 'forfeit':
        return json(await forfeit(admin, uid, String(body.battleId)))
      case 'challenge':
        return json(await challenge(admin, uid, String(body.toUser)))
      case 'accept':
        return json(await accept(admin, uid, String(body.challengeId)))
      case 'decline':
        return json(await decline(admin, uid, String(body.challengeId)))
      default:
        throw new HttpError(400, `Unknown action "${action}".`)
    }
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    return json({ error: e instanceof Error ? e.message : String(e) }, status)
  }
})

/* ---------- helpers ---------- */

async function loadChart(admin: SupabaseClient): Promise<Chart> {
  const [{ data: cats }, { data: pairs }] = await Promise.all([
    admin.from('categories').select('slug, label, verb'),
    admin.from('category_matchups').select('winner, loser'),
  ])
  const chart: Chart = { beats: {}, verbs: {}, labels: {} }
  for (const c of (cats ?? []) as { slug: string; label: string; verb: string | null }[]) {
    chart.beats[c.slug] = []
    chart.labels![c.slug] = c.label
    if (c.verb) chart.verbs![c.slug] = c.verb
  }
  for (const p of (pairs ?? []) as { winner: string; loser: string }[]) {
    ;(chart.beats[p.winner] ??= []).push(p.loser)
  }
  return chart
}

interface ItemRow {
  id: string
  name: string
  category: string
  attack: number
  defense: number
  image_url: string | null
  rarity: string
  explicit_wins: string[] | null
}

const toCard = (invId: string, item: ItemRow): EngineCard => ({
  id: invId,
  itemId: item.id,
  explicitWins: item.explicit_wins ?? undefined,
  name: item.name,
  category: item.category,
  attack: item.attack,
  defense: item.defense,
  imageUrl: item.image_url ?? undefined,
  rarity: normalizeRarity(item.rarity),
})

/** Snapshot of a player's saved deck as engine cards. */
async function loadDeck(admin: SupabaseClient, uid: string): Promise<EngineCard[]> {
  const { data: deck } = await admin.from('decks').select('inventory_ids').eq('owner', uid).maybeSingle()
  const ids = (deck?.inventory_ids as string[] | undefined) ?? []
  if (ids.length !== 5) throw new HttpError(400, 'Save a deck of 5 cards first.')
  const { data: rows } = await admin.from('inventory').select('id, owner, item:items(*)').in('id', ids)
  const cards = ((rows ?? []) as unknown as { id: string; owner: string; item: ItemRow | null }[])
    .filter((r) => r.owner === uid && r.item)
    .map((r) => toCard(r.id, r.item as ItemRow))
  if (cards.length !== 5) throw new HttpError(400, 'Your deck refers to cards you no longer own.')
  return ids.map((id) => cards.find((c) => c.id === id)!)
}

async function catalogCards(admin: SupabaseClient): Promise<EngineCard[]> {
  const { data } = await admin.from('items').select('*')
  return ((data ?? []) as ItemRow[]).map((it) => toCard(it.id, it))
}

async function profile(admin: SupabaseClient, id: string): Promise<ProfileRow> {
  const { data } = await admin.from('profiles').select('id, username, avatar_url, score, win_streak, last_win_at').eq('id', id).maybeSingle()
  if (!data) throw new HttpError(404, 'Profile not found.')
  return data as ProfileRow
}

const COACH = { id: BOT_ID, pseudo: 'Coach', score: 0, rang: 'Bronze', enLigne: true }
const rank = (score: number) =>
  score >= 4000 ? 'Master' : score >= 2000 ? 'Diamond' : score >= 1000 ? 'Platinum' : score >= 500 ? 'Gold' : score >= 200 ? 'Silver' : 'Bronze'
const adversaire = (p: ProfileRow) => ({ id: p.id, pseudo: p.username, avatarUrl: p.avatar_url ?? undefined, score: p.score, rang: rank(p.score), enLigne: true })

async function battleRow(admin: SupabaseClient, id: string): Promise<BattleRow> {
  const { data } = await admin.from('battles').select('*').eq('id', id).maybeSingle()
  if (!data) throw new HttpError(404, 'Battle not found.')
  return data as BattleRow
}

async function secrets(admin: SupabaseClient, battleId: string): Promise<Record<Side, SecretRow>> {
  const { data } = await admin.from('battle_secrets').select('*').eq('battle_id', battleId)
  const rows = (data ?? []) as SecretRow[]
  const a = rows.find((r) => r.side === 'a')
  const b = rows.find((r) => r.side === 'b')
  if (!a || !b) throw new HttpError(500, 'Battle secrets missing.')
  return { a, b }
}

function sideOf(b: BattleRow, uid: string): Side {
  if (b.player_a === uid) return 'a'
  if (b.player_b === uid) return 'b'
  throw new HttpError(403, 'Not your battle.')
}

function fullState(b: BattleRow, s: Record<Side, SecretRow>): FullState {
  return { ...b.state, hands: { a: s.a.hand, b: s.b.hand } }
}

/* ---------- actions ---------- */

async function createBotBattle(admin: SupabaseClient, uid: string) {
  const deck = await loadDeck(admin, uid)
  const catalog = await catalogCards(admin)
  const state = createBattle(deck, botDeck(catalog, Math.random, 'coach'))
  const pub = publicView(state)
  const { data: row, error } = await admin
    .from('battles')
    .insert({ kind: 'bot', player_a: uid, player_b: null, status: 'active', turn: 1, state: pub })
    .select('id')
    .single()
  if (error) throw error
  await admin.from('battle_secrets').insert([
    { battle_id: row.id, user_id: uid, side: 'a', hand: state.hands.a },
    { battle_id: row.id, user_id: BOT_ID, side: 'b', hand: state.hands.b },
  ])
  return { id: row.id }
}

async function getBattle(admin: SupabaseClient, uid: string, battleId: string) {
  const b = await battleRow(admin, battleId)
  const side = sideOf(b, uid)
  const { data: secret } = await admin.from('battle_secrets').select('hand').eq('battle_id', battleId).eq('side', side).maybeSingle()
  const me = await profile(admin, uid)
  const otherId = side === 'a' ? b.player_b : b.player_a
  const opponent = b.kind === 'bot' || !otherId ? COACH : adversaire(await profile(admin, otherId))
  const { data: reward } = await admin.from('battle_rewards').select('*').eq('battle_id', battleId).eq('user_id', uid).maybeSingle()
  return {
    id: b.id,
    kind: b.kind,
    mySide: side,
    me: adversaire(me),
    opponent,
    status: b.status,
    state: b.state,
    hand: (secret?.hand as EngineCard[] | undefined) ?? [],
    reward: reward
      ? { result: reward.result, points: reward.points, boosters: reward.boosters, tier: reward.tier, breakdown: reward.breakdown, bonusBooster: reward.bonus_booster }
      : undefined,
    updatedAt: b.updated_at,
  }
}

async function submitMove(admin: SupabaseClient, uid: string, battleId: string, move: Move) {
  const b = await battleRow(admin, battleId)
  if (b.status !== 'active') throw new HttpError(409, 'Battle is over.')
  const side = sideOf(b, uid)
  const s = await secrets(admin, battleId)
  const state = fullState(b, s)
  if (!move || !isLegal(state, side, move)) throw new HttpError(400, 'Illegal move.')
  if (s[side].pending_move) throw new HttpError(409, 'Move already locked in.')

  const other: Side = side === 'a' ? 'b' : 'a'
  let otherMove = s[other].pending_move
  if (b.kind === 'bot') otherMove = botMove(await loadChart(admin), state, other, Math.random)

  if (!otherMove) {
    // Lock my move and tell the opponent (public flag only).
    await admin.from('battle_secrets').update({ pending_move: move }).eq('battle_id', battleId).eq('side', side)
    const pub = structuredClone(b.state)
    pub.sides[side].submitted = true
    await admin.from('battles').update({ state: pub, updated_at: new Date().toISOString() }).eq('id', battleId)
    return { ok: true, waiting: true }
  }

  await resolve(admin, b, s, { [side]: move, [other]: otherMove } as Record<Side, Move>)
  return { ok: true }
}

async function resolve(admin: SupabaseClient, b: BattleRow, s: Record<Side, SecretRow>, moves: Record<Side, Move>) {
  const chart = await loadChart(admin)
  const next = resolveTurn(chart, fullState(b, s), moves)
  const pub = publicView(next)
  const finished = next.status === 'finished'
  const winnerId = finished ? (next.winner === 'a' ? b.player_a : next.winner === 'b' ? b.player_b : null) : null

  await admin.from('battle_secrets').update({ hand: next.hands.a, pending_move: null }).eq('battle_id', b.id).eq('side', 'a')
  await admin.from('battle_secrets').update({ hand: next.hands.b, pending_move: null }).eq('battle_id', b.id).eq('side', 'b')

  if (finished) {
    await applyRewards(admin, b, pub)
  }
  await admin
    .from('battles')
    .update({
      state: pub,
      turn: next.turn,
      status: finished ? 'finished' : 'active',
      winner: winnerId,
      updated_at: new Date().toISOString(),
      finished_at: finished ? new Date().toISOString() : null,
    })
    .eq('id', b.id)
}

async function applyRewards(admin: SupabaseClient, b: BattleRow, state: BattleState) {
  const players: [Side, string | null][] = [
    ['a', b.player_a],
    ['b', b.player_b],
  ]
  for (const [side, id] of players) {
    if (!id || id === BOT_ID) continue
    const p = await profile(admin, id)
    const today = new Date().toISOString().slice(0, 10)
    const firstWinToday = !p.last_win_at || p.last_win_at.slice(0, 10) !== today
    const r = computeReward(state, side, { kind: b.kind, winStreak: p.win_streak, firstWinToday })
    const { error } = await admin.rpc('apply_battle_result', {
      p_battle: b.id,
      p_user: id,
      p_result: r.result,
      p_points: r.points,
      p_boosters: r.boosters,
      p_tier: r.tier,
      p_bonus: r.bonusBooster,
      p_breakdown: r.breakdown,
    })
    if (error) throw error
  }
}

async function forceTimeout(admin: SupabaseClient, uid: string, battleId: string) {
  const b = await battleRow(admin, battleId)
  if (b.status !== 'active') return { ok: true }
  const side = sideOf(b, uid)
  const other: Side = side === 'a' ? 'b' : 'a'
  const s = await secrets(admin, battleId)
  const idleMs = Date.now() - new Date(b.updated_at).getTime()
  if (!s[side].pending_move) throw new HttpError(409, 'Lock your own move first.')
  if (s[other].pending_move) throw new HttpError(409, 'The opponent already moved.')
  if (idleMs < TURN_TIMEOUT_MS) throw new HttpError(425, 'Give the opponent a few more seconds.')
  const state = fullState(b, s)
  await resolve(admin, b, s, { [side]: s[side].pending_move!, [other]: fallbackMove(state, other) } as Record<Side, Move>)
  return { ok: true }
}

async function forfeit(admin: SupabaseClient, uid: string, battleId: string) {
  const b = await battleRow(admin, battleId)
  if (b.status !== 'active') return { ok: true }
  const side = sideOf(b, uid)
  const other: Side = side === 'a' ? 'b' : 'a'
  const pub = structuredClone(b.state)
  pub.status = 'finished'
  pub.winner = other
  // Forfeit: the leaver's remaining cards count as gone.
  pub.sides[side].champion = null
  pub.sides[side].handCount = 0
  await applyRewards(admin, b, pub)
  await admin
    .from('battles')
    .update({ state: pub, status: 'finished', winner: other === 'a' ? b.player_a : b.player_b, updated_at: new Date().toISOString(), finished_at: new Date().toISOString() })
    .eq('id', battleId)
  return { ok: true }
}

async function challenge(admin: SupabaseClient, uid: string, toUser: string) {
  if (!toUser || toUser === uid) throw new HttpError(400, 'Pick someone else.')
  await loadDeck(admin, uid) // fail early without a deck
  await admin
    .from('challenges')
    .update({ status: 'expired' })
    .eq('from_user', uid)
    .eq('status', 'pending')
  const { data, error } = await admin.from('challenges').insert({ from_user: uid, to_user: toUser }).select('id').single()
  if (error) throw error
  return { id: data.id }
}

async function accept(admin: SupabaseClient, uid: string, challengeId: string) {
  const { data: c } = await admin.from('challenges').select('*').eq('id', challengeId).maybeSingle()
  if (!c) throw new HttpError(404, 'Challenge not found.')
  if (c.to_user !== uid) throw new HttpError(403, 'Not your challenge.')
  if (c.status !== 'pending') throw new HttpError(409, 'Challenge is no longer pending.')
  if (Date.now() - new Date(c.created_at).getTime() > CHALLENGE_TTL_MS) {
    await admin.from('challenges').update({ status: 'expired' }).eq('id', challengeId)
    throw new HttpError(410, 'Challenge expired.')
  }
  const [deckA, deckB] = await Promise.all([loadDeck(admin, c.from_user), loadDeck(admin, uid)])
  const state = createBattle(deckA, deckB)
  const { data: row, error } = await admin
    .from('battles')
    .insert({ kind: 'pvp', player_a: c.from_user, player_b: uid, status: 'active', turn: 1, state: publicView(state) })
    .select('id')
    .single()
  if (error) throw error
  await admin.from('battle_secrets').insert([
    { battle_id: row.id, user_id: c.from_user, side: 'a', hand: state.hands.a },
    { battle_id: row.id, user_id: uid, side: 'b', hand: state.hands.b },
  ])
  await admin.from('challenges').update({ status: 'accepted', battle_id: row.id }).eq('id', challengeId)
  return { battleId: row.id }
}

async function decline(admin: SupabaseClient, uid: string, challengeId: string) {
  const { data: c } = await admin.from('challenges').select('*').eq('id', challengeId).maybeSingle()
  if (!c) throw new HttpError(404, 'Challenge not found.')
  if (c.to_user !== uid && c.from_user !== uid) throw new HttpError(403, 'Not your challenge.')
  await admin.from('challenges').update({ status: c.from_user === uid ? 'expired' : 'declined' }).eq('id', challengeId)
  return { ok: true }
}
