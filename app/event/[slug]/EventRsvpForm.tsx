'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { captureAttribution, getStoredAttribution } from '@/lib/attribution'

export default function EventRsvpForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    captureAttribution()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const attribution = getStoredAttribution()
    const res = await fetch(`/api/event/${slug}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), ...attribution }),
    })

    if (res.ok) {
      setDone(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-6 py-5">
        <p className="font-serif uppercase text-xl text-white mb-2">You're in.</p>
        <p className="font-body text-sm text-white/70">
          We'll send you a reminder closer to the event. Check your inbox for confirmation details.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-serif uppercase text-2xl sm:text-3xl text-white">RSVP</p>
      <p className="font-body text-sm text-white/60 mb-2">
        Drop your email and we'll send you a reminder before the event.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 bg-white/[0.05] border border-white/20 rounded-md px-4 py-3 text-white placeholder:text-white/30 focus:border-sunrise focus:outline-none font-body"
          disabled={loading || done}
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="bg-sunrise text-black font-body font-bold uppercase tracking-wider px-6 py-3 rounded-md hover:bg-sunrise/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'RSVPing…' : 'RSVP'}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}
