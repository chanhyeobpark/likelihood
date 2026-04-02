import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase environment variables');
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    url!,
    key!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
