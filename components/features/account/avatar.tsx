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
  onChange: (filePath: string | null) => void;
  onError?: (err: Error) => void;
  compress?: boolean;
};

export default function Avatar({
  uid,
  url,
  size = 48,
  onChange,
  onError,
  compress = false,
}: AvatarProps) {
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const avatar = useProfileAvatar(previewUrl || url);

  /**
   * Uploads the image file to storage and returns a file path.
   * The uploaded file is considered temporary until the parent
   * component commits the profile changes.
   */
  async function upload(file: File) {
    if (!uid) throw new Error('Missing user ID');

    const client = getBrowserClient();

    const uploadFile = compress ? await compressImage(file) : file;
    const preview = URL.createObjectURL(uploadFile);
    setPreviewUrl(preview);

    const ext = uploadFile.name.split('.').pop() || 'jpg';
    const filePath = `${uid}/${crypto.randomUUID()}.${ext}`;

    const { error } = await client.storage
      .from('avatars')
      .upload(filePath, uploadFile, {
        upsert: false,
        contentType: uploadFile.type,
      });

    if (error) throw error;

    setPreviewUrl(null);
    // propagates the new avatar path to the parent form.
    // this does NOT update the profile by itself.
    onChange(filePath);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      await upload(file);
    } catch (error) {
      onError?.(new Error(getErrorMessage(error)));
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  // removes the avatar from the draft form state.
  // actual cleanup happens on save, on the server.
  function onRemove() {
    onChange(null);
  }

  return (
    <div className="mt-2 flex items-center gap-x-3">
      <div style={{ width: size, height: size }}>
        {avatar.isLoading ? (
          <div className="bg-foreground/10 animate-pulse rounded-full" />
        ) : avatar.url ? (
          <img
            src={avatar.url}
            alt="User avatar"
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
          />
        ) : (
          <UserCircleIcon className="text-foreground/40 size-12" />
        )}
      </div>

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
        onClick={onRemove}
        disabled={!url || uploading}
      >
        Remove
      </Button>
    </div>
  );
}
