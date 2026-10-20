begin;

alter table public.budgets
  add column theme text not null default '#277C78'
  constraint budgets_theme_hex_check check (theme ~ '^#[0-9A-Fa-f]{6}$');

update public.budgets b
set theme = c.theme
from public.categories c
where c.id = b.category_id
  and c.theme ~ '^#[0-9A-Fa-f]{6}$';

create or replace function public.get_owned_budget_summary(
  p_user_id uuid,
  p_start date,
  p_end date
)
returns table(
  id uuid,
  category_id uuid,
  name text,
  maximum numeric,
  spent numeric,
  color text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    b.id,
    b.category_id,
    coalesce(c.name, 'Uncategorized'),
    b.maximum,
    coalesce((
      select sum(-t.amount)
      from public.transactions t
      where t.user_id = p_user_id
        and t.category_id = b.category_id
        and t.date >= p_start
        and t.date < p_end
        and t.amount < 0
    ), 0),
    b.theme
  from public.budgets b
  left join public.categories c on c.id = b.category_id
  where b.user_id = p_user_id
  order by b.maximum, b.id;
$$;

notify pgrst, 'reload schema';

commit;
