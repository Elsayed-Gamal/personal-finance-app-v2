'use client';

import { login } from '@/app/_actions/authActions';
import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import EyeIcon from '@/app/_UI/icons/EyeIcon';
import EyeSlashIcon from '@/app/_UI/icons/EyeSlashIcon';

function LoginPage() {
  const [state, formAction] = useActionState(login, null);
  const [isPending, startTransition] = useTransition();
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-140 flex-col gap-8 rounded-xl bg-white p-6 sm:p-8">
      <h1 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        Login
      </h1>
      <form action={(formData) => startTransition(() => formAction(formData))}>
        <div className="flex flex-col gap-1 mb-4">
          <label
            htmlFor="email"
            className="text-grey-500"
            style={{
              font: 'var(--text-preset-5-bold)',
            }}
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
            <p
              className="text-red-600 text-sm"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.email[0]}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 mb-8">
          <label
            htmlFor="password"
            className="text-grey-500"
            style={{
              font: 'var(--text-preset-5-bold)',
            }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          {state?.errors?.password && (
            <p
              className="text-red-600 text-sm"
              style={{ font: 'var(--text-preset-5)' }}
            >
              {state.errors.password[0]}
            </p>
          )}
        </div>
        {state?.error && (
          <p
            className="text-red-600 text-sm mb-4"
            style={{ font: 'var(--text-preset-5)' }}
          >
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="button-primary w-full touch-manipulation p-4"
          style={{ font: 'var(--text-preset-4-bold)' }}
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div>
        <p
          className="text-grey-500 text-center"
          style={{ font: 'var(--text-preset-4)' }}
        >
          Need to create an account?{' '}
          <Link
            href="/signup"
            className="touch-manipulation rounded text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            style={{ font: 'var(--text-preset-4-bold)' }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
