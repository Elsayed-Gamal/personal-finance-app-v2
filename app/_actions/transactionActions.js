'use server';
import { saveTransaction } from '../_services/apiTransactions';
import { runFinancialMutation } from '../_services/financialMutation';

function fields(formData) {
  return {
    name: formData.get('name'), type: formData.get('type'),
    amount: Number(formData.get('amount')), date: formData.get('date'),
    category_id: formData.get('category_id'), recurring: formData.get('recurring') === 'on',
  };
}
export async function createTransaction(id, formData) {
  return runFinancialMutation(() => saveTransaction('create', id, fields(formData)));
}
export async function editTransaction(id, formData) {
  return runFinancialMutation(() => saveTransaction('edit', id, fields(formData)));
}
export async function deleteTransaction(id) {
  return runFinancialMutation(() => saveTransaction('delete', id));
}
