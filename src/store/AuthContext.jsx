import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Username + password auth (no real email).
 *
 * Supabase Auth needs an email, so we map a username to an internal fake
 * address `username@hub.local`. With "Confirm email" disabled in the Supabase
 * dashboard, no email is ever sent and sign-up logs the user straight in.
 *
 * - Local mode (no Supabase env): `configured` is false, no session, app runs
 *   on localStorage.
 * - Cloud mode: per-user data, works across devices with the same login.
 */
const AuthContext = createContext(null)

const EMAIL_DOMAIN = 'hub.local'

// Normalise a username into a safe, unique fake email.
const usernameToEmail = (username) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')}@${EMAIL_DOMAIN}`

// Display name from the stored email (strip the fake domain).
export const usernameFromEmail = (email = '') => email.replace(`@${EMAIL_DOMAIN}`, '')

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (username, password) => {
    if (!isSupabaseConfigured) return { error: new Error('Supabase belum dikonfigurasi') }
    return supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
  }

  const signUp = async (username, password) => {
    if (!isSupabaseConfigured) return { error: new Error('Supabase belum dikonfigurasi') }
    const email = usernameToEmail(username)
    const res = await supabase.auth.signUp({ email, password })
    // If "Confirm email" is still enabled, signUp returns no session. Try an
    // immediate sign-in so the user isn't stuck (works once confirm is off).
    if (!res.error && !res.data.session) {
      return supabase.auth.signInWithPassword({ email, password })
    }
    return res
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
  }

  const value = {
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    username: usernameFromEmail(session?.user?.email ?? ''),
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
