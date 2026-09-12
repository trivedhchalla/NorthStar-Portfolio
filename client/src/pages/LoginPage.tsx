import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSummary, login } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const summary = await fetchSummary()
      navigate(summary.byAssetClass.length > 0 ? '/dashboard' : '/upload')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="hidden flex-1 flex-col justify-center border-r border-slate-800 px-16 lg:flex">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-teal-400">
          Tenant Portal
        </p>
        <h1 className="font-serif text-5xl leading-tight text-slate-50">
          Clarity for
          <br />
          <span className="text-teal-400">every holding.</span>
        </h1>
        <p className="mt-6 max-w-md text-slate-400">
          Northstar Portfolio consolidates your holdings into one place — upload a CSV
          and see market value by asset class and period return in seconds.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl"
        >
          <h2 className="mb-1 font-serif text-2xl text-slate-50">Sign in</h2>
          <p className="mb-6 text-sm text-slate-400">Access your tenant's portfolio.</p>

          {error && (
            <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:outline-none"
            placeholder="tenant_a@example.com"
          />

          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:outline-none"
            placeholder="********"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? 'Signing in...' : 'Log in →'}
          </button>
        </form>
      </div>
    </div>
  )
}
