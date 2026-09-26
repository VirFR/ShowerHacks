-- PFC · crafting schema (Little-Alchemy-style recipes)
-- Apply after 0001/0002; the recipes themselves are seeded by 0004_recipes_seed.sql.
-- Idempotent so it can be re-run.

-- ---------------------------------------------------------------------------
-- Recipes: hidden from players. RLS is on with no policy, so anon and
-- authenticated read nothing; only the security-definer functions below do.
-- The pair is stored sorted (item_a <= item_b): A+B and B+A are one recipe.
-- An item can have several recipes (several pairs with the same result).
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  item_a text not null references public.items (id) on delete cascade,
  item_b text not null references public.items (id) on delete cascade,
  result text not null references public.items (id) on delete cascade,
  primary key (item_a, item_b),
  check (item_a <= item_b)
);
-- First version had one recipe per item: lift that on databases created then.
alter table public.recipes drop constraint if exists recipes_result_key;
alter table public.recipes enable row level security;
revoke all on public.recipes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Discoveries: every item a player has ever owned (starter, booster, craft).
-- A recipe is revealed once its result is discovered, even if the card was
-- later consumed by another craft.
-- ---------------------------------------------------------------------------
create table if not exists public.discoveries (
  owner uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.items (id) on delete cascade,
  discovered_at timestamptz not null default now(),
  primary key (owner, item_id)
);
alter table public.discoveries enable row level security;
drop policy if exists "users read their discoveries" on public.discoveries;
create policy "users read their discoveries" on public.discoveries for select using (auth.uid() = owner);

create or replace function public.record_discovery()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- Backfill: what players already own counts as discovered.
insert into public.discoveries (owner, item_id)
select distinct owner, item_id from public.inventory
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- craft(a, b): combines two inventory copies owned by the caller and adds the
-- result. The base cards (rock obj-01, leaf obj-04, scissors obj-07) are
-- infinite like Little Alchemy's elements: never consumed. Any copy may be
-- passed twice (rock + rock, or Iron Ore + Iron Ore with a single Iron Ore):
-- it is then consumed once. Every other ingredient is consumed.
-- Unknown combination: nothing changes and the call raises 'no_recipe'.
-- ---------------------------------------------------------------------------
create or replace function public.craft(p_a uuid, p_b uuid)
returns table (inventory_id uuid, item_id text, new_discovery boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  me uuid := auth.uid();
  id_a text;
  id_b text;
  v_result text;
  v_new boolean;
  v_row uuid;
  base_cards constant text[] := array['obj-01', 'obj-04', 'obj-07'];
begin
  if me is null then
    raise exception 'not_authenticated';
  end if;
  if p_a is null or p_b is null then
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

  delete from public.inventory i where i.id in (p_a, p_b) and i.item_id <> all (base_cards);
  insert into public.inventory (owner, item_id) values (me, v_result) returning id into v_row;

  return query select v_row, v_result, v_new;
end;
$$;
revoke execute on function public.craft(uuid, uuid) from public, anon;
grant execute on function public.craft(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- recipe_book(): every recipe of the cards the caller discovered, plus how
-- many craftable cards exist, so the book can show "12 / 54" without leaking
-- the undiscovered ones.
-- ---------------------------------------------------------------------------
create or replace function public.recipe_book()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total', (select count(distinct result) from public.recipes),
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
revoke execute on function public.recipe_book() from public, anon;
grant execute on function public.recipe_book() to authenticated;
