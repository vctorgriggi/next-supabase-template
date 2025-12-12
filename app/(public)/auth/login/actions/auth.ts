'use server';

import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/constants/app-routes';
import { signInWithPassword, signOut, signUp } from '@/lib/supabase/auth';

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'email and password are required' };
  }

  const result = await signInWithPassword(
    email.toString(),
    password.toString(),
  );

  if (!result.success) {
    return { error: result.error };
  }

  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}

export async function register(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'email and password are required' };
  }

  const result = await signUp(email.toString(), password.toString());

  if (!result.success) {
    return { error: result.error };
  }

  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}

export async function logout() {
  const result = await signOut();

  if (!result.success) {
    console.error('logout error:', result.error);
  }

  redirect(APP_ROUTES.AUTH.LOGIN);
}
