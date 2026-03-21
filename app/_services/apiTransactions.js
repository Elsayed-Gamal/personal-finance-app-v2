import supabase from './supabase';

export async function getTransactions(
  page = 1,
  searchQuery = '',
  sort,
  category,
  limit = 10,
) {
  let query = supabase
    .from('transactions')
    .select('name, categories!inner(name), date, amount, avatar, id', {
      count: 'exact',
    })
    .range((page - 1) * limit, page * limit - 1);

  if (searchQuery) {
    query.ilike('name', `%${searchQuery}%`);
  }

  if (sort) {
    const [field, order] = sort.split('_');
    query.order(field, { ascending: order === 'asc' });
  }

  if (category && category !== 'all') {
    query.eq('categories.name', category);
  }

  const { data: transactions, error, count } = await query;
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Failed to fetch transactions');
  }

  return { transactions, count };
}

export async function getRecurringBills() {
  const { data: recurringBills, error } = await supabase
    .from('unique_recurring_bills')
    .select('*')
    .order('day', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return recurringBills;
}
