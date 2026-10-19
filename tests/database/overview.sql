begin;
set local role service_role;
do $$ declare summary jsonb; begin
  summary := public.get_owned_overview_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01');
  assert (summary->>'balance')::numeric=100, 'Overview balance is not owned';
  assert (summary->'pots'->>'total')::numeric=20, 'Overview includes foreign pots';
  assert (summary->'pots'->>'count')::integer=2;
  assert (summary->'budgets'->>'maximum')::numeric=100, 'Overview includes foreign budgets';
  assert (summary->'period'->>'expense')::numeric=0, 'Overview month filter failed';
  assert jsonb_array_length(summary->'transactions')=3, 'Overview includes foreign transactions';
  assert summary->'transactions'->0->>'id'='20000000-0000-4000-8000-000000000003', 'Transaction order is unstable';

  summary := public.get_owned_overview_summary('00000000-0000-4000-8000-000000000003','2024-08-01','2024-09-01');
  assert summary->'balance'='null'::jsonb, 'Missing balance became zero';
  assert summary->'transactions'='[]'::jsonb;
  assert summary->'pots'->'items'='[]'::jsonb;
  assert summary->'budgets'->'items'='[]'::jsonb;
  assert (summary->'period'->>'income')::numeric=0;
end $$;

insert into public.transactions(user_id,name,amount,date,category_id)
  select '00000000-0000-4000-8000-000000000001','Expense',-1,'2024-08-31','40000000-0000-4000-8000-000000000001' from generate_series(1,1005);
insert into public.transactions(user_id,name,amount,date,category_id) values
  ('00000000-0000-4000-8000-000000000001','Income',25,'2024-08-01','40000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000002','Foreign expense',-999,'2024-08-01','40000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000001','Outside period',-999,'2024-09-01','40000000-0000-4000-8000-000000000001');
insert into public.pots(user_id,name,target,total)
  select '00000000-0000-4000-8000-000000000001','Overview pot '||n,50,1 from generate_series(1,1005) n;
do $$ declare summary jsonb; begin
  summary := public.get_owned_overview_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01');
  assert (summary->'period'->>'expense')::numeric=1005, 'Period total truncated or mixed users/months';
  assert (summary->'period'->>'income')::numeric=25;
  assert (summary->'budgets'->>'spent')::numeric=1005, 'Budget total truncated';
  assert (summary->'pots'->>'total')::numeric=1025, 'Pot total truncated';
  assert (summary->'pots'->>'count')::integer=1007;
  assert jsonb_array_length(summary->'pots'->'items')=4, 'Pot preview unbounded';
  assert jsonb_array_length(summary->'transactions')=5, 'Transaction preview unbounded';
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon','public.get_owned_overview_summary(uuid,date,date)','EXECUTE');
  assert not has_function_privilege('authenticated','public.get_owned_overview_summary(uuid,date,date)','EXECUTE');
end $$;
rollback;
