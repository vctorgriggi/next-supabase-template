'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { resend } from '@/app/(public)/auth/confirm-email/actions/resend';
import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { notifyError, notifySuccess } from '@/lib/ui/notifications';
import { resendSchema, ResendValues } from '@/lib/validators/resend';

export default function ResendForm() {
  const form = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<ResendValues> = async (data) => {
    const result = await resend(data);
    if (!result.success) {
      notifyError(result.error);
    }
    notifySuccess('Confirmation email sent. Please check your inbox.');
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <div className="block w-full">
        <InputWithLabel
          id="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          error={form.formState.errors.email?.message ?? null}
          {...form.register('email')}
        />
      </div>
      <Button type="submit" variant="primary" className="w-full">
        Send confirmation
      </Button>
    </form>
  );
}
