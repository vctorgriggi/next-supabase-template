'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { login } from '@/app/(public)/auth/login/actions/auth';
import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { toastError } from '@/lib/ui/toast';
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
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);
    if (result?.error) {
      toastError(result.error);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
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

      <Button type="submit" variant="primary" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
