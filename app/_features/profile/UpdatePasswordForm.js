'use client';

import { updatePassword } from '@/app/_actions/profileActions';
import { useActionState, useTransition } from 'react';

function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-white rounded-xl p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-grey-900" style={{ font: 'var(--text-preset-2)' }}>
          Change Password
        </h2>
        <p
          className="text-grey-500 mt-1"
          style={{ font: 'var(--text-preset-4)' }}
        >
          Make sure your new password is at least 8 characters long.
        </p>
      </div>

      <form
        action={(formData) => startTransition(() => formAction(formData))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="currentPassword"
            className="text-grey-500"
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            disabled={isPending}
            className="w-full border border-beige-500 rounded-lg px-3 py-3 focus:outline-none text-grey-900 disabled:opacity-50"
            style={{ font: 'var(--text-preset-4)' }}
          />
          {state?.errors?.currentPassword && (
            <p
              className="text-red-600"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.currentPassword[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="newPassword"
            className="text-grey-500"
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            disabled={isPending}
            className="w-full border border-beige-500 rounded-lg px-3 py-3 focus:outline-none text-grey-900 disabled:opacity-50"
            style={{ font: 'var(--text-preset-4)' }}
          />
          {state?.errors?.newPassword && (
            <p
              className="text-red-600"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.newPassword[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirmPassword"
            className="text-grey-500"
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            disabled={isPending}
            className="w-full border border-beige-500 rounded-lg px-3 py-3 focus:outline-none text-grey-900 disabled:opacity-50"
            style={{ font: 'var(--text-preset-4)' }}
          />
          {state?.errors?.confirmPassword && (
            <p
              className="text-red-600"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.confirmPassword[0]}
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
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default UpdatePasswordForm;
