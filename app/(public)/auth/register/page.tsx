import Link from 'next/link';
import React from 'react';

import RegisterForm from '@/components/auth/register-form';
import { APP_ROUTES } from '@/constants/app-routes';
import { requireGuest } from '@/lib/supabase/auth';

export default async function Register() {
  await requireGuest();

  return (
    <React.Fragment>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto dark:hidden"
          />
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="mx-auto h-10 w-auto not-dark:hidden"
          />

          <h2 className="text-foreground mt-10 text-center text-2xl font-bold tracking-tight">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {/* form server action */}
          <RegisterForm />

          <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
            {'Already have an account? '}
            <Link
              href={APP_ROUTES.AUTH.LOGIN}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </React.Fragment>
  );
}
