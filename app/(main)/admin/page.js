import { requireUser } from "@/app/_services/authorization";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/app/_services/apiUsers";
import { isRegistrationOpen } from "@/app/_services/apiSettings";
import AdminHeader from "@/app/_features/admin/AdminHeader";
import UsersTable from "@/app/_features/admin/UsersTable";
import RegistrationToggle from "@/app/_features/admin/RegistrationToggle";

export const metadata = {
  title: "Admin Panel | Personal Finance App",
};

async function AdminPage() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const [users, registrationOpen] = await Promise.all([
    getAllUsers(),
    isRegistrationOpen(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader />
      <RegistrationToggle isOpen={registrationOpen} />
      <UsersTable users={users} currentUserId={user.id} />
    </div>
  );
}

export default AdminPage;
