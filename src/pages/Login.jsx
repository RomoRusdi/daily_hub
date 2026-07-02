import { useState } from 'react'
import { Sparkles, User, Lock, ArrowRight } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { inputClass } from '../components/Field'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../store/AuthContext'

// Username + password sign-in / sign-up (no email).
export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'

  const friendlyError = (message) => {
    if (/invalid login/i.test(message)) return 'Username atau password salah.'
    if (/already registered/i.test(message)) return 'Username sudah dipakai. Coba masuk.'
    if (/at least 6/i.test(message)) return 'Password minimal 6 karakter.'
    if (/confirm/i.test(message)) return 'Aktifkan dulu: matikan "Confirm email" di Supabase.'
    return message
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setBusy(true)
    setError('')
    const fn = isSignup ? signUp : signIn
    const { error: err } = await fn(username, password)
    setBusy(false)
    if (err) setError(friendlyError(err.message))
    // On success, the auth listener swaps this screen for the app.
  }

  return (
    <div className="pt-safe pb-safe px-safe flex min-h-dvh flex-col items-center justify-center">
      <div className="pt-safe pr-safe absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm px-6">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-brand shadow-brand mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Sparkles size={24} strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Hub</h1>
          <p className="mt-1 text-sm text-subtle">
            {isSignup ? 'Buat akun untuk mulai.' : 'Masuk ke command center kamu.'}
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                autoFocus
                autoCapitalize="none"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inputClass} pl-9`}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={busy || !username.trim() || !password}
            >
              {busy ? 'Memproses…' : isSignup ? 'Daftar' : 'Masuk'}
              {!busy && <ArrowRight size={16} />}
            </Button>

            {error && <p className="text-center text-xs text-accent">{error}</p>}
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-subtle">
          {isSignup ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'signin' : 'signup')
              setError('')
            }}
            className="text-brand font-medium"
          >
            {isSignup ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  )
}
