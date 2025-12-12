import AccountForm from '@/components/account/account-form';
import { requireAuth } from '@/lib/supabase/auth';
import { fetchProfile } from '@/lib/supabase/profile.server';

export default async function Account() {
  const user = await requireAuth();

  const result = await fetchProfile(user.id);

  const profile = result.success ? result.data : null;

  if (!result.success) {
    console.warn('failed to load profile on server:', result.error);
  }

  return <AccountForm user={user} initialProfile={profile} />;
}
