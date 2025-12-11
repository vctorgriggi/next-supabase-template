'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { getBrowserClient } from '@/lib/supabase/client-singleton';
import { fetchProfileWithClient } from '@/lib/supabase/profile';
import { notifyError, notifySuccess } from '@/lib/ui/notifications';
import { accountSchema, AccountValues } from '@/lib/validators/account';

import Avatar from './avatar';

export default function AccountForm({
  user,
  initialProfile = null,
}: {
  user: User | null;
  initialProfile?: AccountValues | null;
}) {
  const queryClient = useQueryClient();

  const [supabaseClient, setSupabaseClient] =
    React.useState<SupabaseClient | null>(null);
  React.useEffect(() => {
    try {
      const client = getBrowserClient();
      setSupabaseClient(client);
    } catch {
      setSupabaseClient(null);
    }
  }, []);

  const [loading, setLoading] = React.useState(false);
  const [initialLoaded, setInitialLoaded] = React.useState(false);
  const initialValuesRef = React.useRef<AccountValues | null>(null);

  const {
    register,
    watch,
    getValues,
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

  React.useEffect(() => {
    let mounted = true;
    async function init() {
      if (!user) {
        setInitialLoaded(true);
        return;
      }

      // se ainda não temos client do browser, esperamos
      if (!supabaseClient) {
        // apenas não faz a fetch agora; o efeito vai re-executar quando supabaseClient mudar
        return;
      }

      // if server provided it, use it
      if (initialProfile) {
        const loadedValues: AccountValues = {
          full_name: initialProfile.full_name ?? '',
          username: initialProfile.username ?? '',
          website: initialProfile.website ?? undefined,
          avatar_url: initialProfile.avatar_url ?? null,
        };
        initialValuesRef.current = loadedValues;
        reset(loadedValues);
        setInitialLoaded(true);
        return;
      }

      // fallback: client fetch (only if no initialProfile)
      try {
        setLoading(true);
        const profile = await fetchProfileWithClient(supabaseClient, user.id);
        if (!mounted) return;

        const loadedValues: AccountValues = {
          full_name: profile?.full_name ?? '',
          username: profile?.username ?? '',
          website: profile?.website ?? undefined,
          avatar_url: profile?.avatar_url ?? null,
        };
        initialValuesRef.current = loadedValues;
        reset(loadedValues);
      } catch (err) {
        notifyError((err as Error)?.message ?? 'Oops! Something went wrong.');
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoaded(true);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
    // re-executa quando supabaseClient estiver pronto
  }, [initialProfile, reset, supabaseClient, user]);

  async function handleAvatarUpload(filePath: string | null) {
    if (!user) return;
    if (!supabaseClient) {
      notifyError(
        'Client não inicializado ainda. Tente novamente em alguns instantes.',
      );
      return;
    }

    const current = getValues();

    try {
      setLoading(true);

      const { error } = await supabaseClient.from('profiles').upsert({
        id: user.id,
        avatar_url: filePath,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      const newValues = {
        ...current,
        avatar_url: filePath,
      } satisfies AccountValues;

      // update form and initial values so "Cancel" restores the new avatar
      reset(newValues);
      initialValuesRef.current = newValues;

      // simple invalidation as you requested
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      }

      if (filePath === null) {
        notifySuccess('Your profile picture was removed.');
      } else {
        notifySuccess('Your profile picture was updated.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // restore form to previous values
      reset({
        ...current,
        avatar_url: current.avatar_url,
      } satisfies AccountValues);

      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: AccountValues) {
    if (!user) return;
    if (!supabaseClient) {
      notifyError(
        'Client não inicializado ainda. Tente novamente em alguns instantes.',
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabaseClient.from('profiles').upsert({
        id: user?.id as string,
        full_name: values.full_name,
        username: values.username,
        website: values.website || null,
        avatar_url: values.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      const newValues = {
        ...values,
        username: values.username,
      } satisfies AccountValues;

      reset(newValues);
      initialValuesRef.current = newValues;

      // simple invalidation as requested
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      }

      notifySuccess('Profile updated successfully');
    } catch (error) {
      notifyError((error as Error)?.message || 'Oops! Something went wrong.');
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
                onError={(err) => notifyError(err.message)}
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
        <button
          type="button"
          className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>
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
