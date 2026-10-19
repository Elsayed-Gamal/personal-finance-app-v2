-- Run before the isolation migration: the production RPC must work independently.
begin;
set local role service_role;
do $$
declare
  owner_id uuid := '00000000-0000-4000-8000-000000000001';
  transaction_id uuid := gen_random_uuid();
  category_id uuid := '40000000-0000-4000-8000-000000000001';
begin
  perform public.mutate_owned_transaction(owner_id,transaction_id,'create','Standalone',-20,'2024-08-01',category_id);
  assert (select current=80 from public.balance_snapshots where user_id=owner_id);
  perform public.mutate_owned_transaction(owner_id,transaction_id,'edit','Standalone',-30,'2024-08-01',category_id);
  assert (select current=70 from public.balance_snapshots where user_id=owner_id);
  perform public.mutate_owned_transaction(owner_id,transaction_id,'delete');
  assert (select current=100 from public.balance_snapshots where user_id=owner_id);
  assert not exists(select 1 from public.transactions where id=transaction_id);

  begin
    perform public.mutate_owned_transaction('00000000-0000-4000-8000-000000000002',transaction_id,'create','Missing balance',10,'2024-08-01',category_id);
    raise exception 'Missing balance accepted';
  exception when raise_exception then
    if sqlerrm<>'BALANCE_NOT_INITIALIZED' then raise; end if;
  end;

  -- Without the later unique constraint, ambiguous balances must fail closed.
  insert into public.balance_snapshots(user_id,current,income,expense) values(owner_id,99,0,0);
  begin
    perform public.mutate_owned_transaction(owner_id,transaction_id,'create','Duplicate balances',10,'2024-08-01',category_id);
    raise exception 'Duplicate balances accepted';
  exception when raise_exception then
    if sqlerrm<>'BALANCE_NOT_UNIQUE' then raise; end if;
  end;
  assert (select sum(current)=199 from public.balance_snapshots where user_id=owner_id);
  assert not exists(select 1 from public.transactions where id=transaction_id);
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform public.mutate_owned_transaction(null,null,'delete');
    raise exception 'Anonymous execution accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin
    perform public.mutate_owned_transaction(null,null,'delete');
    raise exception 'Authenticated execution accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
