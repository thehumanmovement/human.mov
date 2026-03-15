'use client'

import { useState, FormEvent } from 'react'

type Step = 'form' | 'verify-email' | 'phone' | 'verify-phone' | 'welcome'

export default function Home() {
  const [step, setStep] = useState<Step>('form')
  const [signupId, setSignupId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Create signup record
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, zipCode }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('welcome')
  }

  async function handleEmailVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-email/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: signupId, code }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setCode('')
    setStep('phone')
  }

  async function handlePhoneSend(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-phone/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: signupId, phone }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setCode('')
    setStep('verify-phone')
  }

  async function handlePhoneVerify(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-phone/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: signupId, code }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('welcome')
  }

  const inputClass =
    'w-full bg-transparent border-b border-black/15 focus:border-green-thm py-4 text-lg font-body outline-none transition-colors placeholder:text-black/25'

  const buttonClass =
    'mt-10 w-full bg-black text-cream rounded-full py-4 text-sm font-body font-medium tracking-wide hover:bg-green-thm transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg">

        {/* Header — always visible */}
        <div className="mb-16 text-center">
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1.1] tracking-tight">
            <span className="italic">The Human</span>
            <br />
            <span className="italic text-green-thm">Movement.</span>
          </h1>
          <p className="mt-8 text-black/40 text-base font-body leading-relaxed max-w-sm mx-auto">
            If you&apos;re human, you&apos;re already part of it.
          </p>
        </div>

        {/* Main form — name, email, zip */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="step-enter space-y-6">
            <div>
              <input
                type="text"
                placeholder="Full name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                className={inputClass}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Zip code (optional)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim()}
              className={buttonClass}
            >
              {loading ? 'One moment...' : 'Join the Movement'}
            </button>
          </form>
        )}

        {/* Step: Verify Email */}
        {step === 'verify-email' && (
          <form onSubmit={handleEmailVerify} className="step-enter">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Check your inbox.
            </p>
            <p className="text-black/40 text-sm font-body mb-8">
              We sent a 6-digit code to <span className="text-black/70">{email}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('form') }}
              className="mt-4 w-full text-center text-sm text-black/30 hover:text-black/50 transition-colors font-body"
            >
              Go back
            </button>
          </form>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSend} className="step-enter">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Email verified.
            </p>
            <p className="font-serif italic text-2xl sm:text-3xl mb-8 leading-snug text-green-thm">
              Now, your phone.
            </p>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
            <button type="submit" disabled={loading || !phone.trim()} className={buttonClass}>
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        )}

        {/* Step: Verify Phone */}
        {step === 'verify-phone' && (
          <form onSubmit={handlePhoneVerify} className="step-enter">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Almost there.
            </p>
            <p className="text-black/40 text-sm font-body mb-8">
              We texted a code to <span className="text-black/70">{phone}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? 'Verifying...' : 'Verify phone'}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('phone') }}
              className="mt-4 w-full text-center text-sm text-black/30 hover:text-black/50 transition-colors font-body"
            >
              Use a different number
            </button>
          </form>
        )}

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="step-enter text-center">
            <p className="font-serif italic text-4xl sm:text-5xl leading-[1.15] tracking-tight">
              Welcome to
              <br />
              <span className="text-green-thm">The Human Movement.</span>
            </p>
            <p className="mt-6 text-xl font-serif italic text-black/50">
              You were already a part.
            </p>
            <div className="mt-20">
              <p className="text-sm text-black/25 font-body tracking-widest uppercase">
                More soon
              </p>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center font-body">{error}</p>
        )}
      </div>
    </main>
  )
}
