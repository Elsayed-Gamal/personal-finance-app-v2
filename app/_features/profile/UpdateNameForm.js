'use client';

import { updateName } from '@/app/_actions/profileActions';
import { useActionState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function UpdateNameForm({ currentName }) {
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();
  const router = useRouter();

  async function handleAction(prevState, formData) {
    const result = await updateName(prevState, formData);
    if (result?.success && result?.name) {
      await update({ name: result.name });
      router.refresh();
    }
    return result;
  }

  const [state, formAction] = useActionState(handleAction, null);

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
