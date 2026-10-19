'use client';
import { useContext, useState, useTransition } from 'react';
import Modal, { ModalContext } from '@/app/_UI/Modal';
import ConfirmAction from '@/app/_UI/ConfirmAction';
import {
  createTransaction,
  editTransaction,
  deleteTransaction,
} from '@/app/_actions/transactionActions';
import { todayISO } from '@/app/_utils/financialDates';

function TransactionForm({ transaction, categories }) {
  const [id] = useState(() => transaction?.id ?? crypto.randomUUID());
  const [values, setValues] = useState({
    name: transaction?.name ?? '',
    type: transaction?.amount > 0 ? 'income' : 'expense',
    amount: transaction ? Math.abs(transaction.amount) : '',
    date: transaction?.date.slice(0, 10) ?? todayISO(),
    category_id: transaction?.category_id ?? '',
    recurring: transaction?.recurring ?? false,
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const { close } = useContext(ModalContext);
  const change = (key, value) =>
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'type' && value === 'income' ? { recurring: false } : {}),
    }));
  function submit(formData) {
    setError('');
    startTransition(async () => {
      try {
        const result = await (transaction
          ? editTransaction(id, formData)
          : createTransaction(id, formData));
        if (result?.error) setError(result.error);
        else close();
      } catch {
        setError('Unable to save the transaction. Please try again.');
      }
    });
  }
  return (
    <form action={submit} className="flex flex-col gap-5">
      <h2 className="pr-8 text-2xl font-bold">
        {transaction ? 'Edit transaction' : 'Add transaction'}
      </h2>
      <p className="text-sm text-grey-500">
        Record money you have received or spent. Your available balance will
        update automatically.
      </p>
      <fieldset disabled={pending} className="grid min-w-0 gap-4">
        <label className="field-label">
          Recipient / sender
          <input
            className="form-input"
            name="name"
            value={values.name}
            onChange={(e) => change('name', e.target.value)}
            required
            maxLength={100}
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="field-label">
            Type
            <select
              className="form-input"
              name="type"
              value={values.type}
              onChange={(e) => change('type', e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="field-label">
            Amount (USD)
            <input
              className="form-input"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={values.amount}
              onChange={(e) => change('amount', e.target.value)}
            />
          </label>
        </div>
        <label className="field-label">
          Date
          <input
            className="form-input"
            name="date"
            type="date"
            required
            min="1900-01-01"
            max={todayISO()}
            value={values.date}
            onChange={(e) => change('date', e.target.value)}
          />
        </label>
        <label className="field-label">
          Category
          <select
            className="form-input"
            name="category_id"
            value={values.category_id}
            onChange={(e) => change('category_id', e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {values.type === 'expense' && (
          <label className="flex items-center gap-3 text-sm">
            <input
              name="recurring"
              type="checkbox"
              checked={values.recurring}
              onChange={(e) => change('recurring', e.target.checked)}
            />
            This is a monthly recurring bill
          </label>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-red">
          {error}
        </p>
      )}
      <button
        className="button-primary"
        disabled={pending || categories.length === 0}
      >
        {pending ? 'Saving...' : 'Save transaction'}
      </button>
    </form>
  );
}

export default function TransactionEditor({
  transaction,
  categories,
  balanceReady,
}) {
  return (
    <Modal>
      <div className="flex flex-wrap items-center gap-2">
        <Modal.Open opens="transaction-form">
          <button
            type="button"
            disabled={!balanceReady}
            className={
              transaction ? 'button-secondary text-xs' : 'button-primary'
            }
            aria-label={transaction ? `Edit ${transaction.name}` : undefined}
          >
            {transaction ? 'Edit' : '+ Add transaction'}
          </button>
        </Modal.Open>
        {transaction && (
          <Modal.Open opens="transaction-delete">
            <button
              type="button"
              disabled={!balanceReady}
              className="button-secondary text-xs text-red"
              aria-label={`Delete ${transaction.name}`}
            >
              Delete
            </button>
          </Modal.Open>
        )}
      </div>
      <Modal.Content name="transaction-form">
        <TransactionForm transaction={transaction} categories={categories} />
      </Modal.Content>
      {transaction && (
        <Modal.Content name="transaction-delete">
          <ConfirmAction
            title={`Delete ${transaction.name}?`}
            description="This removes the transaction and reverses its effect on your available balance."
            action={() => deleteTransaction(transaction.id)}
          />
        </Modal.Content>
      )}
    </Modal>
  );
}
