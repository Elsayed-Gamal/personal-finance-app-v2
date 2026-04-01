'use client';

import { login } from '@/app/_actions/authActions';
import Link from 'next/link';
import { useActionState, useTransition } from 'react';

function LoginPage() {
  const [state, formAction] = useActionState(login, null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="p-8 flex flex-col gap-8 bg-white rounded-xl w-140 mx-auto">
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
            id="email"
            name="email"
            className="w-full border border-beige-500 rounded-lg px-3 py-2 focus:outline-none text-grey-500"
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
          <input
            type="password"
            id="password"
            name="password"
            className="w-full border border-beige-500 rounded-lg px-3 py-2 focus:outline-none text-grey-500"
            disabled={isPending}
          />
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
          className="w-full p-4 bg-grey-900 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-grey-900"
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
