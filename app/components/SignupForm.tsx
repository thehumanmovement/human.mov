'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'

type Step = 'email' | 'details' | 'verify-email'

const INPUT_CLASS =
  'w-full bg-white/[0.07] border border-white/[0.12] focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-sunrise/30'

const BUTTON_CLASS =
  'mt-6 w-full bg-sunrise text-black rounded-full py-4 text-base font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]'

export interface SignupFormHandle {
  scrollToForm: () => void
  startWithEmail: (email: string) => void
}

type Variant = 'default' | 'after-globe' | 'after-protect' | 'final'

function getVariantCopy(lang: Lang, variant: Variant) {
  switch (variant) {
    case 'after-globe':
      return { line1: t(lang, 'variantLine1Globe'), line2: t(lang, 'variantLine2Globe'), button: t(lang, 'variantButtonGlobe') }
    case 'after-protect':
      return { line1: t(lang, 'variantLine1Protect'), line2: t(lang, 'variantLine2Protect'), button: t(lang, 'variantButtonProtect') }
    case 'final':
      return { line1: t(lang, 'variantLine1Final'), line2: t(lang, 'variantLine2Final'), button: t(lang, 'variantButtonFinal') }
    default:
      return { line1: t(lang, 'tagline1'), line2: t(lang, 'tagline2'), button: t(lang, 'variantButtonDefault') }
  }
}

interface SignupFormProps {
  lang: Lang
  variant?: Variant
  overrideLine1?: string
  overrideLine2?: string
  overrideHeading?: React.ReactNode
  overridePlaceholder?: string
  overrideButton?: string
  className?: string
}

const SignupForm = forwardRef<SignupFormHandle, SignupFormProps>(function SignupForm({ lang, variant = 'default', overrideLine1, overrideLine2, overrideHeading, overridePlaceholder, overrideButton, className }, ref) {
  const [step, setStep] = useState<Step>('email')
  const [signupId, setSignupId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('thm-signed-up')
    if (saved) {
      setAlreadySignedUp(true)
    }
    const handler = () => setAlreadySignedUp(true)
    window.addEventListener('thm-signed-up', handler)
    return () => window.removeEventListener('thm-signed-up', handler)
  }, [])

  function goToWelcome() {
    localStorage.setItem('thm-signed-up', '1')
    localStorage.setItem('thm-name', fullName)
    localStorage.setItem('thm-zip', zipCode)
    localStorage.setItem('thm-signup-id', signupId)
    window.location.href = '/share'
  }

  function handleSignOut() {
    localStorage.removeItem('thm-signed-up')
    localStorage.removeItem('thm-name')
    localStorage.removeItem('thm-zip')
    localStorage.removeItem('thm-signup-id')
    setAlreadySignedUp(false)
    setStep('email')
    setEmail('')
    setFullName('')
    setZipCode('')
    setCode('')
    setSignupId('')
  }

  const formSectionRef = useRef<HTMLElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    scrollToForm() {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => emailInputRef.current?.focus(), 600)
    },
    startWithEmail(heroEmail: string) {
      setEmail(heroEmail)
      setStep('details')
      setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
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
      body: JSON.stringify({
        fullName,
        email,
        zipCode,
        lang,
      }),
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

    // Fire Meta Lead event on successful signup
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead')
    }
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
    goToWelcome()
  }


  // If already signed up, show grayed-out "You're in!" state
  if (alreadySignedUp) return (
    <section ref={formSectionRef} className={`flex items-center justify-center bg-[#111] px-6 py-24 sm:py-32 ${className || ''}`}>
      <div className="w-full max-w-md opacity-50">
        <div className="mb-12 text-center">
          {overrideHeading ?? (
            <>
              <p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">
                {overrideLine1 ?? getVariantCopy(lang, variant).line1}
              </p>
              {(overrideLine2 !== '' && (overrideLine2 || getVariantCopy(lang, variant).line2)) && (
                <p className="font-serif uppercase text-3xl sm:text-4xl text-sunrise leading-snug mt-1">
                  {overrideLine2 ?? getVariantCopy(lang, variant).line2}
                </p>
              )}
            </>
          )}
        </div>
        <div className="w-full bg-white/[0.07] border border-white/[0.12] rounded-lg px-5 py-4 text-base font-body text-white/40 text-center">
          {t(lang, 'youreIn')}
        </div>
        <div onDoubleClick={handleSignOut} className="mt-6 w-full bg-sunrise/40 text-black/40 rounded-full py-4 text-base font-body font-bold uppercase tracking-widest text-center cursor-default select-none">
          ✓ {t(lang, 'youreIn')}
        </div>
      </div>
    </section>
  )

  return (
    <section ref={formSectionRef} className={`flex items-center justify-center bg-[#111] px-6 py-24 sm:py-32 ${className || ''}`}>
      <div className="w-full max-w-md">

        {step === 'email' && (
          <div className="step-enter">
            <div className="mb-12 text-center">
              {overrideHeading ?? (
                <>
                  <p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">
                    {overrideLine1 ?? getVariantCopy(lang, variant).line1}
                  </p>
                  {(overrideLine2 !== '' && (overrideLine2 || getVariantCopy(lang, variant).line2)) && (
                    <p className="font-serif uppercase text-3xl sm:text-4xl text-sunrise leading-snug mt-1">
                      {overrideLine2 ?? getVariantCopy(lang, variant).line2}
                    </p>
                  )}
                </>
              )}
            </div>
            <form onSubmit={handleEmailNext} className="space-y-4">
              <input
                ref={emailInputRef}
                type="email"
                placeholder={overridePlaceholder ?? t(lang, 'emailOnlyPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT_CLASS}
              />
              <button
                type="submit"
                disabled={!email.trim()}
                onDoubleClick={handleSignOut}
                className={BUTTON_CLASS}
              >
                {overrideButton ?? getVariantCopy(lang, variant).button}
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
              onDoubleClick={handleSignOut}
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
            <button type="submit" disabled={loading || code.length !== 6} onDoubleClick={handleSignOut} className={BUTTON_CLASS}>
              {loading ? t(lang, 'verifying') : t(lang, 'verifyEmail')}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('email') }}
              className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors font-body"
            >
              {t(lang, 'goBack')}
            </button>
            <button
              type="button"
              onClick={() => goToWelcome()}
              className="mt-3 w-full text-center text-sm text-white/20 hover:text-white/40 transition-colors font-body"
            >
              {t(lang, 'skipVerification')}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center font-body">{error}</p>
        )}
      </div>
    </section>
  )
})

export default SignupForm
