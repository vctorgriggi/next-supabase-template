'use client';

import { UserCircleIcon } from '@heroicons/react/24/solid';
import type { SupabaseClient } from '@supabase/supabase-js';
import React from 'react';

import Button from '@/components/ui/button';
import { compressImage } from '@/lib/images/compress';
import { getBrowserClient } from '@/lib/supabase/client-singleton';

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

  const [publicUrl, setPublicUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const previewRef = React.useRef<string | null>(null);

  // load public url for existing path; wait supabaseClient if needed
  React.useEffect(() => {
    let mounted = true;

    async function resolve() {
      if (!url) {
        if (mounted) setPublicUrl(null);
        return;
      }

      // if already a full URL (http/https/blob), use it directly
      if (/^(https?:\/\/|blob:)/i.test(url)) {
        if (mounted) setPublicUrl(url);
        return;
      }

      if (!supabaseClient) {
        if (mounted) setPublicUrl(null);
        return;
      }

      try {
        const { data } = supabaseClient.storage
          .from('avatars')
          .getPublicUrl(url);
        if (mounted) {
          if (previewRef.current) {
            try {
              URL.revokeObjectURL(previewRef.current);
            } catch {
              /* ignore */
            }
            previewRef.current = null;
          }
          setPublicUrl(data.publicUrl);
        }
      } catch {
        if (mounted) setPublicUrl(null);
      }
    }

    resolve();

    return () => {
      mounted = false;
    };
  }, [url, supabaseClient]);

  // cleanup on unmount: revoke any blob preview still held
  React.useEffect(() => {
    return () => {
      if (previewRef.current) {
        try {
          URL.revokeObjectURL(previewRef.current);
        } catch {
          /* ignore */
        }
        previewRef.current = null;
      }
    };
  }, []);

  async function handleFile(file: File) {
    if (!uid) throw new Error('User ID is required');
    if (!file.type.startsWith('image/'))
      throw new Error('Only image files are allowed');

    if (!supabaseClient) throw new Error('Client não inicializado ainda');

    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES)
      throw new Error('File size exceeds the 10MB limit');

    const uploadFile = compress ? await compressImage(file) : file;

    // Revoke previous blob preview if any
    if (previewRef.current) {
      try {
        URL.revokeObjectURL(previewRef.current);
      } catch {
        /* ignore */
      }
      previewRef.current = null;
    }

    // Create new blob preview and show it
    const preview = URL.createObjectURL(uploadFile);
    previewRef.current = preview;
    setPublicUrl(preview);

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
      // revoke the blob preview because upload failed and we won't keep it
      if (previewRef.current) {
        try {
          URL.revokeObjectURL(previewRef.current);
        } catch {
          /* ignore */
        }
        previewRef.current = null;
      }
      // restore previous permanent publicUrl if exists (based on `url`)
      if (url) {
        try {
          const { data } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(url);
          setPublicUrl(data.publicUrl);
        } catch {
          setPublicUrl(null);
        }
      } else {
        setPublicUrl(null);
      }

      throw uploadError;
    }

    // On success: switch preview to permanent public URL
    const { data: publicData } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath);
    // revoke blob preview ref (we no longer need it)
    if (previewRef.current) {
      try {
        URL.revokeObjectURL(previewRef.current);
      } catch {
        /* ignore */
      }
      previewRef.current = null;
    }
    setPublicUrl(publicData.publicUrl);

    // best-effort delete previous avatar; log on failure but don't throw
    if (url) {
      supabaseClient.storage
        .from('avatars')
        .remove([url])
        .catch((err: unknown) => {
          console.warn('failed to remove old avatar:', err);
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

    if (!supabaseClient) {
      onError?.(new Error('Client não inicializado ainda'));
      return;
    }

    try {
      setUploading(true);

      const { error } = await supabaseClient.storage
        .from('avatars')
        .remove([url]);
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
