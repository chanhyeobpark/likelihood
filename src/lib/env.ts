function getEnv(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (!value && required) {
    console.error(`⚠️ Missing environment variable: ${key}`);
    return '';
  }
  return value || '';
}

// These are validated and used across the app
export const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY', false);
export const TOSS_SECRET_KEY = getEnv('TOSS_SECRET_KEY', false);
export const STRIPE_SECRET_KEY = getEnv('STRIPE_SECRET_KEY', false);
export const SITE_URL = getEnv('NEXT_PUBLIC_SITE_URL', false) || 'http://localhost:3000';
