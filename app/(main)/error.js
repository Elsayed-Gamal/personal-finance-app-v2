'use client';

import { signOutToLogin } from '@/app/_utils/signOutToLogin';

export default function MainError({ reset, error }) {
  return (
    <section role="alert" className="mx-auto max-w-xl rounded-xl bg-white p-8">
      <h1 className="text-2xl font-bold">We couldn’t load this page</h1>
      <p className="mt-3 text-grey-500">
        Your financial data could not be loaded. Try again, or sign in again if
        your session has expired.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="button-primary" onClick={reset}>
          Try again
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={signOutToLogin}
        >
          Sign out and sign in again
        </button>
      </div>
    </section>
  );
}
