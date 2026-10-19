begin;

-- Serializing on the user row makes this safe before the pending unique(user_id)
-- constraint is deployed and prevents two requests creating two opening balances.
create function public.initialize_owned_balance(p_user_id uuid, p_opening_balance numeric)
returns numeric language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid;
  existing_count integer;
begin
  if p_user_id is null then raise exception 'USER_NOT_FOUND'; end if;
  if p_opening_balance is null or p_opening_balance < 0
    or p_opening_balance > 90071992547409.91
    or p_opening_balance::text in ('NaN','Infinity','-Infinity')
    or p_opening_balance <> round(p_opening_balance,2) then
    raise exception 'INVALID_OPENING_BALANCE';
  end if;

  select id into owner_id from public.users where id=p_user_id for update;
  if not found then raise exception 'USER_NOT_FOUND'; end if;

  select count(*) into existing_count from public.balance_snapshots where user_id=p_user_id;
  if existing_count <> 0 then raise exception 'BALANCE_ALREADY_INITIALIZED'; end if;

  insert into public.balance_snapshots(user_id,current,income,expense)
    values(p_user_id,p_opening_balance,0,0);
  return p_opening_balance;
end;
$$;
revoke all on function public.initialize_owned_balance(uuid,numeric)
  from public,anon,authenticated;
grant execute on function public.initialize_owned_balance(uuid,numeric) to service_role;
notify pgrst, 'reload schema';
commit;
