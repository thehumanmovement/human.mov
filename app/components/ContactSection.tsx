'use client'

import { useState, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'

export default function ContactSection({ lang, overrideHeading, hideDesc, emailPlaceholder, messagePlaceholder }: { lang: Lang; overrideHeading?: React.ReactNode; hideDesc?: boolean; emailPlaceholder?: string; messagePlaceholder?: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [contactable, setContactable] = useState(true)
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
        body: JSON.stringify({ name, email, message, zipCode, contactable }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t(lang, 'somethingWentWrong'))
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
    } catch {
      setError(t(lang, 'failedToSend'))
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/[0.07] border border-white/[0.12] focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-sunrise/30"

  return (
    <section className="bg-[#111] px-6 py-24 sm:py-32 border-t border-white/[0.06]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          {overrideHeading ? (
            <div className="mb-4">{overrideHeading}</div>
          ) : (
            <h2 className="font-serif uppercase text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
              {t(lang, 'contactTitle1')}
              <br />
              <span className="text-sunrise">{t(lang, 'contactTitle2')}</span>
            </h2>
          )}
          {!hideDesc && (
            <p className="font-body text-base sm:text-lg text-white/60 max-w-lg mx-auto">
              {t(lang, 'contactDesc')}
            </p>
          )}
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
            <div className="flex gap-4">
              <input
                type="email"
                placeholder={emailPlaceholder || t(lang, 'myEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} flex-1`}
              />
              <input
                type="text"
                placeholder={t(lang, 'myName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`${inputClass} flex-1`}
              />
            </div>
            <textarea
              placeholder={messagePlaceholder || t(lang, 'contactMessagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />

            <div
              className="flex items-center gap-4 overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: message.trim() ? '80px' : '0px',
                opacity: message.trim() ? 1 : 0,
                marginTop: message.trim() ? undefined : '0px',
              }}
            >
              <input
                type="text"
                placeholder={t(lang, 'placeholderZip')}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className={`${inputClass} flex-1`}
              />

              {/* Contactable checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group py-1 shrink-0">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={contactable}
                    onChange={(e) => setContactable(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border border-white/30 bg-white/[0.07] peer-checked:bg-sunrise peer-checked:border-sunrise transition-all flex items-center justify-center">
                    {contactable && (
                      <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-body text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
                  {t(lang, 'canWeContact')}
                </span>
              </label>
            </div>

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
