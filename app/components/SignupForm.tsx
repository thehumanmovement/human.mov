'use client'

import { useState, useRef, forwardRef, useImperativeHandle, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'
import SenatorLookup from './SenatorLookup'

type Step = 'email' | 'details' | 'verify-email' | 'phone' | 'verify-phone' | 'welcome'

function headingClass(lang: Lang): string {
  const base = 'font-serif leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]'
  switch (lang) {
    case 'zh':
      return `${base} text-6xl sm:text-8xl`
    case 'ko':
      return `${base} text-5xl sm:text-7xl`
    case 'ja':
    case 'hi':
      return `${base} text-4xl sm:text-6xl`
    case 'ar':
    case 'es':
    case 'fr':
      return `${base} text-5xl sm:text-7xl`
    default:
      return `${base} text-6xl sm:text-8xl`
  }
}

const INPUT_CLASS =
  'w-full bg-white/[0.07] border border-white/[0.12] focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-sunrise/30'

const BUTTON_CLASS =
  'mt-6 w-full bg-sunrise text-black rounded-full py-4 text-base font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]'

export interface SignupFormHandle {
  scrollToForm: () => void
}

type Variant = 'default' | 'after-globe' | 'after-protect'

const VARIANT_COPY: Record<Variant, { line1: string; line2: string; button: string }> = {
  'default': {
    line1: 'Make your voice heard',
    line2: 'while it still counts.',
    button: 'Join Now',
  },
  'after-globe': {
    line1: 'Be part of',
    line2: 'the global fight.',
    button: 'Add Your Voice',
  },
  'after-protect': {
    line1: "It starts with",
    line2: 'people like you.',
    button: 'Take Action Now',
  },
}

interface SignupFormProps {
  lang: Lang
  variant?: Variant
}

const SignupForm = forwardRef<SignupFormHandle, SignupFormProps>(function SignupForm({ lang, variant = 'default' }, ref) {
  const [step, setStep] = useState<Step>('email')
  const [signupId, setSignupId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formSectionRef = useRef<HTMLElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    scrollToForm() {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => emailInputRef.current?.focus(), 600)
    },
  }))

  function handleEmailNext(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStep('details')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, zipCode, lang }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.detail ? `${data.error}: ${data.detail}` : data.error)
      setLoading(false)
      return
    }

    setSignupId(data.id)
    setLoading(false)
    setStep('verify-email')
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
    setStep('welcome')
  }

  async function handlePhoneSend(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-phone/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: signupId, phone, lang }),
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

  return (
    <section ref={formSectionRef} className="min-h-screen flex items-center justify-center bg-[#111] px-6 py-20">
      <div className="w-full max-w-md">

        {step === 'email' && (
          <div className="step-enter">
            <div className="mb-12 text-center">
              <p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">
                {variant === 'default' ? t(lang, 'tagline1') : VARIANT_COPY[variant].line1}
              </p>
              <p className="font-serif uppercase text-3xl sm:text-4xl text-sunrise leading-snug mt-1">
                {variant === 'default' ? t(lang, 'tagline2') : VARIANT_COPY[variant].line2}
              </p>
            </div>
            <form onSubmit={handleEmailNext} className="space-y-4">
              <input
                ref={emailInputRef}
                type="email"
                placeholder={t(lang, 'emailOnlyPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT_CLASS}
              />
              <button
                type="submit"
                disabled={!email.trim()}
                className={BUTTON_CLASS}
              >
                {variant === 'default' ? t(lang, 'buttonJoin') : VARIANT_COPY[variant].button}
              </button>
            </form>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="step-enter space-y-4">
            <p className="font-serif uppercase text-2xl sm:text-3xl mb-2 leading-snug text-white text-center">
              {t(lang, 'headingLine1')} {t(lang, 'headingLine2')}
            </p>
            <p className="text-white/50 text-sm font-body mb-8 text-center">
              {email}
            </p>
            <input
              type="text"
              placeholder={t(lang, 'placeholderName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              className={INPUT_CLASS}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder={t(lang, 'placeholderZip')}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className={INPUT_CLASS}
            />
            <button
              type="submit"
              disabled={loading || !fullName.trim()}
              className={BUTTON_CLASS}
            >
              {loading ? t(lang, 'buttonJoinLoading') : t(lang, 'continueButton')}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="mt-2 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors font-body"
            >
              {t(lang, 'goBack')}
            </button>
          </form>
        )}

        {step === 'verify-email' && (
          <form onSubmit={handleEmailVerify} className="step-enter">
            <p className="font-serif uppercase text-2xl sm:text-3xl mb-2 leading-snug text-white">
              {t(lang, 'checkInbox')}
            </p>
            <p className="text-white/50 text-sm font-body mb-8">
              {t(lang, 'sentCode')} <span className="text-white">{email}</span>
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
              className={`${INPUT_CLASS} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={BUTTON_CLASS}>
              {loading ? t(lang, 'verifying') : t(lang, 'verifyEmail')}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('email') }}
              className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors font-body"
            >
              {t(lang, 'goBack')}
            </button>
          </form>
        )}

        {step === 'phone' && (
          <form onSubmit={handlePhoneSend} className="step-enter">
            <p className="font-serif uppercase text-2xl sm:text-3xl mb-2 leading-snug text-white">
              {t(lang, 'emailVerified')}
            </p>
            <p className="font-serif uppercase text-2xl sm:text-3xl mb-8 leading-snug text-sunrise">
              {t(lang, 'nowPhone')}
            </p>
            <input
              type="tel"
              placeholder={t(lang, 'phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
              className={INPUT_CLASS}
            />
            <button type="submit" disabled={loading || !phone.trim()} className={BUTTON_CLASS}>
              {loading ? t(lang, 'sendingCode') : t(lang, 'sendCode')}
            </button>
          </form>
        )}

        {step === 'verify-phone' && (
          <form onSubmit={handlePhoneVerify} className="step-enter">
            <p className="font-serif uppercase text-2xl sm:text-3xl mb-2 leading-snug text-white">
              {t(lang, 'almostThere')}
            </p>
            <p className="text-white/50 text-sm font-body mb-8">
              {t(lang, 'textedCode')} <span className="text-white">{phone}</span>
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
              className={`${INPUT_CLASS} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={BUTTON_CLASS}>
              {loading ? t(lang, 'verifying') : t(lang, 'verifyPhone')}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('phone') }}
              className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors font-body"
            >
              {t(lang, 'differentNumber')}
            </button>
          </form>
        )}

        {step === 'welcome' && (
          <div className="step-enter text-center">
            <h1 className={headingClass(lang)}>
              <span>{t(lang, 'welcomeTo')}</span>
              <br />
              <span>{t(lang, 'theHuman')}</span>
              <br />
              <span className="text-sunrise">{t(lang, 'movement')}</span>
            </h1>

            <div className="mt-16 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6 text-left">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-sunrise/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-serif uppercase text-lg text-white">{t(lang, 'senatorTitle')}</p>
                  <p className="text-white/40 text-xs font-body">{t(lang, 'senatorSubtitle')}</p>
                </div>
              </div>

              <SenatorLookup lang={lang} initialZip={zipCode} />
            </div>

            <div className="mt-10">
              <p className="text-sm text-white/30 font-body tracking-widest uppercase">
                {t(lang, 'moreSoon')}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center font-body">{error}</p>
        )}
      </div>
    </section>
  )
})

export default SignupForm
