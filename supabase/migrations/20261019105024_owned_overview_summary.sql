begin;

-- Reporting helpers are deployed with Overview so this migration is standalone.
create function public.get_owned_budget_summary(p_user_id uuid, p_start date, p_end date)
returns table(id uuid, category_id uuid, name text, maximum numeric, spent numeric, color text)
language sql stable security invoker set search_path = '' as $$
  select b.id,b.category_id,coalesce(c.name,'Uncategorized'),b.maximum,
    coalesce((select sum(-t.amount) from public.transactions t
      where t.user_id=p_user_id and t.category_id=b.category_id
      and t.date>=p_start and t.date<p_end and t.amount<0),0),c.theme
  from public.budgets b left join public.categories c on c.id=b.category_id
  where b.user_id=p_user_id order by b.maximum,b.id;
$$;
revoke all on function public.get_owned_budget_summary(uuid,date,date) from public,anon,authenticated;
grant execute on function public.get_owned_budget_summary(uuid,date,date) to service_role;

create function public.get_owned_period_summary(p_user_id uuid, p_start date, p_end date)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'income',coalesce(sum(amount) filter(where amount>0),0),
    'expense',coalesce(sum(-amount) filter(where amount<0),0),
    'transactionCount',count(*)
  ) from public.transactions where user_id=p_user_id and date>=p_start and date<p_end;
$$;
revoke all on function public.get_owned_period_summary(uuid,date,date) from public,anon,authenticated;
grant execute on function public.get_owned_period_summary(uuid,date,date) to service_role;

-- All totals cover the full owner dataset; only previews are limited.
create function public.get_owned_overview_summary(p_user_id uuid, p_start date, p_end date)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with budget_rows as (
    select * from public.get_owned_budget_summary(p_user_id,p_start,p_end)
  )
  select jsonb_build_object(
    'balance', (select current from public.balance_snapshots where user_id=p_user_id),
    'period', public.get_owned_period_summary(p_user_id,p_start,p_end),
    'pots', jsonb_build_object(
      'total', (select coalesce(sum(total),0) from public.pots where user_id=p_user_id),
      'count', (select count(*) from public.pots where user_id=p_user_id),
      'items', (select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at,p.id),'[]'::jsonb) from
        (select id,name,target,total,theme,created_at from public.pots where user_id=p_user_id
          order by created_at,id limit 4) p)
    ),
    'budgets', jsonb_build_object(
      'maximum', (select coalesce(sum(maximum),0) from budget_rows),
      'spent', (select coalesce(sum(spent),0) from budget_rows),
      'count', (select count(*) from budget_rows),
      'items', (select coalesce(jsonb_agg(to_jsonb(b) order by b.maximum desc,b.id),'[]'::jsonb)
        from (select * from budget_rows order by maximum desc,id limit 4) b)
    ),
    'transactions', (select coalesce(jsonb_agg(to_jsonb(t) order by t.date desc,t.id desc),'[]'::jsonb) from
      (select t.id,t.name,t.amount,t.date,coalesce(c.name,'Uncategorized') as category
        from public.transactions t left join public.categories c on c.id=t.category_id
        where t.user_id=p_user_id order by t.date desc,t.id desc limit 5) t)
  );
$$;
revoke all on function public.get_owned_overview_summary(uuid,date,date) from public,anon,authenticated;
grant execute on function public.get_owned_overview_summary(uuid,date,date) to service_role;
notify pgrst, 'reload schema';
commit;
