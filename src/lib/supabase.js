import { createClient } from '@supabase/supabase-js'

// Credentials come from .env (see .env.example). If they're absent, the app
// runs in "local mode" — everything stays in localStorage and no network
// calls are made — so Hub still works before Supabase is wired up.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // completes the magic-link redirect
      },
    })
  : null
