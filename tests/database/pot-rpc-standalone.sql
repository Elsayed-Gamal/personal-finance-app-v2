begin;
set local role service_role;
do $$
declare
  owner_id uuid := '00000000-0000-4000-8000-000000000001';
  foreign_id uuid := '00000000-0000-4000-8000-000000000002';
  pot_id uuid := '10000000-0000-4000-8000-000000000001';
begin
  perform public.mutate_owned_pot(owner_id,pot_id,'add',10);
  assert (select current=90 from public.balance_snapshots where user_id=owner_id);
  assert (select total=30 from public.pots where id=pot_id);
  perform public.mutate_owned_pot(owner_id,pot_id,'withdraw',5);
  assert (select current=95 from public.balance_snapshots where user_id=owner_id);
  assert (select total=25 from public.pots where id=pot_id);

  begin
    perform public.mutate_owned_pot(owner_id,'10000000-0000-4000-8000-000000000002','add',1);
    raise exception 'Foreign pot accepted';
  exception when raise_exception then
    if sqlerrm<>'POT_NOT_FOUND' then raise; end if;
  end;
  begin
    perform public.mutate_owned_pot(foreign_id,'10000000-0000-4000-8000-000000000002','add',1);
    raise exception 'Missing balance accepted';
  exception when raise_exception then
    if sqlerrm<>'BALANCE_NOT_INITIALIZED' then raise; end if;
  end;

  insert into public.balance_snapshots(user_id,current,income,expense)
    values(owner_id,999,0,0);
  begin
    perform public.mutate_owned_pot(owner_id,pot_id,'add',1);
    raise exception 'Duplicate balances accepted';
  exception when raise_exception then
    if sqlerrm<>'BALANCE_NOT_UNIQUE' then raise; end if;
  end;
  assert (select sum(current)=1094 from public.balance_snapshots where user_id=owner_id);
  assert (select total=25 from public.pots where id=pot_id);
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon','public.mutate_owned_pot(uuid,uuid,text,numeric)','EXECUTE');
  assert not has_function_privilege('authenticated','public.mutate_owned_pot(uuid,uuid,text,numeric)','EXECUTE');
end $$;
rollback;
