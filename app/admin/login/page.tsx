'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/admin/events'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push(from)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="font-serif uppercase text-2xl text-white mb-6">Admin login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
        placeholder="Password"
        className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-3 text-white placeholder:text-white/30 focus:border-sunrise focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-sunrise text-black font-bold uppercase tracking-wider px-6 py-3 rounded-md hover:bg-sunrise/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-white/40">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
