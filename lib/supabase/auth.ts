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

// auth infra
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
    console.error('[auth] Sign in failed', { error });
    return failure('AUTH_SIGN_IN_FAILED');
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
    console.error('[auth] Sign up failed', { error });
    return failure('AUTH_SIGN_UP_FAILED');
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
    return failure('AUTH_NO_USER');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[auth] Sign out failed', { error });
    return failure('AUTH_SIGN_OUT_FAILED');
  }

  revalidatePath('/', 'layout');
  return success(true);
}
