-- PFC · crafting schema (recipes + discoveries + the craft/recipe_book RPCs).
-- Apply in the Supabase SQL editor or with `supabase db push`.
-- Idempotent where possible so it can be re-run.

-- ---------------------------------------------------------------------------
-- Recipes: combining item_a + item_b (unordered — item_a <= item_b, canonical)
-- consumes both and yields result. One result per pair, one recipe per result.
-- Not exposed for direct SELECT: the pairs are only readable through
-- recipe_book() below, which hides everything a player hasn't discovered yet.
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  item_a text not null references public.items (id) on delete cascade,
  item_b text not null references public.items (id) on delete cascade,
  result text not null unique references public.items (id) on delete cascade,
  primary key (item_a, item_b),
  check (item_a <= item_b)
);

alter table public.recipes enable row level security;

-- ---------------------------------------------------------------------------
-- Discoveries: which recipe results a player has ever owned a copy of
-- (crafted, or pulled straight from a booster). Filled by a trigger on
-- every inventory insert, never written to directly by the client.
-- ---------------------------------------------------------------------------
create table if not exists public.discoveries (
  owner uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.items (id) on delete cascade,
  discovered_at timestamptz not null default now(),
  primary key (owner, item_id)
);

alter table public.discoveries enable row level security;

drop policy if exists "users read their discoveries" on public.discoveries;
create policy "users read their discoveries" on public.discoveries
  for select using (auth.uid() = owner);

create or replace function public.record_discovery()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.discoveries (owner, item_id)
  values (new.owner, new.item_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_inventory_insert_discover on public.inventory;
create trigger on_inventory_insert_discover
  after insert on public.inventory
  for each row execute function public.record_discovery();

-- ---------------------------------------------------------------------------
-- craft(p_a, p_b): p_a/p_b are the CALLER'S OWN inventory row ids (not
-- catalog item ids). Looks up the matching recipe, deletes both inventory
-- rows and inserts the result — all in one transaction, so a client can
-- never end up down two cards without the crafted one.
-- ---------------------------------------------------------------------------
create or replace function public.craft(p_a uuid, p_b uuid)
returns table (inventory_id uuid, item_id text, new_discovery boolean)
language plpgsql
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
declare
  me uuid := auth.uid();
  id_a text;
  id_b text;
  v_result text;
  v_new boolean;
  v_row uuid;
begin
  if me is null then
    raise exception 'not_authenticated';
  end if;
  if p_a is null or p_b is null or p_a = p_b then
    raise exception 'two_cards_needed';
  end if;

  select i.item_id into id_a from public.inventory i where i.id = p_a and i.owner = me for update;
  select i.item_id into id_b from public.inventory i where i.id = p_b and i.owner = me for update;
  if id_a is null or id_b is null then
    raise exception 'card_not_owned';
  end if;

  select r.result into v_result
  from public.recipes r
  where r.item_a = least(id_a, id_b) and r.item_b = greatest(id_a, id_b);
  if v_result is null then
    raise exception 'no_recipe';
  end if;

  v_new := not exists (select 1 from public.discoveries d where d.owner = me and d.item_id = v_result);

  delete from public.inventory i where i.id in (p_a, p_b);
  insert into public.inventory (owner, item_id) values (me, v_result) returning id into v_row;

  return query select v_row, v_result, v_new;
end;
$$;

revoke all on function public.craft(uuid, uuid) from public, anon;
grant execute on function public.craft(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- recipe_book(): total recipe count (safe to reveal — it's just a number)
-- plus the full ingredients of every recipe the CALLER has discovered.
-- Recipes nobody has found yet never leave the database.
-- ---------------------------------------------------------------------------
create or replace function public.recipe_book()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'total', (select count(*) from public.recipes),
    'recipes', coalesce(
      (
        select jsonb_agg(jsonb_build_object('result', r.result, 'item_a', r.item_a, 'item_b', r.item_b))
        from public.recipes r
        join public.discoveries d on d.item_id = r.result and d.owner = auth.uid()
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.recipe_book() from public, anon;
grant execute on function public.recipe_book() to authenticated;
