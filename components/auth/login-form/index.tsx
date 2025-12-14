'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { login } from '@/app/(public)/auth/login/actions/auth';
import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { notifyError } from '@/lib/ui/notifications';
import { loginSchema, LoginValues } from '@/lib/validators/auth';

export default function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginValues> = async (data) => {
    const result = await login(data);
    if (result?.error) {
      notifyError(result.error);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <InputWithLabel
        id="email"
        label="Email address"
        placeholder="you@example.com"
        error={form.formState.errors.email?.message ?? null}
        {...form.register('email')}
      />

      <InputWithLabel
        id="password"
        label="Password"
        type="password"
        placeholder="Your password"
        error={form.formState.errors.password?.message ?? null}
        {...form.register('password')}
      />

      {/* <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="flex h-6 shrink-0 items-center">
            <div className="group grid size-4 grid-cols-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:indeterminate:border-indigo-500 dark:indeterminate:bg-indigo-500 dark:focus-visible:outline-indigo-500 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-checked:opacity-100"
                />
                <path
                  d="M3 7H11"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-indeterminate:opacity-100"
                />
              </svg>
            </div>
          </div>
          <label
            htmlFor="remember-me"
            className="block text-sm/6 text-gray-900 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm/6">
          <a
            href="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Forgot password?
          </a>
        </div>
      </div> */}

      <div>
        <Button type="submit" variant="primary" className="w-full">
          Sign in
        </Button>
      </div>
    </form>
  );
}
