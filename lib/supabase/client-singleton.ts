import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient as createBrowserClient } from './client';

declare global {
  // allow caching on globalThis in dev without TS complaining
  var __supabase_browser_client__: SupabaseClient | undefined;
}

export function getBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient() should be used only on the browser');
  }

  if (!globalThis.__supabase_browser_client__) {
    globalThis.__supabase_browser_client__ = createBrowserClient();
  }

  return globalThis.__supabase_browser_client__;
}
