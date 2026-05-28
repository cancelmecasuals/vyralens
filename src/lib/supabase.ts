import { createClient } from '@supabase/supabase-js';

// Use placeholder URLs during build time - real values come from Vercel env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://build-placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'build-placeholder-key';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'build-placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = () => createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
