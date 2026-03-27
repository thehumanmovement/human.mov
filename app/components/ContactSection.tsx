'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { track } from '@vercel/analytics'
import { t, type Lang } from '@/lib/i18n'

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'RO', name: 'Romania' },
  { code: 'HU', name: 'Hungary' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'OTHER', name: 'Other' },
]

function countryFlag(code: string): string {
  if (code === 'OTHER') return '🌍'
  return code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

export default function ContactSection({ lang, overrideHeading, hideDesc, emailPlaceholder, messagePlaceholder }: { lang: Lang; overrideHeading?: React.ReactNode; hideDesc?: boolean; emailPlaceholder?: string; messagePlaceholder?: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [country, setCountry] = useState('US')
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryRef = useRef<HTMLDivElement>(null)
  const countrySearchRef = useRef<HTMLInputElement>(null)
  const [zipCode, setZipCode] = useState('')
  const [contactable, setContactable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data?.country_code && COUNTRIES.some(c => c.code === data.country_code)) {
          setCountry(data.country_code)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false)
        setCountrySearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (countryOpen && countrySearchRef.current) countrySearchRef.current.focus()
  }, [countryOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, country, zipCode, contactable }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t(lang, 'somethingWentWrong'))
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
      track('contact_form_submitted')

      // Fire Meta Lead event on successful contact form submission
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead')
      }
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
              className="flex items-center gap-4 transition-all duration-500 ease-out"
              style={{
                maxHeight: message.trim() ? '80px' : '0px',
                opacity: message.trim() ? 1 : 0,
                marginTop: message.trim() ? undefined : '0px',
                overflow: countryOpen ? 'visible' : 'hidden',
              }}
            >
              <div className="flex gap-3 items-stretch flex-1">
                <div ref={countryRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => { setCountryOpen(!countryOpen); setCountrySearch('') }}
                    className="h-full bg-white/[0.07] border border-white/[0.12] hover:border-white/25 rounded-lg px-3 text-2xl transition-all focus:border-sunrise focus:ring-1 focus:ring-sunrise/30 outline-none"
                    title={COUNTRIES.find(c => c.code === country)?.name}
                  >
                    {countryFlag(country)}
                  </button>
                  {countryOpen && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 max-h-60 overflow-y-auto bg-[#1a1a1a] border border-white/20 rounded-lg shadow-xl z-50">
                      <div className="sticky top-0 bg-[#1a1a1a] p-2 border-b border-white/10">
                        <input
                          ref={countrySearchRef}
                          type="text"
                          placeholder="Search..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-white/[0.07] border border-white/[0.12] rounded px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-sunrise"
                        />
                      </div>
                      {COUNTRIES
                        .filter(c => !countrySearch || c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                        .map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setCountry(c.code); setCountryOpen(false); setCountrySearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors ${country === c.code ? 'bg-white/[0.07] text-sunrise' : 'text-white'}`}
                          >
                            <span className="text-lg">{countryFlag(c.code)}</span>
                            <span>{c.name}</span>
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={t(lang, 'placeholderZip')}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  className={`${inputClass} flex-1`}
                />
              </div>

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
