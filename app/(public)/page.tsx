import Link from 'next/link';

import { APP_ROUTES } from '@/constants/app-routes';

export default function Home() {
  return (
    <div className="bg-background">
      <div className="relative isolate overflow-hidden bg-linear-to-b from-indigo-100/20 dark:from-indigo-950/10">
        <div className="mx-auto max-w-7xl pt-10 pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <img
                  alt="Your Company"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-11 dark:hidden"
                />
                <img
                  alt="Your Company"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-11 not-dark:hidden"
                />
                <h1 className="text-foreground mt-10 text-3xl font-semibold tracking-tight text-pretty sm:text-5xl">
                  {"The Next.js + Supabase template you've been looking for"}
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
                  Type-safe, production-ready, and built with modern best
                  practices. <br />
                  Authentication, database, storage, and forms—all set up and
                  ready to go.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href={APP_ROUTES.PRIVATE.DASHBOARD}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                  >
                    Go to dashboard
                  </Link>
                  <a
                    href="#"
                    className="text-foreground text-sm/6 font-semibold"
                  >
                    View on GitHub <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl ring-1 shadow-indigo-600/10 ring-indigo-50 md:-mr-20 lg:-mr-36 dark:bg-gray-800/30 dark:shadow-indigo-400/10 dark:ring-white/5"
            />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_var(--radius-3xl))]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 inset-ring inset-ring-white md:ml-20 lg:ml-36"
                />
                <div className="relative px-6 pt-8 sm:pt-16 md:pr-0 md:pl-16">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="w-screen overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                          <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                            Example.jsx
                          </div>
                          {/* <div className="border-r border-gray-600/10 px-4 py-2">
                            App.jsx
                          </div> */}
                        </div>
                      </div>
                      <div className="px-6 pt-6 pb-14">
                        {/* Your code example */}
                        <pre className="text-md max-h-96 overflow-auto text-gray-200">
                          <code>
                            {`import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function Example() {
  const [user, setUser] = useState(null)

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  return <button onClick={loadUser}>Load user</button>
}`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset md:rounded-3xl dark:ring-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-white sm:h-32 dark:from-gray-900" />
      </div>
    </div>
  );
}
