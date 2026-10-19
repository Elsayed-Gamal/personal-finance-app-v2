begin;

-- Transaction mutation is deployed separately in mutate_owned_transaction.
-- A monthly budget limit is reusable across months and unique per user/category.
-- This fails transactionally if duplicate legacy budgets need manual review.
alter table public.budgets add constraint budgets_user_category_key unique(user_id,category_id);
create index transactions_user_date_idx on public.transactions(user_id,date desc,id desc);
-- Reporting RPCs are deployed in owned_overview_summary.
commit;
