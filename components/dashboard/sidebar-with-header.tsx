'use client';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import {
  Bars3Icon,
  Cog6ToothIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { logout } from '@/app/(public)/auth/login/actions/auth';
import { APP_ROUTES } from '@/constants/app-routes';
import { useProfile } from '@/hooks/use-profile';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: APP_ROUTES.PRIVATE.DASHBOARD,
    icon: HomeIcon,
  },
];
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H' },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T' },
  { id: 3, name: 'Workcation', href: '#', initial: 'W' },
];
const userNavigation = [
  { name: 'Your account', href: APP_ROUTES.PRIVATE.ACCOUNT },
  { name: 'Sign out', action: 'signout' as const },
];

export default function SidebarWithHeader({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { id: string; email?: string } | null;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  const { profile, supabaseClient } = useProfile(user?.id);
  const avatarState = useProfileAvatar(profile?.avatar_url, supabaseClient);

  const displayName = profile?.full_name || user?.email || 'User';

  return (
    <React.Fragment>
      {/* mobile sidebar */}
      <div>
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>

              {/* mobile Sidebar content */}
              <div className="bg-background relative flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 ring-1 ring-white/10 before:pointer-events-none before:absolute before:inset-0 before:bg-black/10">
                <div className="relative flex h-16 shrink-0 items-center">
                  <img
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="h-8 w-auto"
                  />
                </div>
                <nav className="relative flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isCurrent = pathname === item.href;
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={cn(
                                  isCurrent
                                    ? 'bg-white/5 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className="size-6 shrink-0"
                                />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">
                        Your teams
                      </div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {teams.map((team) => {
                          const isCurrent = pathname === team.href;
                          return (
                            <li key={team.name}>
                              <a
                                href={team.href}
                                className={cn(
                                  isCurrent
                                    ? 'bg-white/5 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                )}
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[0.625rem] font-medium text-gray-400 group-hover:border-white/20 group-hover:text-white">
                                  {team.initial}
                                </span>
                                <span className="truncate">{team.name}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="size-6 shrink-0"
                        />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* desktop sidebar */}
        <div className="hidden bg-gray-900 ring-1 ring-white/10 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                alt="Your Company"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isCurrent = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              isCurrent
                                ? 'bg-white/5 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="size-6 shrink-0"
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">
                    Your teams
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => {
                      const isCurrent = pathname === team.href;
                      return (
                        <li key={team.name}>
                          <a
                            href={team.href}
                            className={cn(
                              isCurrent
                                ? 'bg-white/5 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            )}
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[0.625rem] font-medium text-gray-400 group-hover:border-white/20 group-hover:text-white">
                              {team.initial}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className="size-6 shrink-0"
                    />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* main content area */}
        <div className="lg:pl-72">
          <div className="bg-background border-foreground/10 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-foreground/60 hover:text-foreground -m-2.5 p-2.5 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* separator */}
            <div
              aria-hidden="true"
              className="bg-foreground/10 h-6 w-px lg:hidden"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                <input
                  disabled // disable search for now
                  name="search"
                  placeholder="Search"
                  aria-label="Search"
                  className="bg-background text-foreground placeholder:text-foreground/40 col-start-1 row-start-1 block size-full pl-8 text-base outline-hidden sm:text-sm/6"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="text-foreground/40 pointer-events-none col-start-1 row-start-1 size-5 self-center"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button> */}

                {/* separator */}
                {/* <div
                  aria-hidden="true"
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10 dark:lg:bg-gray-100/10"
                /> */}

                {/* profile dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="relative flex items-center">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    {avatarState.url ? (
                      <img
                        src={avatarState.url}
                        alt="User avatar"
                        className="bg-background outline-foreground/10 size-8 rounded-full outline -outline-offset-1"
                      />
                    ) : (
                      <UserCircleIcon
                        aria-hidden="true"
                        className="text-foreground/40 size-8"
                      />
                    )}
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        aria-hidden="true"
                        className="text-foreground ml-4 text-sm/6 font-semibold"
                      >
                        {displayName}
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="text-foreground/50 ml-2 size-5"
                      />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="bg-background outline-foreground/10 absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md py-2 shadow-lg outline transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="text-foreground data-focus:bg-foreground/5 block px-3 py-1 text-sm/6 data-focus:outline-hidden"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <form action={logout}>
                            <button
                              type="submit"
                              className="text-foreground hover:bg-foreground/5 block w-full cursor-pointer px-3 py-1 text-start text-sm/6 hover:outline-hidden"
                            >
                              {item.name}
                            </button>
                          </form>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </React.Fragment>
  );
}
