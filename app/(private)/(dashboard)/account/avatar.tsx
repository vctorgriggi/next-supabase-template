'use client';

import { UserCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

import Button from '@/components/ui/button';
import { compressImage } from '@/lib/images/compress';
import { createClient } from '@/lib/supabase/client';

type AvatarProps = {
  uid: string | null;
  url: string | null; // path in storage
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
  const supabase = createClient();
  const [publicUrl, setPublicUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!url) return setPublicUrl(null);

    const { data } = supabase.storage.from('avatars').getPublicUrl(url);
    setPublicUrl(data.publicUrl);
  }, [url, supabase]);

  async function handleFile(file: File) {
    if (!uid) throw new Error('User ID is required');

    if (!file.type.startsWith('image/'))
      throw new Error('Only image files are allowed');

    const MAX_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_BYTES)
      throw new Error('File size exceeds the 10MB limit');

    const uploadFile = compress ? await compressImage(file) : file;

    // preview
    const preview = URL.createObjectURL(uploadFile);
    setPublicUrl(preview);

    const ext = (uploadFile.name.split('.').pop() || 'jpg').replace(
      /[^a-z0-9]/gi,
      '',
    );
    const filePath = `${uid}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: uploadFile.type,
      });

    if (uploadError) throw uploadError;

    // best-effort delete
    if (url) {
      await supabase.storage
        .from('avatars')
        .remove([url])
        .catch(() => {});
    }

    return filePath;
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      const file = e.target.files?.[0];
      if (!file) return;

      const filePath = await handleFile(file);
      onUpload(filePath);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  async function removeAvatar() {
    if (!url) {
      onUpload(null);
      return;
    }

    try {
      setUploading(true);

      const { error } = await supabase.storage.from('avatars').remove([url]);
      if (error) throw error;

      onUpload(null);
      setPublicUrl(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-x-3">
      <div style={{ width: size, height: size }}>
        {publicUrl ? (
          <img
            src={publicUrl}
            alt="Avatar"
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
          />
        ) : (
          <UserCircleIcon
            aria-hidden="true"
            className="size-12 text-gray-300 dark:text-gray-500"
          />
        )}
      </div>

      <div className="flex items-center gap-x-2">
        <label
          htmlFor="avatar-upload"
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
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
          onClick={removeAvatar}
          disabled={uploading}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
