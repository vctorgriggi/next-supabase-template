import Link from 'next/link';

import { APP_ROUTES } from '@/constants/app-routes';

export default function Error() {
  return (
    <div className="grid min-h-full grid-cols-1 grid-rows-[1fr_auto_1fr] lg:grid-cols-[max(50%,36rem)_1fr]">
      <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
        <span className="sr-only">Your Company</span>
        <img
          alt=""
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="h-10 w-auto sm:h-12 dark:hidden"
        />
        <img
          alt=""
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          className="h-10 w-auto not-dark:hidden sm:h-12"
        />
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
        <div className="max-w-lg">
          {/* <p className="text-base/8 font-semibold text-indigo-600 dark:text-indigo-400">
              404
            </p> */}
          <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Well… that didn’t work.
          </h1>
          <p className="text-foreground/60 mt-6 text-lg font-medium text-pretty sm:text-xl/8">
            Something unexpected happened, but it’s okay. You can head back
            home.
          </p>
          <div className="mt-10">
            <Link
              href={APP_ROUTES.PUBLIC.HOME}
              className="text-sm/7 font-semibold text-indigo-600 hover:text-indigo-500"
            >
              <span aria-hidden="true">&larr;</span> Back to home
            </Link>
          </div>
        </div>
      </main>
      <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1470847355775-e0e3c35a9a2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
          className="absolute inset-0 size-full object-cover not-dark:hidden"
        />
        <img
          alt=""
          src="https://images.unsplash.com/photo-1583585635793-0e1894c169bd?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
          className="absolute inset-0 size-full object-cover dark:hidden"
        />
      </div>
    </div>
  );
}
