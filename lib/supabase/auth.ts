import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/constants/app-routes';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import { getServerClient } from './server';

/**
 * Helpers
 */
export async function getCurrentUser() {
  const supabase = await getServerClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Auth guards for Server Actions and Server Components
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect(APP_ROUTES.AUTH.LOGIN);
  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();
  if (user) redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}

/**
 * Auth actions
 */
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
    if (error.code === 'email_not_confirmed') {
      return failure('AUTH_EMAIL_NOT_CONFIRMED');
    }

    // console.error('[auth] Sign in failed', { error });
    // use a generic error message to avoid leaking info
    return failure('Could not sign in');
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
    // console.error('[auth] Sign up failed', { error });
    // use a generic error message to avoid leaking info
    return failure('Could not sign up');
  }

  revalidatePath('/', 'layout');
  return success(true);
}

export async function signOut(): Promise<Result<boolean>> {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return success(true);
}

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(
  email: string,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) {
    // console.error('[auth] resend confirmation failed', error);
    // use a generic error message to avoid leaking info
    return failure('Could not resend confirmation email');
  }

  return success(true);
}
