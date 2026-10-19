'use client';
import { useContext, useState, useTransition } from 'react';
import Modal, { ModalContext } from '@/app/_UI/Modal';
import ConfirmAction from '@/app/_UI/ConfirmAction';
import { createBudget, editBudget, deleteBudget } from '@/app/_actions/budgetActions';

function BudgetForm({ budget, categories }) {
  const [id] = useState(() => budget?.id ?? crypto.randomUUID());
  const [category, setCategory] = useState(budget?.category_id ?? '');
  const [maximum, setMaximum] = useState(budget?.maximum ?? '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const { close } = useContext(ModalContext);
  function submit(formData) {
    setError('');
    startTransition(async () => {
      try {
        const result = await (budget ? editBudget(id, formData) : createBudget(id, formData));
        if (result?.error) setError(result.error); else close();
      } catch { setError('Unable to save the budget. Please try again.'); }
    });
  }
  return <form action={submit} className="flex flex-col gap-5">
    <h2 className="pr-8 text-2xl font-bold">{budget ? 'Edit budget' : 'Add budget'}</h2>
    <p className="text-sm text-grey-500">Set a monthly spending limit for a category. This limit applies each month and does not move money.</p>
    <fieldset disabled={pending} className="grid min-w-0 gap-4">
      <label className="field-label">Category<select className="form-input" name="category_id" value={category} onChange={e => setCategory(e.target.value)} required><option value="">Select a category</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="field-label">Monthly limit (USD)<input className="form-input" name="maximum" type="number" required min="0.01" step="0.01" value={maximum} onChange={e => setMaximum(e.target.value)} /></label>
    </fieldset>
    {error && <p role="alert" className="text-red">{error}</p>}
    <button className="button-primary" disabled={pending || categories.length === 0}>{pending ? 'Saving...' : 'Save budget'}</button>
  </form>;
}

export default function BudgetEditor({ budget, categories }) {
  return <Modal>
    <div className="flex flex-wrap gap-2">
      <Modal.Open opens="budget-form"><button type="button" className={budget ? 'button-secondary text-xs' : 'button-primary'} aria-label={budget ? `Edit ${budget.name} budget` : undefined}>{budget ? 'Edit' : '+ Add budget'}</button></Modal.Open>
      {budget && <Modal.Open opens="budget-delete"><button type="button" className="button-secondary text-xs text-red" aria-label={`Delete ${budget.name} budget`}>Delete</button></Modal.Open>}
    </div>
    <Modal.Content name="budget-form"><BudgetForm budget={budget} categories={categories} /></Modal.Content>
    {budget && <Modal.Content name="budget-delete"><ConfirmAction title={`Delete ${budget.name} budget?`} description="The budget will be removed. Your transactions and available balance will stay the same." action={() => deleteBudget(budget.id)} /></Modal.Content>}
  </Modal>;
}
