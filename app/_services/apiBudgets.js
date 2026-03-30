import supabase from './supabase';

export async function getBudgets() {
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('categories!inner(name, theme), maximum')
    .order('maximum', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Failed to fetch budgets');
  }

  const categoryNames = [...new Set(budgets.map((b) => b.categories.name))];

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, categories!inner(name)')
    .in('categories.name', categoryNames)
    .gte('date', '2024-08-01')
    .lt('date', '2024-09-01')
    .lt('amount', 0);

  if (txError) {
    console.error('Supabase error:', txError);
    throw new Error(txError.message || 'Failed to fetch transactions');
  }

  const spentByCategory = {};
  for (const tx of transactions) {
    const cat = tx.categories.name;
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(tx.amount);
  }

  const finalBudgets = budgets.map((budget) => ({
    name: budget.categories.name,
    maximum: budget.maximum,
    spent: spentByCategory[budget.categories.name] || 0,
    color: budget.categories.theme,
  }));

  return finalBudgets;
}
