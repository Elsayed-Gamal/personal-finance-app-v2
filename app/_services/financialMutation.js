import 'server-only';
import { revalidatePath } from 'next/cache';

export async function runFinancialMutation(operation) {
  try {
    await operation();
  } catch (error) {
    return {
      error: error.message || 'Unable to save your changes. Please try again.',
    };
  }
  for (const route of [
    '/',
    '/transactions',
    '/budgets',
    '/pots',
    '/recurring-bills',
  ])
    revalidatePath(route);
  return { success: true };
}
