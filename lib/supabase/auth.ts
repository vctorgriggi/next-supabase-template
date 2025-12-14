import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/constants/app-routes';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import { getServerClient } from './server';

export async function getCurrentUser() {
  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;
  return data.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.AUTH.LOGIN);
  }

  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();

  if (user) {
    redirect(APP_ROUTES.PRIVATE.DASHBOARD);
  }
}

// auth actions
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('sign in error:', error);
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}

export async function signUp(
  email: string,
  password: string,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('sign up error:', error);
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}

export async function signOut(): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return failure('no user to sign out');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('sign out error:', error);
    return failure(error.message);
  }

  revalidatePath('/', 'layout');
  return success(true);
}
