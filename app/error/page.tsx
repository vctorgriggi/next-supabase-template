import Link from 'next/link';
import React from 'react';

import { APP_ROUTES } from '@/constants/app-routes';

export default function Error() {
  return (
    <React.Fragment>
      <div className="bg-background grid min-h-full grid-cols-1 grid-rows-[1fr_auto_1fr] lg:grid-cols-[max(50%,36rem)_1fr]">
        <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
          <a href="#">
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
          </a>
        </header>
        <main className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
          <div className="max-w-lg">
            {/* <p className="text-base/8 font-semibold text-indigo-600 dark:text-indigo-400">
              404
            </p> */}
            <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
              Well… that didn’t work.
            </h1>
            <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
              Something unexpected happened, but it’s okay. You can head back
              home.
            </p>
            <div className="mt-10">
              <Link
                href={APP_ROUTES.PUBLIC.HOME}
                className="text-sm/7 font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <span aria-hidden="true">&larr;</span> Back to home
              </Link>
            </div>
          </div>
        </main>
        <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1589652717521-10c0d092dea9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="absolute inset-0 size-full object-cover not-dark:hidden"
          />
          <img
            alt=""
            src="https://images.unsplash.com/photo-1589652717521-10c0d092dea9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="absolute inset-0 size-full object-cover dark:hidden"
          />
        </div>
      </div>
    </React.Fragment>
  );
}
