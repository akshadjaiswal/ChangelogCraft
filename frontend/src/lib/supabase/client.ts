/**
 * Supabase Client (Browser)
 *
 * This client is used in Client Components and client-side operations.
 * It uses the anonymous key which is safe to expose in the browser.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Export a singleton instance for convenience
export const supabase = createClient();
