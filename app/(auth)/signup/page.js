import Link from 'next/link';
import { isRegistrationOpen } from '@/app/_services/apiSettings';
import SignupForm from './SignupForm';

async function SignupPage() {
  const registrationOpen = await isRegistrationOpen();

  return (
    <div className="p-8 flex flex-col gap-8 bg-white rounded-xl w-140 mx-auto">
      <h1 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
        Sign Up
      </h1>

      {registrationOpen ? (
        <SignupForm />
      ) : (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-8 w-8 fill-red"
              aria-hidden="true"
            >
              <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-5a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v4z" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p
              className="text-grey-900"
              style={{ font: 'var(--text-preset-2)' }}
            >
              Registration is currently closed
            </p>
            <p
              className="text-grey-500"
              style={{ font: 'var(--text-preset-4)' }}
            >
              New sign-ups are temporarily disabled. Please check back later or
              contact the administrator.
            </p>
          </div>
        </div>
      )}

      <p
        className="text-grey-500 text-center"
        style={{ font: 'var(--text-preset-4)' }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-grey-900"
          style={{ font: 'var(--text-preset-4-bold)' }}
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
