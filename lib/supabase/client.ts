import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
  var __supabase_browser_client__: SupabaseClient | undefined;
}

export function getBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient() can only be called in the browser');
  }

  // reuse the client if it has already been created
  if (!globalThis.__supabase_browser_client__) {
    globalThis.__supabase_browser_client__ = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }

  return globalThis.__supabase_browser_client__;
}
