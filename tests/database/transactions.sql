begin;
set local role service_role;
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','create','Income',50,'2024-08-01','40000000-0000-4000-8000-000000000002');
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','create','Expense',-30,'2024-08-01','40000000-0000-4000-8000-000000000001',true);
do $$ begin
 assert (select current=120 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Incorrect create delta';
 assert (select income=200 and expense=100 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Historical snapshot totals changed';
end $$;
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','edit','Expense',-10,'2024-08-02','40000000-0000-4000-8000-000000000001');
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','edit','Income',75,'2024-08-02','40000000-0000-4000-8000-000000000002');
do $$ begin
 assert (select current=165 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Incorrect edit delta';
 assert (select public.get_owned_period_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01')=jsonb_build_object('income',75,'expense',10,'transactionCount',2)), 'Wrong period totals';
 assert (select spent=10 from public.get_owned_budget_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01')), 'Wrong budget expense';
end $$;
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','delete');
select public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','delete');
do $$ begin
 assert (select current=100 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Incorrect deletion reversal';
end $$;

-- Foreign IDs, missing balance and duplicate submissions cannot change money.
do $$ declare operation text; begin
 foreach operation in array array['edit','delete'] loop
   begin
     perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000004',operation,'Forged',10,'2024-08-01','40000000-0000-4000-8000-000000000001');
     raise exception 'Foreign transaction accepted';
   exception when raise_exception then if sqlerrm<>'TRANSACTION_NOT_FOUND' then raise; end if; end;
 end loop;
 foreach operation in array array['create','edit','delete'] loop
   begin
     perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000004',operation,'Legacy',10,'2024-08-01','40000000-0000-4000-8000-000000000001');
     raise exception 'Uninitialized balance accepted';
   exception when raise_exception then if sqlerrm<>'BALANCE_NOT_INITIALIZED' then raise; end if; end;
 end loop;
 begin
   perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','create','Duplicate',10,'2024-08-01','40000000-0000-4000-8000-000000000001');
   raise exception 'Duplicate create accepted';
 exception when unique_violation then null; end;
 assert (select current=100 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Rejected change affected balance';
end $$;

do $$ declare amount numeric; begin
 foreach amount in array array[null,0,'NaN'::numeric,'Infinity'::numeric,0.001,-101] loop
   begin
     perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','create','Invalid',amount,'2024-08-01','40000000-0000-4000-8000-000000000001');
     raise exception 'Invalid transaction accepted';
   exception when raise_exception then if sqlerrm not in ('INVALID_TRANSACTION','INSUFFICIENT_BALANCE') then raise; end if; end;
 end loop;
 begin
   perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','create','Future',10,current_date+2,'40000000-0000-4000-8000-000000000001');
   raise exception 'Future transaction accepted';
 exception when raise_exception then if sqlerrm<>'INVALID_TRANSACTION' then raise; end if; end;
end $$;

-- Reporting must aggregate every row, including beyond PostgREST's default 1000.
insert into public.transactions(user_id,name,amount,date,category_id)
 select '00000000-0000-4000-8000-000000000001','Many records',-1,'2024-08-31','40000000-0000-4000-8000-000000000001' from generate_series(1,1005);
insert into public.transactions(user_id,name,amount,date,category_id) values
 ('00000000-0000-4000-8000-000000000001','Next month',-90,'2024-09-01','40000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000002','Other user',-200,'2024-08-31','40000000-0000-4000-8000-000000000001');
do $$ begin
 assert (select spent=1005 from public.get_owned_budget_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01')), 'Reporting truncated or mixed dates/owners';
 assert (select (public.get_owned_period_summary('00000000-0000-4000-8000-000000000001','2024-08-01','2024-09-01')->>'expense')::numeric=1005), 'Summary truncated';
 begin
   insert into public.budgets(user_id,category_id,maximum) values ('00000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001',999);
   raise exception 'Duplicate category budget accepted';
 exception when unique_violation then null; end;
end $$;
reset role;
rollback;

-- Failure of balance writing must also roll back transaction insert/edit/delete.
begin;
create function public.fail_transaction_test_balance() returns trigger language plpgsql as $$ begin raise exception 'TEST_BALANCE_FAILURE'; end $$;
create trigger fail_transaction_test_balance before update on public.balance_snapshots for each row execute function public.fail_transaction_test_balance();
set local role service_role;
do $$ declare operation text; begin
 foreach operation in array array['create','edit','delete'] loop
   begin
     perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000001',case when operation='create' then '30000000-0000-4000-8000-000000000001'::uuid else '20000000-0000-4000-8000-000000000001'::uuid end,operation,'Changed',10,'2024-08-01','40000000-0000-4000-8000-000000000001');
     raise exception 'Expected balance failure';
   exception when raise_exception then if sqlerrm<>'TEST_BALANCE_FAILURE' then raise; end if; end;
   assert (select amount=-10 and name='Internet' from public.transactions where id='20000000-0000-4000-8000-000000000001'), 'Transaction edit/delete not rolled back';
   assert not exists(select 1 from public.transactions where id='30000000-0000-4000-8000-000000000001'), 'Transaction insert not rolled back';
 end loop;
end $$;
rollback;

-- Every new RPC remains closed to browser roles.
do $$ declare r text; begin
 foreach r in array array['anon','authenticated'] loop
   assert not has_function_privilege(r,'public.mutate_owned_transaction(uuid,uuid,text,text,numeric,date,uuid,boolean)','EXECUTE');
   assert not has_function_privilege(r,'public.get_owned_budget_summary(uuid,date,date)','EXECUTE');
   assert not has_function_privilege(r,'public.get_owned_period_summary(uuid,date,date)','EXECUTE');
 end loop;
end $$;
