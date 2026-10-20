'use client';

import { signup } from '@/app/_actions/authActions';
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

function SignupForm() {
  const [state, formAction] = useActionState(signup, null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  return (
    <form action={(formData) => startTransition(() => formAction(formData))}>
      <div className="flex flex-col gap-1 mb-4">
        <label
          htmlFor="name"
          className="text-grey-500"
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          Name
        </label>
        <input
          type="text"
          autoComplete="name"
          id="name"
          name="name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full rounded-lg border border-beige-500 px-3 py-2 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          disabled={isPending}
        />
        {state?.errors?.name && (
          <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-4">
        <label
          htmlFor="email"
          className="text-grey-500"
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          id="email"
          name="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          className="w-full rounded-lg border border-beige-500 px-3 py-2 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          disabled={isPending}
        />
        {state?.errors?.email && (
          <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-8">
        <label
          htmlFor="password"
          className="text-grey-500"
          style={{ font: 'var(--text-preset-5-bold)' }}
        >
          Create Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            id="password"
            name="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="w-full rounded-lg border border-beige-500 px-3 py-2 pr-12 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-1 z-10 flex h-10 w-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded text-grey-500 hover:text-grey-900 focus-visible:outline-2 focus-visible:outline-green"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>
        <ul className="mt-2 flex flex-col gap-1">
          {passwordRequirements.map((req) => (
            <li
              key={req.label}
              className={`text-xs flex items-center gap-1.5 ${
                req.regex.test(passwordValue) ? 'text-green' : 'text-grey-500'
              }`}
              style={{ font: 'var(--text-preset-5)' }}
            >
              <span>{req.regex.test(passwordValue) ? '✓' : '○'}</span>
              {req.label}
            </li>
          ))}
        </ul>
        {state?.errors?.password && (
          <p className="text-red" style={{ font: 'var(--text-preset-5)' }}>
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="button-primary w-full touch-manipulation p-4"
        style={{ font: 'var(--text-preset-4-bold)' }}
      >
        {isPending ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

export default SignupForm;
