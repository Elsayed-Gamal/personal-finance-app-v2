begin;
set local role service_role;
do $$
declare
  user_b uuid := '00000000-0000-4000-8000-000000000002';
begin
  assert public.initialize_owned_balance(user_b,123.45)=123.45;
  assert (select current=123.45 and income=0 and expense=0
    from public.balance_snapshots where user_id=user_b), 'Opening balance values are wrong';

  begin
    perform public.initialize_owned_balance(user_b,999);
    raise exception 'Existing balance was overwritten';
  exception when raise_exception then
    if sqlerrm<>'BALANCE_ALREADY_INITIALIZED' then raise; end if;
  end;
  assert (select current=123.45 from public.balance_snapshots where user_id=user_b),
    'Rejected retry changed the balance';

  begin
    perform public.initialize_owned_balance('00000000-0000-4000-8000-000000000099',10);
    raise exception 'Missing user accepted';
  exception when raise_exception then
    if sqlerrm<>'USER_NOT_FOUND' then raise; end if;
  end;

  begin
    perform public.initialize_owned_balance('00000000-0000-4000-8000-000000000003',-1);
    raise exception 'Negative balance accepted';
  exception when raise_exception then
    if sqlerrm<>'INVALID_OPENING_BALANCE' then raise; end if;
  end;
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon','public.initialize_owned_balance(uuid,numeric)','EXECUTE');
  assert not has_function_privilege('authenticated','public.initialize_owned_balance(uuid,numeric)','EXECUTE');
  assert has_function_privilege('service_role','public.initialize_owned_balance(uuid,numeric)','EXECUTE');
end $$;
rollback;
