import { auth } from '@/app/_services/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/app/_services/apiUsers';
import { isRegistrationOpen } from '@/app/_services/apiSettings';
import AdminHeader from '@/app/_features/admin/AdminHeader';
import UsersTable from '@/app/_features/admin/UsersTable';
import RegistrationToggle from '@/app/_features/admin/RegistrationToggle';

export const metadata = {
  title: 'Admin Panel | Personal Finance App',
};

async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const [users, registrationOpen] = await Promise.all([
    getAllUsers(),
    isRegistrationOpen(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader />
      <RegistrationToggle isOpen={registrationOpen} />
      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}

export default AdminPage;
