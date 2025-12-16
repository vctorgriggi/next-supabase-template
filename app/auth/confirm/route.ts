import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { APP_ROUTES } from '@/constants/app-routes';
import { getServerClient } from '@/lib/supabase/server';

// Not used currently, but can be used to redirect to different pages based on the type of OTP
// const redirectByType: Partial<Record<EmailOtpType, string>> = {
//   recovery: '/auth/reset-password',
// };

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = APP_ROUTES.PRIVATE.ACCOUNT; // Default redirect path

  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    const supabase = await getServerClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirectTo.pathname = redirectByType[type] || next;

      redirectTo.searchParams.delete('next');
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/error'; // Redirect to a generic error page
  return NextResponse.redirect(redirectTo);
}
