import 'server-only';
import { requireUser } from './authorization';
import supabase from './supabase';
import {
  potSchema,
  potIdSchema,
  moneyAmountSchema,
} from '../_utils/potSchemas';

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);
  return result.data;
}

function mutationError(error) {
  if (error?.code === '23505')
    return new Error('You already have a pot with this name.');
  const messages = {
    POT_NOT_FOUND: 'Pot not found.',
    BALANCE_NOT_INITIALIZED:
      'Your balance is not set up yet. Contact the administrator before moving money.',
    BALANCE_NOT_UNIQUE:
      'Your balance records need administrator review before moving money.',
    INVALID_AMOUNT:
      'Enter a positive amount with no more than two decimal places.',
    INSUFFICIENT_BALANCE: 'Insufficient balance to add this amount.',
    INSUFFICIENT_POT_FUNDS: 'Insufficient funds in this pot.',
    TARGET_EXCEEDED: 'This amount would exceed the pot target.',
    INVALID_POT_TOTAL:
      'This pot needs its saved amount checked before moving money.',
    INVALID_POT_TARGET:
      'This pot needs its target checked before moving money.',
  };
  return new Error(
    messages[error?.message] || 'Unable to save the pot. Please try again.',
  );
}

export async function getPots() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from('pots')
    .select('id, name, target, total, theme')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id');
  if (error) throw new Error('Unable to load your pots.');
  return data;
}

export async function getPotDetails(potId) {
  const user = await requireUser();
  const id = parse(potIdSchema, potId);
  const { data, error } = await supabase
    .from('pots')
    .select('id, name, target, total, theme')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw new Error('Unable to load the pot.');
  if (!data) throw new Error('Pot not found.');
  return data;
}

export async function addPot(input) {
  const user = await requireUser();
  const pot = parse(potSchema, input);
  const { data, error } = await supabase
    .from('pots')
    .insert({ ...pot, total: 0, user_id: user.id })
    .select('id')
    .single();
  if (error) throw mutationError(error);
  return data;
}

export async function editPot({ potId, updatedFields }) {
  const user = await requireUser();
  const id = parse(potIdSchema, potId);
  const fields = parse(potSchema, updatedFields);
  // The conditional UPDATE also protects against a deposit racing this edit.
  const { data, error } = await supabase
    .from('pots')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id)
    .lte('total', fields.target)
    .select('id')
    .maybeSingle();
  if (error) throw mutationError(error);
  if (!data)
    throw new Error('Pot not found, or the target is below its saved amount.');
  return data;
}

async function mutateMoney(potId, operation, amount = null) {
  const user = await requireUser();
  const id = parse(potIdSchema, potId);
  const validatedAmount =
    operation === 'delete' ? null : parse(moneyAmountSchema, amount);
  // A single database transaction verifies ownership, locks the rows and
  // updates both records. Never fall back to separate balance/pot writes.
  const { error } = await supabase.rpc('mutate_owned_pot', {
    p_user_id: user.id,
    p_pot_id: id,
    p_operation: operation,
    p_amount: validatedAmount,
  });
  if (error) throw mutationError(error);
}

export async function deletePot(potId) {
  await mutateMoney(potId, 'delete');
}

export async function addMoneyToPot({ potId, amount }) {
  await mutateMoney(potId, 'add', amount);
}

export async function withdrawMoneyFromPot({ potId, amount }) {
  await mutateMoney(potId, 'withdraw', amount);
}
