'use client';
import { useContext, useState, useTransition } from 'react';
import { ModalContext } from './Modal';

export default function ConfirmAction({ title, description, action, label = 'Confirm deletion' }) {
  const { close } = useContext(ModalContext);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  function submit() {
    setError('');
    startTransition(async () => {
      try {
        const result = await action();
        if (result?.error) setError(result.error); else close();
      } catch { setError('Unable to save your changes. Please try again.'); }
    });
  }
  return <div className="flex flex-col gap-5">
    <h2 className="pr-8 text-2xl font-bold">{title}</h2>
    <p className="text-grey-500">{description}</p>
    {error && <p role="alert" className="text-red">{error}</p>}
    <button className="button-danger" disabled={pending} onClick={submit}>{pending ? 'Saving...' : label}</button>
    <button className="button-secondary" disabled={pending} onClick={close}>Cancel</button>
  </div>;
}
