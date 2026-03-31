import { auth } from '@/app/_services/auth';

async function ProfilePage() {
  const { user } = await auth();

  return (
    <div>
      <h1>Welcome, {user?.name.split(' ')[0]}</h1>
    </div>
  );
}

export default ProfilePage;
