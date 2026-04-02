import { auth } from '@/app/_services/auth';
import UpdateNameForm from '@/app/_features/profile/UpdateNameForm';
import UpdatePasswordForm from '@/app/_features/profile/UpdatePasswordForm';

async function ProfilePage() {
  const { user } = await auth();
  // console.log(user);

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : '?';

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex h-14 items-center">
        <h1 className="text-grey-900" style={{ font: 'var(--text-preset-1)' }}>
          Profile
        </h1>
      </div>

      {/* User identity card */}
      <div className="bg-white rounded-xl p-8 flex items-center gap-6">
        <div
          className="flex items-center justify-center rounded-full bg-grey-900 text-white shrink-0"
          style={{
            width: 72,
            height: 72,
            font: 'var(--text-preset-2)',
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-grey-500" style={{ font: 'var(--text-preset-5)' }}>
            Welcome back,
          </p>
          <p className="text-grey-900" style={{ font: 'var(--text-preset-2)' }}>
            {user?.name}
          </p>
          <p className="text-grey-500" style={{ font: 'var(--text-preset-5)' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpdateNameForm currentName={user?.name ?? ''} />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

export default ProfilePage;
