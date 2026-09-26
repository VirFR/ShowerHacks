-- PFC · combat schema (battle team)
-- Apply in the Supabase SQL editor or with `supabase db push`.
-- Idempotent where possible so it can be re-run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, created by trigger.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  score integer not null default 0,
  games integer not null default 0,
  wins integer not null default 0,
  win_streak integer not null default 0,
  last_win_at timestamptz,
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Score, games, wins and onboarded_at change only through security-definer
-- functions / the service role: revoke direct column updates.
revoke update on public.profiles from authenticated;
grant update (username, avatar_url) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Categories and the chart (owned by the items team; placeholder seed).
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  slug text primary key,
  label text not null,
  color text,
  verb text not null default 'beats'
);

create table if not exists public.category_matchups (
  winner text not null references public.categories (slug) on delete cascade,
  loser text not null references public.categories (slug) on delete cascade,
  primary key (winner, loser),
  check (winner <> loser)
);

alter table public.categories enable row level security;
alter table public.category_matchups enable row level security;
drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories for select using (true);
drop policy if exists "matchups are public" on public.category_matchups;
create policy "matchups are public" on public.category_matchups for select using (true);

insert into public.categories (slug, label, color, verb) values
  ('rock', 'Rock', '#a8a29e', 'crushes'),
  ('paper', 'Paper', '#34d399', 'wraps'),
  ('scissors', 'Scissors', '#fb7185', 'cut'),
  ('fire', 'Fire', '#fb923c', 'burns'),
  ('water', 'Water', '#38bdf8', 'drowns')
on conflict (slug) do nothing;

insert into public.category_matchups (winner, loser) values
  ('rock', 'scissors'), ('rock', 'fire'),
  ('paper', 'rock'), ('paper', 'water'),
  ('scissors', 'paper'),
  ('fire', 'paper'), ('fire', 'scissors'),
  ('water', 'fire'), ('water', 'rock')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Items catalog and inventories (content owned by the items/boosters team).
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id text primary key,
  name text not null,
  category text not null references public.categories (slug),
  attack integer not null default 5 check (attack between 0 and 99),
  defense integer not null default 5 check (defense between 0 and 99),
  image_url text,
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  description text
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.items (id) on delete cascade,
  acquired_at timestamptz not null default now()
);
create index if not exists inventory_owner_idx on public.inventory (owner);

alter table public.items enable row level security;
alter table public.inventory enable row level security;
drop policy if exists "items are public" on public.items;
create policy "items are public" on public.items for select using (true);
drop policy if exists "users read their inventory" on public.inventory;
create policy "users read their inventory" on public.inventory for select using (auth.uid() = owner);

insert into public.items (id, name, category, attack, defense, image_url, rarity, description) values
  ('pierre', 'Rock', 'rock', 5, 6, '/objets/pierre.svg', 'common', 'Crushes scissors. Gets wrapped by paper.'),
  ('feuille', 'Paper', 'paper', 5, 5, '/objets/feuille.svg', 'common', 'Wraps rock. Gets cut by scissors.'),
  ('ciseaux', 'Scissors', 'scissors', 6, 4, '/objets/ciseaux.svg', 'common', 'Cut paper. Get crushed by rock.'),
  ('toaster', 'Toaster', 'fire', 7, 3, '/objets/toaster.svg', 'rare', 'Runs hot. Burns paper and scissors, hates water.'),
  ('garden-hose', 'Garden Hose', 'water', 5, 6, '/objets/garden-hose.svg', 'rare', 'Drowns fire and rock. Paper soaks it up.'),
  ('brick', 'Brick', 'rock', 4, 8, '/objets/brick.svg', 'common', 'Hard to get through. Not fast, not clever.'),
  ('origami-crane', 'Origami Crane', 'paper', 6, 4, '/objets/origami-crane.svg', 'epic', 'Folded sharp. Wraps rock, soaks water.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- New user: profile row + the three base items.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n integer := 0;
begin
  base := coalesce(
    nullif(regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'), ''),
    'player'
  );
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  insert into public.inventory (owner, item_id)
  select new.id, id from public.items where id in ('pierre', 'feuille', 'ciseaux');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Boosters hand-off (owned by the boosters team). The battle system only
-- calls this function; replace its body with the real booster credit.
-- ---------------------------------------------------------------------------
create table if not exists public.booster_credits (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles (id) on delete cascade,
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold')),
  source text not null,
  granted_at timestamptz not null default now(),
  opened_at timestamptz
);
create index if not exists booster_credits_owner_idx on public.booster_credits (owner);
alter table public.booster_credits enable row level security;
drop policy if exists "users read their booster credits" on public.booster_credits;
create policy "users read their booster credits" on public.booster_credits for select using (auth.uid() = owner);

create or replace function public.grant_boosters(p_user uuid, p_count integer, p_tier text, p_source text default 'battle')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- BOOSTERS TEAM: this is your hook. `p_tier` drives the rarity odds
  -- (bronze < silver < gold). Default behaviour: one credit per booster.
  insert into public.booster_credits (owner, tier, source)
  select p_user, p_tier, p_source from generate_series(1, greatest(p_count, 0));
end;
$$;

-- ---------------------------------------------------------------------------
-- Onboarding: called by the client at the end of the warm-up.
-- ---------------------------------------------------------------------------
create or replace function public.complete_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  already timestamptz;
begin
  select onboarded_at into already from public.profiles where id = auth.uid();
  if already is not null then
    return;
  end if;
  update public.profiles set onboarded_at = now() where id = auth.uid();
  perform public.grant_boosters(auth.uid(), 1, 'silver', 'welcome');
end;
$$;
grant execute on function public.complete_onboarding() to authenticated;

-- ---------------------------------------------------------------------------
-- Decks.
-- ---------------------------------------------------------------------------
create table if not exists public.decks (
  owner uuid primary key references public.profiles (id) on delete cascade,
  inventory_ids uuid[] not null check (array_length(inventory_ids, 1) = 5),
  updated_at timestamptz not null default now()
);
alter table public.decks enable row level security;
drop policy if exists "users manage their deck" on public.decks;
create policy "users manage their deck" on public.decks
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- ---------------------------------------------------------------------------
-- Challenges and battles.
-- ---------------------------------------------------------------------------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  battle_id uuid,
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create index if not exists challenges_to_idx on public.challenges (to_user, status);
create index if not exists challenges_from_idx on public.challenges (from_user, status);
alter table public.challenges enable row level security;
drop policy if exists "participants read challenges" on public.challenges;
create policy "participants read challenges" on public.challenges
  for select using (auth.uid() = from_user or auth.uid() = to_user);

create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('pvp', 'bot')),
  player_a uuid not null references public.profiles (id) on delete cascade,
  player_b uuid references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('waiting', 'active', 'finished')),
  turn integer not null default 1,
  state jsonb not null,
  winner uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists battles_player_a_idx on public.battles (player_a, created_at desc);
