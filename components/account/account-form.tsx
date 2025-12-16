'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import InputWithLabel from '@/components/ui/input';
import { useProfile } from '@/hooks/use-profile';
import { confirmAvatar } from '@/lib/actions/avatar';
import { updateProfile } from '@/lib/actions/profile';
import { profileKeys } from '@/lib/query-keys/profile';
import { notifyError, notifySuccess } from '@/lib/ui/notifications';
import { getErrorMessage } from '@/lib/utils';
import { accountSchema, AccountValues } from '@/lib/validators/account';

import Avatar from './avatar';

export default function AccountForm({ user }: { user: User | null }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);

  const confirmMutation = useMutation({
    mutationFn: async (payload: {
      filePath: string | null;
      previousPath?: string | null;
    }) => {
      const result = await confirmAvatar(
        payload.filePath,
        payload.previousPath,
      );
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: AccountValues) => {
      const result = await updateProfile({
        full_name: values.full_name,
        username: values.username,
        website: values.website,
        avatar_url: values.avatar_url,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

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
      website: null,
      avatar_url: null,
    },
  });

  const avatarUrl = watch('avatar_url');
  const initialValuesRef = React.useRef<AccountValues>({
    full_name: '',
    username: '',
    website: null,
    avatar_url: null,
  });

  React.useEffect(() => {
    if (profile) {
      const values: AccountValues = {
        full_name: profile.full_name || '',
        username: profile.username || '',
        website: profile.website || null,
        avatar_url: profile.avatar_url || null,
      };
      reset(values);
      initialValuesRef.current = values;
    }
  }, [profile, reset]);

  async function handleAvatarUpload(filePath: string | null) {
    if (!user) return;

    const current = getValues();
    const previousPath = initialValuesRef.current?.avatar_url ?? null;

    try {
      setLoading(true);
      await confirmMutation.mutateAsync({ filePath, previousPath });

      const newValues = {
        ...current,
        avatar_url: filePath,
      } satisfies AccountValues;

      reset(newValues);
      initialValuesRef.current = newValues;

      if (user.id) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.detail(user.id),
        });
      }
      notifySuccess(
        filePath === null
          ? 'Your profile picture was removed.'
          : 'Your profile picture was updated.',
      );
    } catch (error) {
      reset({
        ...current,
        avatar_url: current.avatar_url,
      } satisfies AccountValues);
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: AccountValues) {
    if (!user) return;

    try {
      setLoading(true);

      const updates = {
        ...values,
        website: values.website || null,
      };
      await updateMutation.mutateAsync(updates);

      reset(values);
      initialValuesRef.current = values;

      if (user.id) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.detail(user.id),
        });
      }
      notifySuccess('Profile updated successfully');
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    reset(initialValuesRef.current);
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-foreground/60 text-sm">Wait a moment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        <div className="border-foreground/10 grid grid-cols-1 gap-x-8 gap-y-10 border-b pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-foreground text-base/7 font-semibold">
              Profile
            </h2>
            <p className="text-foreground/60 mt-1 text-sm/6">
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
              <p className="text-foreground/60 mt-3 text-sm/6">
                Your personal website or blog.
              </p>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="photo"
                className="text-foreground block text-sm/6 font-medium"
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

        <div className="border-foreground/10 grid grid-cols-1 gap-x-8 gap-y-10 border-b pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-foreground text-base/7 font-semibold">
              Personal Information
            </h2>
            <p className="text-foreground/60 mt-1 text-sm/6">
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
          className="text-foreground hover:text-foreground/70 text-sm/6 font-semibold"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <Button type="submit" variant="primary" disabled={loading}>
          Save
        </Button>
      </div>
    </form>
  );
}
