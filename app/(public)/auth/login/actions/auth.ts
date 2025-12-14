'use server';

import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/constants/app-routes';
import { signInWithPassword, signOut, signUp } from '@/lib/supabase/auth';
import { failure } from '@/lib/types/result';
import { loginSchema, registerSchema } from '@/lib/validators/auth';

export async function login(data: unknown) {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    console.error('[login] Validation failed:', parsed.error.issues);
    return failure('Invalid login data');
  }

  const result = await signInWithPassword(
    parsed.data.email,
    parsed.data.password,
  );

  if (!result.success) {
    return failure('Invalid email or password');
  }

  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}

export async function register(data: unknown) {
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    console.error('[register] Validation failed:', parsed.error.issues);
    return failure('Invalid registration data');
  }

  const result = await signUp(parsed.data.email, parsed.data.password);

  if (!result.success) {
    return failure('Unable to create account');
  }

  redirect(APP_ROUTES.PRIVATE.DASHBOARD);
}

export async function logout() {
  const result = await signOut();

  if (!result.success) {
    console.error('[logout] Error:', { error: result.error });
  }

  redirect(APP_ROUTES.AUTH.LOGIN);
}
