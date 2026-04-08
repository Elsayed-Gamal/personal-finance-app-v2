'use client';

import { useContext, useTransition } from 'react';
import { ModalContext } from '@/app/_UI/Modal';
import { adminDelete } from '@/app/_actions/adminActions';
import Loading from '@/app/_UI/Loading';

function ConfirmDeleteUser({ userId, userName }) {
  const { close } = useContext(ModalContext);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await adminDelete(userId);
      close();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        Delete &apos;{userName}&apos;?
      </h2>
      {isPending ? (
        <Loading />
      ) : (
        <>
          <p className="text-grey-500" style={{ font: 'var(--text-preset-4)' }}>
            Are you sure you want to delete this user? This action cannot be
            reversed, and all data associated with this account will be removed
            forever.
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
              onClick={close}
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

export default ConfirmDeleteUser;
