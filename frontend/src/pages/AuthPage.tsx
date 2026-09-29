import { CalendarDays, CheckCircle2, Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Field, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, register, continueAsGuest } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err: any) {
      const errors = err?.response?.data?.errors
      setError(errors ? (Object.values(errors)[0] as string) : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const guest = async () => {
    setError(null)
    setBusy(true)
    try {
      await continueAsGuest()
    } catch {
      setError('Could not start a guest session.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eef0f8] via-white to-brand-50 p-6 dark:from-[#0c0d16] dark:via-[#0c0d16] dark:to-[#1a1330]">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl md:grid-cols-2 dark:border-white/10 dark:bg-[#151627]">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Zap size={18} />
              </div>
              Taskly
            </div>
            <h2 className="mt-16 text-3xl font-bold leading-tight">What are your plans for today?</h2>
            <p className="mt-3 text-sm text-white/70">
              Organize your tasks, assignments and events — all in one calm place.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Tasks, boards &amp; calendar in sync
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Works instantly in guest mode
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} /> No account needed to try
            </li>
          </ul>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-6 flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/5">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${mode === 'signin' ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white' : 'text-slate-500'}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${mode === 'signup' ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white' : 'text-slate-500'}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <Field label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="James Doe" required />
              </Field>
            )}
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            {mode === 'signup' && (
              <Field label="Confirm password">
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>
            )}

            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-xs text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <Button onClick={guest} variant="secondary" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            Continue as guest
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
            Guest mode opens a private demo workspace with sample data — no account required.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <CalendarDays size={13} /> Plan your day with Taskly
          </div>
        </div>
      </div>
    </div>
  )
}
