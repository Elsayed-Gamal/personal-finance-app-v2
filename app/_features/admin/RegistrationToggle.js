'use client';

import { useTransition } from 'react';
import { toggleRegistration } from '@/app/_actions/adminActions';

function RegistrationToggle({ isOpen }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => toggleRegistration(isOpen));
  };

  return (
    <section className="rounded-xl bg-white p-5 sm:p-8">
      <div className="flex flex-col items-stretch justify-between gap-5 sm:flex-row sm:items-center sm:gap-4">
        {/* Left: label + description */}
        <div className="flex flex-col gap-1">
          <h2
            className="text-grey-900"
            style={{ font: 'var(--text-preset-2)' }}
          >
            User Registration
          </h2>
          <p className="text-grey-500" style={{ font: 'var(--text-preset-4)' }}>
            {isOpen
              ? 'New users can currently sign up for an account.'
              : 'Sign-up is disabled. No new accounts can be created.'}
          </p>
        </div>

        {/* Right: status badge + toggle button */}
        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-start">
          <span
            className={`inline-block rounded-full px-3 py-1 ${
              isOpen ? 'bg-green/15 text-green' : 'bg-red/15 text-red'
            }`}
            style={{ font: 'var(--text-preset-5-bold)' }}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>

          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-not-allowed disabled:opacity-50 ${
              isOpen ? 'bg-green' : 'bg-grey-300'
            }`}
            aria-label="Toggle registration"
            role="switch"
            aria-checked={isOpen}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isOpen ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}

export default RegistrationToggle;
