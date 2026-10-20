import 'server-only';
import supabase from './supabase';
import { requireUser } from './authorization';
import { monthRange } from '../_utils/financialDates';
import {
  budgetSchema,
  parseFinancial,
  recordIdSchema,
} from '../_utils/financialSchemas';

export async function getBudgets(month) {
  const user = await requireUser();
  const { start, end } = monthRange(month);
  const { data, error } = await supabase.rpc('get_owned_budget_summary', {
    p_user_id: user.id,
    p_start: start,
    p_end: end,
  });
  if (error) throw new Error('Unable to load your budgets. Please try again.');
  return data;
}

export async function getBudgetSpending(month) {
  const user = await requireUser();
  const { start, end } = monthRange(month);
  const { data, error } = await supabase
    .from('transactions')
    .select('id, name, avatar, amount, date, category_id')
    .eq('user_id', user.id)
    .lt('amount', 0)
    .gte('date', start)
    .lt('date', end)
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(300);

  if (error)
    throw new Error('Unable to load recent budget spending. Please try again.');

  const spendingByCategory = {};
  for (const transaction of data ?? []) {
    if (!transaction.category_id) continue;
    const categorySpending = spendingByCategory[transaction.category_id] ?? [];
    if (categorySpending.length < 3) categorySpending.push(transaction);
    spendingByCategory[transaction.category_id] = categorySpending;
  }

  return spendingByCategory;
}

export async function saveBudget(operation, budgetId, input) {
  const user = await requireUser();
  if (!['create', 'edit', 'delete'].includes(operation))
    throw new Error('Invalid operation.');
  const id = parseFinancial(recordIdSchema, budgetId);
  const fields =
    operation === 'delete' ? null : parseFinancial(budgetSchema, input);
  let query = supabase.from('budgets');
  if (operation === 'create')
    query = query.insert({ ...fields, id, user_id: user.id });
  else if (operation === 'edit')
    query = query.update(fields).eq('id', id).eq('user_id', user.id);
  else query = query.delete().eq('id', id).eq('user_id', user.id);
  const { data, error } = await query.select('id').maybeSingle();
  if (error?.code === '23505')
    throw new Error('You already have a budget for this category.');
  if (error?.code === '23503') throw new Error('Choose a valid category.');
  if (error)
    throw new Error(
      'Unable to save the budget. Please try again.' + error.message,
    );
  if (!data) throw new Error('Budget not found.');
}
