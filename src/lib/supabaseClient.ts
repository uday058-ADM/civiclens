import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate whether real credentials are provided
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

if (!isSupabaseConfigured) {
  if (typeof window !== 'undefined') {
    console.info(
      'ℹ️ Supabase environment variables unconfigured or placeholder. CivicLens is operating with its local resilient PostGIS & In-Memory engine.'
    );
  }
}

// Singleton client instance (safe fallback placeholder URL to prevent SDK initialization errors)
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-civiclens.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
