'use client';

import { UserCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

import Button from '@/components/ui/button';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';
import { compressImage } from '@/lib/images/compress';
import { getBrowserClient } from '@/lib/supabase/client';
import { getErrorMessage } from '@/lib/utils';

type AvatarProps = {
  uid: string | null;
  url: string | null;
  size?: number;
  onUpload: (filePath: string | null) => void;
  onError?: (err: Error) => void;
  compress?: boolean;
};

export default function Avatar({
  uid,
  url,
  size = 48,
  onUpload,
  onError,
  compress = false,
}: AvatarProps) {
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const supabaseClient = React.useMemo(() => {
    try {
      return getBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const avatarState = useProfileAvatar(previewUrl || url, supabaseClient);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          /* ignore */
        }
      }
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (avatarState.error && onError) {
      onError(new Error(avatarState.error));
    }
  }, [avatarState.error, onError]);

  async function handleFileUpload(file: File) {
    if (!uid) throw new Error('User ID is required');
    if (!file.type.startsWith('image/'))
      throw new Error('Only image files are allowed');
    if (!supabaseClient) throw new Error('Client not initialized');

    const MAX_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_BYTES)
      throw new Error('File size exceeds the 10MB limit');

    const uploadFile = compress ? await compressImage(file) : file;

    const preview = URL.createObjectURL(uploadFile);
    setPreviewUrl(preview);

    const ext = (uploadFile.name.split('.').pop() || 'jpg').replace(
      /[^a-z0-9]/gi,
      '',
    );
    const filePath = `${uid}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: uploadFile.type,
      });

    if (uploadError) {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          /* ignore */
        }
      }
      setPreviewUrl(null);
      throw uploadError;
    }

    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
        /* ignore */
      }
    }
    setPreviewUrl(null);

    // cleanup old avatar (best effort)
    if (url) {
      supabaseClient.storage
        .from('avatars')
        .remove([url])
        .catch((error: unknown) => {
          console.warn('Could not remove old avatar:', getErrorMessage(error));
        });
    }

    return filePath;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) {
        setUploading(false);
        return;
      }

      const filePath = await handleFileUpload(file);
      onUpload(filePath);
    } catch (error) {
      onError?.(new Error(getErrorMessage(error)));
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  async function onRemoveClick() {
    if (!url) {
      onUpload(null);
      return;
    }

    if (!supabaseClient) {
      onError?.(new Error('Client not initialized'));
      return;
    }

    try {
      setUploading(true);

      const { error } = await supabaseClient.storage
        .from('avatars')
        .remove([url]);
      if (error) throw error;

      onUpload(null);
    } catch (error) {
      onError?.(new Error(getErrorMessage(error)));
    } finally {
      setUploading(false);
    }
  }

  /**
   * Renders the avatar based on the current state.
   */
  function renderAvatar() {
    if (avatarState.isLoading) {
      return (
        <div
          className="bg-foreground/10 animate-pulse rounded-full"
          style={{ width: size, height: size }}
        />
      );
    }

    if (avatarState.url) {
      return (
        <img
          src={avatarState.url}
          alt="User avatar"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      );
    }

    return (
      <UserCircleIcon
        aria-hidden="true"
        className="text-foreground/40 size-12"
      />
    );
  }

  return (
    <div className="mt-2 flex items-center gap-x-3">
      <div style={{ width: size, height: size }}>{renderAvatar()}</div>

      <div className="flex items-center gap-x-2">
        <label
          htmlFor="avatar-upload"
          className="bg-background text-foreground inset-ring-foreground/10 hover:bg-foreground/5 rounded-md px-3 py-2 text-sm font-semibold inset-ring"
        >
          Change
          <input
            type="file"
            id="avatar-upload"
            className="sr-only"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>

        <Button
          type="button"
          variant="error"
          onClick={onRemoveClick}
          disabled={uploading || !url}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
