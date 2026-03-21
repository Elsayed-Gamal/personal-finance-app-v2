'use client';

import { useContext, useTransition } from 'react';
import Loading from './Loading';
import { ModalContext } from './Modal';
import { deletePot } from '../_actions/potsActions';

function ConfirmDelete({ potName }) {
  const { close } = useContext(ModalContext);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deletePot(potName);
      close();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        Delete ‘{potName}’?
      </h2>
      {isPending ? (
        <Loading />
      ) : (
        <>
          <p className="text-grey-500" style={{ font: 'var(--text-preset-4)' }}>
            Are you sure you want to delete this pot? This action cannot be
            reversed, and all the data inside it will be removed forever.
          </p>
          <div className="flex flex-col gap-4">
            <button
              className="bg-red flex-1 cursor-pointer rounded-lg py-5 text-white transition"
              onClick={handleDelete}
              style={{ font: 'var(--text-preset-4-bold)' }}
            >
              Yes, Confirm Deletion
            </button>
            <button
              className="text-grey-500 flex-1 cursor-pointer rounded-lg bg-transparent transition"
              onClick={() => close()}
              style={{ font: 'var(--text-preset-4)' }}
            >
              No, Go Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ConfirmDelete;
