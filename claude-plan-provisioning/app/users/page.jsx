import AdminShell from '@/components/AdminShell';
import { PageHeader } from '@/components/PageHeader';
import UserTable from '@/components/UserTable';
import { getUsers } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let initialUserData = { users: [], total: 0, page: 1, totalPages: 1, from: 0, to: 0 };
  try {
    initialUserData = await getUsers({ search: '', plan: 'All', page: 1, limit: 10 });
  } catch (e) {
    console.error('UsersPage failed to fetch initial users:', e.message);
  }

  return (
    <AdminShell>
      <PageHeader
        title="Users & Provisioning"
        subtitle="Search, manage, and grant Claude plan access to team members"
      />
      <div className="content">
        <UserTable initialData={initialUserData} />
      </div>
    </AdminShell>
  );
}
