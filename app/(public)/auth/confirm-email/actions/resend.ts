'use server';

import { resendConfirmationEmail } from '@/lib/supabase/auth';
import { failure } from '@/lib/types/result';
import { resendSchema } from '@/lib/validators/resend';

export async function resend(data: unknown) {
  const parsed = resendSchema.safeParse(data);

  if (!parsed.success) {
    console.error('[resend] Validation failed:', parsed.error.issues);
    return failure('Invalid email address');
  }

  const result = await resendConfirmationEmail(parsed.data.email);

  if (!result.success) {
    return failure('INVALID_EMAIL_ADDRESS');
  }

  return result;
}
