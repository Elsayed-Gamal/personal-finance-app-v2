begin;

-- An imported balance is the starting balance. Mutations apply deltas; migrations
-- never recalculate historical balances from imported transactions.
create function public.mutate_owned_transaction(
  p_user_id uuid, p_transaction_id uuid, p_operation text,
  p_name text default null, p_amount numeric default null,
  p_date date default null, p_category_id uuid default null,
  p_recurring boolean default false
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  previous public.transactions%rowtype;
  balance public.balance_snapshots%rowtype;
  delta numeric;
begin
  if p_operation is null or p_operation not in ('create','edit','delete') then
    raise exception 'INVALID_OPERATION';
  end if;
  if p_transaction_id is null then raise exception 'TRANSACTION_NOT_FOUND'; end if;

  if p_operation in ('edit','delete') then
    select * into previous from public.transactions
      where id=p_transaction_id and user_id=p_user_id for update;
    if not found then raise exception 'TRANSACTION_NOT_FOUND'; end if;
  end if;

  if p_operation <> 'delete' then
    if p_name is null or length(btrim(p_name)) not between 1 and 100
      or p_amount is null or p_amount=0 or abs(p_amount)>90071992547409.91
      or p_amount::text in ('NaN','Infinity','-Infinity') or p_amount<>round(p_amount,2)
      or p_date is null or p_date<'1900-01-01'::date
      or p_date>(current_timestamp at time zone 'Africa/Cairo')::date
      or p_recurring is null or (p_recurring and p_amount>0) then
      raise exception 'INVALID_TRANSACTION';
    end if;
    if not exists(select 1 from public.categories where id=p_category_id) then
      raise exception 'INVALID_CATEGORY';
    end if;
  end if;

  -- Fail closed on legacy databases even before the unique-owner constraint lands.
  begin
    select * into strict balance from public.balance_snapshots
      where user_id=p_user_id for update;
  exception
    when no_data_found then raise exception 'BALANCE_NOT_INITIALIZED';
    when too_many_rows then raise exception 'BALANCE_NOT_UNIQUE';
  end;
  delta := case p_operation when 'create' then p_amount
    when 'edit' then p_amount-previous.amount else -previous.amount end;
  if balance.current+delta<0 then raise exception 'INSUFFICIENT_BALANCE'; end if;

  if p_operation='create' then
    insert into public.transactions(id,user_id,name,amount,date,category_id,recurring)
      values(p_transaction_id,p_user_id,btrim(p_name),p_amount,p_date,p_category_id,p_recurring);
  elsif p_operation='edit' then
    update public.transactions set name=btrim(p_name),amount=p_amount,date=p_date,
      category_id=p_category_id,recurring=p_recurring
      where id=p_transaction_id and user_id=p_user_id;
  else
    delete from public.transactions where id=p_transaction_id and user_id=p_user_id;
  end if;
  update public.balance_snapshots set current=current+delta
    where id=balance.id and user_id=p_user_id;
  return p_transaction_id;
end;
$$;
revoke all on function public.mutate_owned_transaction(uuid,uuid,text,text,numeric,date,uuid,boolean)
  from public,anon,authenticated;
grant execute on function public.mutate_owned_transaction(uuid,uuid,text,text,numeric,date,uuid,boolean) to service_role;

notify pgrst, 'reload schema';
commit;
