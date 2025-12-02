// Supabase Client Configuration

import { createClient } from '@supabase/supabase-js';

// For Expo, environment variables are accessed via process.env
// Make sure .env file exists in the HomeBase directory
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Backend features will not work.');
}

console.log('Supabase URL:', supabaseUrl); // Debug log

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Kiosk mode - no persistent sessions
    autoRefreshToken: false,
  },
});

export default supabase;
