import Link from 'next/link';

import ResendForm from '@/components/auth/confirm-email/resend-form';
import { APP_ROUTES } from '@/constants/app-routes';

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-lg">
        <div>
          <div className="text-center">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="mx-auto size-12 text-gray-400 dark:text-gray-500"
            >
              <path
                d="M6 12h36v24H6z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12l18 14L42 12"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
              Didn’t receive the confirmation email?
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter the email address you used to sign up and we’ll resend the
              confirmation link.
            </p>
          </div>

          <ResendForm />

          <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
            {'Back to '}
            <Link
              href={APP_ROUTES.AUTH.LOGIN}
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
