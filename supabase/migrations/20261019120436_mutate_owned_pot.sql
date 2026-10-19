begin;

-- Only the trusted server can call this function. p_user_id comes from NextAuth,
-- never from a client form. SECURITY INVOKER deliberately preserves caller privileges.
create function public.mutate_owned_pot(
  p_user_id uuid, p_pot_id uuid, p_operation text, p_amount numeric default null
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  owned_pot public.pots%rowtype;
  owned_balance public.balance_snapshots%rowtype;
  transfer_amount numeric;
begin
  if p_operation is null or p_operation not in ('add', 'withdraw', 'delete') then
    raise exception 'INVALID_OPERATION';
  end if;

  select * into owned_pot from public.pots
    where id = p_pot_id and user_id = p_user_id for update;
  if not found then raise exception 'POT_NOT_FOUND'; end if;
  if owned_pot.total is null or owned_pot.total < 0
    or owned_pot.total::text in ('NaN', 'Infinity', '-Infinity') then
    raise exception 'INVALID_POT_TOTAL';
  end if;

  if p_operation = 'delete' and owned_pot.total = 0 then
    delete from public.pots where id = p_pot_id and user_id = p_user_id;
    return;
  end if;

  if p_operation <> 'delete' and (
    p_amount is null or p_amount <= 0 or p_amount > 90071992547409.91
    or p_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_amount <> round(p_amount, 2)
  ) then raise exception 'INVALID_AMOUNT'; end if;

  -- Fail closed on the legacy schema before unique(user_id) is deployed.
  begin
    select * into strict owned_balance from public.balance_snapshots
      where user_id = p_user_id for update;
  exception
    when no_data_found then raise exception 'BALANCE_NOT_INITIALIZED';
    when too_many_rows then raise exception 'BALANCE_NOT_UNIQUE';
  end;

  if p_operation = 'add' then
    if p_amount > owned_balance.current then raise exception 'INSUFFICIENT_BALANCE'; end if;
    if owned_pot.target is null or owned_pot.target < 0
      or owned_pot.target::text in ('NaN', 'Infinity', '-Infinity') then
      raise exception 'INVALID_POT_TARGET';
    end if;
    if owned_pot.total + p_amount > owned_pot.target then raise exception 'TARGET_EXCEEDED'; end if;
    update public.pots set total = total + p_amount where id = p_pot_id and user_id = p_user_id;
    update public.balance_snapshots set current = current - p_amount
      where id = owned_balance.id and user_id = p_user_id;
  elsif p_operation = 'withdraw' then
    if p_amount > owned_pot.total then raise exception 'INSUFFICIENT_POT_FUNDS'; end if;
    update public.pots set total = total - p_amount where id = p_pot_id and user_id = p_user_id;
    update public.balance_snapshots set current = current + p_amount
      where id = owned_balance.id and user_id = p_user_id;
  else
    transfer_amount := owned_pot.total;
    delete from public.pots where id = p_pot_id and user_id = p_user_id;
    update public.balance_snapshots set current = current + transfer_amount
      where id = owned_balance.id and user_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.mutate_owned_pot(uuid,uuid,text,numeric)
  from public,anon,authenticated;
grant execute on function public.mutate_owned_pot(uuid,uuid,text,numeric) to service_role;
notify pgrst, 'reload schema';
commit;
