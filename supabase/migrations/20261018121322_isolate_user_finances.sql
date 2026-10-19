-- Applies to the existing public schema. No historical money or ownership is rewritten.
-- Deploy together with the server-scoped application; old clients must be stopped.
begin;

alter table public.balance_snapshots add constraint balance_snapshots_user_id_key unique (user_id);
alter table public.pots drop constraint pots_name_key;
alter table public.pots add constraint pots_user_id_name_key unique (user_id, name);

-- Preserve existing view columns and append user_id for a compatible replacement.
create or replace view public.unique_recurring_bills
with (security_invoker = true) as
select distinct on (user_id, name)
  name, avatar, amount, date, extract(day from date) as day, user_id
from public.transactions
where recurring = true
order by user_id, name, date desc, id desc;

-- NextAuth identifies users in the server. Browser database roles have no access.
do $$
declare item record;
begin
  for item in select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in
      ('users','settings','transactions','budgets','pots','balance_snapshots','categories','themes')
  loop
    execute format('drop policy %I on public.%I', item.policyname, item.tablename);
  end loop;
end $$;

alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.pots enable row level security;
alter table public.balance_snapshots enable row level security;
alter table public.categories enable row level security;
alter table public.themes enable row level security;

revoke all on table public.users, public.settings, public.transactions,
  public.budgets, public.pots, public.balance_snapshots, public.categories,
  public.themes, public.unique_recurring_bills from public, anon, authenticated;
revoke all on sequence public.themes_id_seq, public.balance_snapshots_id_seq
  from public, anon, authenticated;
grant select, insert, update, delete on table public.users, public.settings,
  public.transactions, public.budgets, public.pots, public.balance_snapshots,
  public.categories, public.themes to service_role;
grant select on public.unique_recurring_bills to service_role;
grant usage, select on sequence public.themes_id_seq, public.balance_snapshots_id_seq to service_role;

-- New accounts only. Existing accounts without a balance remain uninitialized.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
create function private.initialize_user_balance()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.balance_snapshots (user_id, current, income, expense)
  values (new.id, 0, 0, 0);
  return new;
end;
$$;
revoke all on function private.initialize_user_balance() from public, anon, authenticated;
grant execute on function private.initialize_user_balance() to service_role;
create trigger initialize_user_balance after insert on public.users
for each row execute function private.initialize_user_balance();

commit;
