'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@supabase/supabase-js';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { toastError, toastSuccess } from '@/lib/ui/toast';
import { accountSchema, AccountValues } from '@/lib/validators/account';

import Avatar from './avatar';

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = React.useState(false);
  const [initialLoaded, setInitialLoaded] = React.useState(false);
  const initialValuesRef = React.useRef<AccountValues | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      full_name: '',
      username: '',
      website: '',
      avatar_url: null,
    },
  });

  const avatarUrl = watch('avatar_url');

  const loadProfile = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, website, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const loadedValues: AccountValues = {
        full_name: data.full_name ?? '',
        username: data.username ?? '',
        website: data.website ?? undefined,
        avatar_url: data.avatar_url ?? null,
      };

      initialValuesRef.current = loadedValues;

      reset(loadedValues);
    } catch (error) {
      toastError((error as Error)?.message || 'Oops! Something went wrong.');
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [reset, supabase, user]);

  React.useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  async function handleAvatarUpload(filePath: string | null) {
    if (!user) return;

    const current = watch();

    try {
      setLoading(true);

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: filePath,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      reset({
        ...current,
        avatar_url: filePath,
      } satisfies AccountValues);

      if (filePath === null) {
        toastSuccess('Your profile picture was removed.');
      } else {
        toastSuccess('Your profile picture was updated.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      reset({
        ...current,
        avatar_url: current.avatar_url,
      } satisfies AccountValues);

      toastError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (initialValuesRef.current) {
      reset(initialValuesRef.current);
    } else {
      reset(); // reset to default values
    }
  }

  async function onSubmit(values: AccountValues) {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: values.full_name,
        username: values.username,
        website: values.website || null,
        avatar_url: values.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      reset({ ...values, username: values.username });

      toastSuccess('Profile updated successfully');
    } catch (error) {
      toastError((error as Error)?.message || 'Oops! Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-4">
              <InputWithLabel
                id="username"
                label="Username"
                placeholder="your-username"
                error={errors.username?.message ?? null}
                {...register('username')}
              />
            </div>

            <div className="sm:col-span-4">
              <InputWithLabel
                id="website"
                label="Website"
                placeholder="https://www.example.com"
                error={errors.website?.message ?? null}
                {...register('website')}
              />
              <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                Your personal website or blog.
              </p>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="photo"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Photo
              </label>

              <Avatar
                uid={user?.id ?? null}
                url={avatarUrl}
                size={48}
                compress
                onUpload={handleAvatarUpload}
                onError={(err) => toastError(err.message)}
              />
            </div>
          </div>
        </div>

        {/* Personal Information section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <InputWithLabel
                id="full_name"
                label="Full name"
                placeholder="Your full name"
                error={errors.full_name?.message ?? null}
                {...register('full_name')}
              />
            </div>

            <div className="sm:col-span-4">
              <InputWithLabel
                id="email"
                label="Email address"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button
          type="button"
          variant="text"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !initialLoaded}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
