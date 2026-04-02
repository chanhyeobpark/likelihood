import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase environment variables');
}

export function createClient() {
  return createBrowserClient<Database>(
    url!,
    key!
  )
}
