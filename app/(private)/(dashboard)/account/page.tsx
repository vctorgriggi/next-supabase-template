import AccountForm from '@/components/features/account/account-form';
import { getCurrentUser } from '@/lib/supabase/auth';

export default async function Account() {
  const user = await getCurrentUser();

  return <AccountForm user={user!} />;
}
