import { fetchProfileWithClient } from '@/lib/supabase/profile';
import { createClient as CreateServerClient } from '@/lib/supabase/server';

import AccountForm from './account-form';

export default async function Account() {
  const supabase = await CreateServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  let profile = null;
  try {
    profile = await fetchProfileWithClient(supabase, user.id);
  } catch (err) {
    console.warn('failed to load profile on server:', err);
    profile = null;
  }

  return <AccountForm user={user} initialProfile={profile} />;
}
