begin;
-- Structural restrictions and preservation of historical money.
do $$
declare t text; r text;
begin
 assert (select count(*)=1 from public.balance_snapshots), 'Legacy users were initialized';
 assert (select current=100 and income=200 and expense=100 from public.balance_snapshots), 'Historical balance changed';
 assert (select sum(total)=60 from public.pots), 'Historical pots changed';
 foreach t in array array['users','settings','transactions','budgets','pots','balance_snapshots','categories','themes'] loop
   assert (select relrowsecurity from pg_class where oid=('public.'||t)::regclass), 'RLS missing: '||t;
 end loop;
 foreach r in array array['anon','authenticated'] loop
   foreach t in array array['users','settings','transactions','budgets','pots','balance_snapshots','categories','themes','unique_recurring_bills'] loop
     assert not has_table_privilege(r,'public.'||t,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), 'Direct access: '||r||'/'||t;
   end loop;
   assert not has_function_privilege(r,'public.mutate_owned_pot(uuid,uuid,text,numeric)','EXECUTE'), 'RPC exposed';
 end loop;
 assert (select count(*)=0 from pg_policies where schemaname='public'), 'Open policies remain';
end $$;

-- Actual anonymous query, not just a metadata assertion.
set local role anon;
do $$ begin
 begin
   perform * from public.users;
   raise exception 'Anonymous user access succeeded';
 exception when insufficient_privilege then null;
 end;
 begin
   perform public.mutate_owned_pot(null,null,'delete',null);
   raise exception 'Anonymous RPC access succeeded';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;

set local role service_role;
-- New accounts get a balance in the same transaction, without backfilling old ones.
insert into public.users(id,name,email) values ('00000000-0000-4000-8000-000000000004','New','new@example.test');
do $$ begin
 assert (select current=0 and income=0 and expense=0 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000004'), 'Missing new balance';
 assert not exists(select 1 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000002'), 'Legacy balance changed';
 assert (select count(*)=2 from public.unique_recurring_bills), 'Bills merged across users';
 assert (select amount=-16 from public.unique_recurring_bills where user_id='00000000-0000-4000-8000-000000000001'), 'Wrong latest bill';
end $$;

-- Same name is allowed across users but not twice for the same user.
update public.pots set name='Savings A' where id='10000000-0000-4000-8000-000000000002';
do $$ begin
 begin
   update public.pots set name='Savings A' where id='10000000-0000-4000-8000-000000000004';
   raise exception 'Duplicate name allowed';
 exception when unique_violation then null;
 end;
end $$;

-- Unknown and foreign pots are indistinguishable, with no monetary side effects.
do $$
declare op text; target_id uuid;
begin
 foreach op in array array['add','withdraw','delete'] loop
   foreach target_id in array array['10000000-0000-4000-8000-000000000002'::uuid,'10000000-0000-4000-8000-000000000099'::uuid] loop
     begin
       perform public.mutate_owned_pot('00000000-0000-4000-8000-000000000001',target_id,op,1);
       raise exception 'Foreign pot accepted';
     exception when raise_exception then
       if sqlerrm <> 'POT_NOT_FOUND' then raise; end if;
     end;
   end loop;
 end loop;
 assert (select current=100 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Rejected request changed balance';
 assert (select total=40 from public.pots where id='10000000-0000-4000-8000-000000000002'), 'Rejected request changed foreign pot';
end $$;

-- Missing balance blocks all operations that move money, but permits empty deletion.
do $$
declare op text;
begin
 foreach op in array array['add','withdraw','delete'] loop
   begin
     perform public.mutate_owned_pot('00000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',op,1);
     raise exception 'Uninitialized balance accepted';
   exception when raise_exception then
     if sqlerrm <> 'BALANCE_NOT_INITIALIZED' then raise; end if;
   end;
 end loop;
 assert (select total=40 from public.pots where id='10000000-0000-4000-8000-000000000002'), 'Missing balance changed pot';
 perform public.mutate_owned_pot('00000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','delete');
 assert not exists(select 1 from public.pots where id='10000000-0000-4000-8000-000000000003'), 'Empty pot not deleted';
end $$;

-- Amount validation cannot be bypassed by calling the RPC directly.
do $$
declare amount numeric; op text;
begin
 foreach op in array array['add','withdraw'] loop
   foreach amount in array array[null,0,-10,0.001,'NaN'::numeric,'Infinity'::numeric] loop
     begin
       perform public.mutate_owned_pot('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',op,amount);
       raise exception 'Invalid amount accepted';
     exception when raise_exception then
       if sqlerrm <> 'INVALID_AMOUNT' then raise; end if;
     end;
   end loop;
 end loop;
end $$;

select public.mutate_owned_pot('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','add',25.25);
select public.mutate_owned_pot('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','withdraw',5.25);
do $$ begin
 assert (select total=40 from public.pots where id='10000000-0000-4000-8000-000000000001'), 'Wrong pot total';
 assert (select current=80 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Wrong balance';
end $$;
select public.mutate_owned_pot('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','delete');
do $$ begin
 assert (select current=120 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Deletion did not return savings';
end $$;
reset role;
rollback;

-- Inject failure in the second write: the first write must roll back too.
begin;
create function public.fail_test_balance_update() returns trigger language plpgsql as $$ begin raise exception 'TEST_WRITE_FAILURE'; end $$;
create trigger fail_test_balance_update before update on public.balance_snapshots for each row execute function public.fail_test_balance_update();
set local role service_role;
do $$
declare op text;
begin
 foreach op in array array['add','withdraw','delete'] loop
   begin
     perform public.mutate_owned_pot('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',op,1);
     raise exception 'Expected write failure';
   exception when raise_exception then
     if sqlerrm <> 'TEST_WRITE_FAILURE' then raise; end if;
   end;
   assert (select total=20 from public.pots where id='10000000-0000-4000-8000-000000000001'), 'First write was not rolled back';
   assert (select current=100 from public.balance_snapshots where user_id='00000000-0000-4000-8000-000000000001'), 'Balance changed after failure';
 end loop;
end $$;
rollback;