create index if not exists battles_player_b_idx on public.battles (player_b, created_at desc);
alter table public.battles enable row level security;
drop policy if exists "participants read battles" on public.battles;
create policy "participants read battles" on public.battles
  for select using (auth.uid() = player_a or auth.uid() = player_b);

-- Hidden hands and pending moves. Only the owner can read their row; the
-- edge function (service role) reads both.
create table if not exists public.battle_secrets (
  battle_id uuid not null references public.battles (id) on delete cascade,
  user_id uuid not null,
  side text not null check (side in ('a', 'b')),
  hand jsonb not null,
  pending_move jsonb,
  primary key (battle_id, side)
);
alter table public.battle_secrets enable row level security;
drop policy if exists "users read their own secrets" on public.battle_secrets;
create policy "users read their own secrets" on public.battle_secrets
  for select using (auth.uid() = user_id);

create table if not exists public.battle_rewards (
  battle_id uuid not null references public.battles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  result text not null check (result in ('win', 'draw', 'loss')),
  points integer not null,
  boosters integer not null,
  tier text not null check (tier in ('bronze', 'silver', 'gold')),
  bonus_booster boolean not null default false,
  breakdown jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  primary key (battle_id, user_id)
);
alter table public.battle_rewards enable row level security;
drop policy if exists "users read their rewards" on public.battle_rewards;
create policy "users read their rewards" on public.battle_rewards for select using (auth.uid() = user_id);

-- Applies one side's reward: score, games, wins, streak, boosters.
create or replace function public.apply_battle_result(
  p_battle uuid,
  p_user uuid,
  p_result text,
  p_points integer,
  p_boosters integer,
  p_tier text,
  p_bonus boolean,
  p_breakdown jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.battle_rewards (battle_id, user_id, result, points, boosters, tier, bonus_booster, breakdown)
  values (p_battle, p_user, p_result, p_points, p_boosters, p_tier, p_bonus, p_breakdown)
  on conflict (battle_id, user_id) do nothing;

  update public.profiles
  set score = score + p_points,
      games = games + 1,
      wins = wins + case when p_result = 'win' then 1 else 0 end,
      win_streak = case when p_result = 'win' then win_streak + 1 when p_result = 'loss' then 0 else win_streak end,
      last_win_at = case when p_result = 'win' then now() else last_win_at end
  where id = p_user;

  if p_boosters > 0 then
    perform public.grant_boosters(p_user, p_boosters, p_tier, 'battle');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Realtime: the client listens to battles and challenges.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'battles') then
    alter publication supabase_realtime add table public.battles;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'challenges') then
    alter publication supabase_realtime add table public.challenges;
  end if;
end $$;

alter table public.battles replica identity full;
alter table public.challenges replica identity full;
