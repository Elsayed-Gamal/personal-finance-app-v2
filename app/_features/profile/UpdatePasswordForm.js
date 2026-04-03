'use client';

import { updatePassword } from '@/app/_actions/profileActions';
import { useActionState, useTransition, useState } from 'react';
import EyeIcon from '@/app/_UI/icons/EyeIcon';
import EyeSlashIcon from '@/app/_UI/icons/EyeSlashIcon';

const passwordRequirements = [
  { label: 'At least 8 characters', regex: /.{8,}/ },
  { label: 'At least one uppercase letter', regex: /[A-Z]/ },
  { label: 'At least one lowercase letter', regex: /[a-z]/ },
  { label: 'At least one number', regex: /[0-9]/ },
  { label: 'At least one special character', regex: /[^A-Za-z0-9]/ },
];

function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null);
  const [isPending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPasswordValue, setCurrentPasswordValue] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

  return (
    <div className="bg-white rounded-xl p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-grey-900" style={{ font: 'var(--text-preset-2)' }}>
          Change Password
        </h2>
        <p
          className="text-grey-500 mt-5"
          style={{ font: 'var(--text-preset-4)' }}
        >
          Password must be at least 8 characters with uppercase, lowercase, a
          number, and a special character.
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
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={currentPasswordValue}
              onChange={(e) => setCurrentPasswordValue(e.target.value)}
              disabled={isPending}
              className="w-full border border-beige-500 rounded-lg px-3 py-3 pr-10 focus:outline-none text-grey-900 disabled:opacity-50"
              style={{ font: 'var(--text-preset-4)' }}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-900"
              tabIndex={-1}
            >
              {showCurrent ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
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
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              disabled={isPending}
              className="w-full border border-beige-500 rounded-lg px-3 py-3 pr-10 focus:outline-none text-grey-900 disabled:opacity-50"
              style={{ font: 'var(--text-preset-4)' }}
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-900"
              tabIndex={-1}
            >
              {showNew ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {passwordRequirements.map((req) => (
              <li
                key={req.label}
                className={`text-xs flex items-center gap-1.5 ${
                  req.regex.test(newPasswordValue)
                    ? 'text-green-600'
                    : 'text-grey-500'
                }`}
                style={{ font: 'var(--text-preset-5)' }}
              >
                <span>{req.regex.test(newPasswordValue) ? '✓' : '○'}</span>
                {req.label}
              </li>
            ))}
          </ul>
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
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              disabled={isPending}
              className="w-full border border-beige-500 rounded-lg px-3 py-3 pr-10 focus:outline-none text-grey-900 disabled:opacity-50"
              style={{ font: 'var(--text-preset-4)' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-900"
              tabIndex={-1}
            >
              {showConfirm ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
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
