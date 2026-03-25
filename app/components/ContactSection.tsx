'use client'

import { useState, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'

export default function ContactSection({ lang }: { lang: Lang }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
    } catch {
      setError('Failed to send. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#111] px-6 py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif uppercase text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
            {t(lang, 'contactTitle1')}
            <br />
            <span className="text-sunrise">{t(lang, 'contactTitle2')}</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-white/60 max-w-lg mx-auto">
            {t(lang, 'contactDesc')}
          </p>
        </div>

        {sent ? (
          <div className="text-center py-12">
            <p className="font-serif uppercase text-2xl sm:text-3xl text-sunrise mb-2">
              {t(lang, 'contactSent')}
            </p>
            <p className="font-body text-white/50">
              {t(lang, 'contactSentDesc')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder={t(lang, 'contactEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.07] border border-white/[0.12] focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-sunrise/30"
            />
            <textarea
              placeholder={t(lang, 'contactMessagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full bg-white/[0.07] border border-white/[0.12] focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-sunrise/30 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-sunrise text-black rounded-full py-4 text-base font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? t(lang, 'contactSending') : t(lang, 'contactButton')}
            </button>
            {error && (
              <p className="text-sm text-red-400 text-center font-body">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
