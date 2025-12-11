import { createClient as CreateServerClient } from './server';

export async function getCurrentUserServer() {
  const supabase = await CreateServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;
  return data.user;
}
