'use client';

import { updateName } from '@/app/_actions/profileActions';
import { useActionState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';

function UpdateNameForm({ currentName }) {
  const [state, formAction] = useActionState(updateName, null);
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();

  useEffect(() => {
    if (state?.success && state?.name) {
      update({ name: state.name });
    }
  }, [state]);

  return (
    <div className="bg-white rounded-xl p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-grey-900" style={{ font: 'var(--text-preset-2)' }}>
          Update Name
        </h2>
        <p
          className="text-grey-500 mt-1"
          style={{ font: 'var(--text-preset-4)' }}
        >
          Change the name displayed on your account.
        </p>
      </div>

      <form
        action={(formData) => startTransition(() => formAction(formData))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="name"
            className="text-grey-500"
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={currentName}
            maxLength={50}
            disabled={isPending}
            className="w-full border border-beige-500 rounded-lg px-3 py-3 focus:outline-none text-grey-900 disabled:opacity-50"
            style={{ font: 'var(--text-preset-4)' }}
          />
          {state?.errors?.name && (
            <p
              className="text-red-600"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.name[0]}
            </p>
          )}
        </div>

        {state?.success && (
          <p className="text-green" style={{ font: 'var(--text-preset-5)' }}>
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full p-4 bg-grey-900 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ font: 'var(--text-preset-4-bold)' }}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default UpdateNameForm;
