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
  const [openAction, setOpenAction] = useState<number | null>(0)

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
                {getVariantCopy(lang, variant).line1}
              </p>
              <p className="font-serif uppercase text-3xl sm:text-4xl text-sunrise leading-snug mt-1">
                {getVariantCopy(lang, variant).line2}
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
                {getVariantCopy(lang, variant).button}
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
            <button
              type="button"
              onClick={() => setStep('welcome')}
              className="mt-3 w-full text-center text-sm text-white/20 hover:text-white/40 transition-colors font-body"
            >
              {t(lang, 'skipVerification')}
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

        {step === 'welcome' && (() => {
          const toggle = (i: number) => setOpenAction(openAction === i ? null : i)
          const chevron = (i: number) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/30 shrink-0 transition-transform duration-300 ${openAction === i ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
          const panel = (i: number) => `transition-all duration-300 ease-in-out overflow-hidden ${openAction === i ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`
          const card = 'bg-white/[0.05] border border-white/[0.1] rounded-2xl overflow-hidden text-left'
          const header = 'w-full flex items-center gap-3 p-5 hover:bg-white/[0.03] transition-colors'
          const icon = 'w-10 h-10 rounded-xl bg-sunrise/20 flex items-center justify-center shrink-0'
          return (
          <div className="step-enter text-center">
            <h1 className={headingClass(lang)}>
              <span>{t(lang, 'welcomeTo')}</span><br />
              <span>{t(lang, 'theHuman')}</span><br />
              <span className="text-sunrise">{t(lang, 'movement')}</span>
            </h1>
            <p className="mt-6 text-white/50 font-body text-sm">Here&apos;s how you can make a difference right now.</p>

            {/* 1. Share the Trailer */}
            <div className={`mt-10 ${card}`}>
              <button onClick={() => toggle(0)} className={header}>
                <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>
                <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">Share the Trailer</p><p className="text-white/40 text-xs font-body">Send it to friends, family &amp; your group chats.</p></div>
                {chevron(0)}
              </button>
              <div className={panel(0)}><div className="px-5 pb-5">
                <div className="aspect-video rounded-xl overflow-hidden bg-black/50 mb-4">
                  <iframe src="https://www.youtube.com/embed/xkPbV3IRe4Y?rel=0" title="The AI Doc Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <a href="https://wa.me/?text=Watch%20this%20trailer%20%E2%80%94%20The%20AI%20Doc%20https%3A%2F%2Fyoutu.be%2FxkPbV3IRe4Y" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.111.546 4.096 1.505 5.826L0 24l6.335-1.652A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.87 0-3.633-.5-5.14-1.382l-.37-.22-3.818.997 1.016-3.713-.24-.381A9.81 9.81 0 0 1 2.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z"/></svg></a>
                  <a href="sms:?&body=Watch%20this%20%E2%80%94%20The%20AI%20Doc%20trailer%20https%3A%2F%2Fyoutu.be%2FxkPbV3IRe4Y" aria-label="iMessage" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#34C759]/20 text-[#34C759] hover:bg-[#34C759]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E1306C]/20 text-[#E1306C] hover:bg-[#E1306C]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                  <a href="https://twitter.com/intent/tweet?text=Watch%20this%20trailer%20%E2%80%94%20The%20AI%20Doc&url=https%3A%2F%2Fyoutu.be%2FxkPbV3IRe4Y" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fyoutu.be%2FxkPbV3IRe4Y" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                  <a href="mailto:?subject=Watch%20this%20%E2%80%94%20The%20AI%20Doc&body=Check%20out%20this%20trailer%20for%20The%20AI%20Doc%3A%20https%3A%2F%2Fyoutu.be%2FxkPbV3IRe4Y" aria-label="Email" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></a>
                  <button onClick={() => navigator.clipboard.writeText('https://youtu.be/xkPbV3IRe4Y')} aria-label="Copy link" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
                </div>
              </div></div>
            </div>

            {/* 2. See the Film */}
            <div className={`mt-3 ${card}`}>
              <button onClick={() => toggle(1)} className={header}>
                <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg></div>
                <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">See the Film</p><p className="text-white/40 text-xs font-body">US Premiere — March 27th</p></div>
                {chevron(1)}
              </button>
              <div className={panel(1)}><div className="px-5 pb-5">
                <a href="https://www.focusfeatures.com/the-ai-doc-or-how-i-became-an-apocaloptimist" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-sunrise text-black rounded-full py-3 text-sm font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 hover:scale-[1.02] mb-3">Get Your Tickets</a>
                <a href="https://www.focusfeatures.com/the-ai-doc-or-how-i-became-an-apocaloptimist" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-full py-3 text-sm font-body font-semibold hover:bg-white/10 transition-all duration-300 mb-5">Gift a Ticket</a>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                  <p className="font-serif uppercase text-sm text-white mb-3">Organize a Watch Party</p>
                  <div className="text-white/50 text-sm font-body space-y-2 mb-4">
                    <p><span className="text-white/70 font-semibold">1.</span> Create a group chat named <span className="text-sunrise font-semibold">&ldquo;Watch Party — The AI Doc&rdquo;</span></p>
                    <p><span className="text-white/70 font-semibold">2.</span> Add friends, family, coworkers — anyone who should see this</p>
                    <p><span className="text-white/70 font-semibold">3.</span> Pick a showtime, buy tickets together, and go as a group</p>
                  </div>
                  <p className="text-white/40 text-xs font-body mb-3">Send the invite now:</p>
                  <div className="flex items-center gap-3">
                    <a href={'https://wa.me/?text=' + encodeURIComponent("Hey! Let's go see \"The AI Doc\" together — premieres March 27th. Get tickets: https://www.focusfeatures.com/the-ai-doc-or-how-i-became-an-apocaloptimist")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.111.546 4.096 1.505 5.826L0 24l6.335-1.652A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.87 0-3.633-.5-5.14-1.382l-.37-.22-3.818.997 1.016-3.713-.24-.381A9.81 9.81 0 0 1 2.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82z"/></svg></a>
                    <a href={'sms:?&body=' + encodeURIComponent("Let's see \"The AI Doc\" together — March 27th! Tickets: https://www.focusfeatures.com/the-ai-doc-or-how-i-became-an-apocaloptimist")} aria-label="iMessage" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#34C759]/20 text-[#34C759] hover:bg-[#34C759]/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></a>
                    <button onClick={() => navigator.clipboard.writeText("Let's see \"The AI Doc\" together — March 27th! Get tickets: https://www.focusfeatures.com/the-ai-doc-or-how-i-became-an-apocaloptimist")} aria-label="Copy" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
                  </div>
                </div>
              </div></div>
            </div>

            {/* 3. Rent a Theater */}
            <div className={`mt-3 ${card}`}>
              <button onClick={() => toggle(2)} className={header}>
                <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
                <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">Rent a Theater</p><p className="text-white/40 text-xs font-body">Book a private screening for your community.</p></div>
                {chevron(2)}
              </button>
              <div className={panel(2)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-2">
                <p><span className="text-white/70 font-semibold">1.</span> Contact your local theater and ask about private rentals or group bookings.</p>
                <p><span className="text-white/70 font-semibold">2.</span> Most theaters offer private screenings for 50-200 people at discounted group rates.</p>
                <p><span className="text-white/70 font-semibold">3.</span> Share the event link with your network and fill the seats.</p>
              </div></div>
            </div>

            {/* 4. Ask Your Senators */}
            <div className={`mt-3 ${card}`}>
              <button onClick={() => toggle(3)} className={header}>
                <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/></svg></div>
                <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">Ask Your Senators</p><p className="text-white/40 text-xs font-body">Ask them to watch the film and share it with colleagues.</p></div>
                {chevron(3)}
              </button>
              <div className={panel(3)}><div className="px-5 pb-5">
                {openAction === 3 && <SenatorLookup lang={lang} initialZip={zipCode} />}
                <div className="mt-5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                  <p className="text-white/60 text-xs font-body font-semibold uppercase tracking-wide mb-2">If calling, say something like:</p>
                  <p className="text-white/50 text-sm font-body italic leading-relaxed">&ldquo;Hi, my name is <span className="text-white/80">{fullName || '[Your Name]'}</span> and I&apos;m a constituent. I&apos;m calling to ask the Senator to watch the documentary &lsquo;The AI Doc&rsquo; — it covers the urgent risks AI poses to jobs, children, and democracy. I&apos;d appreciate it if the Senator would watch it and share it with colleagues. Thank you.&rdquo;</p>
                </div>
                <a href={'mailto:?subject=' + encodeURIComponent('Please watch "The AI Doc" — a film about AI\'s impact on humanity') + '&body=' + encodeURIComponent('Dear Senator,\n\nMy name is ' + (fullName || '[Your Name]') + ' and I am a constituent from ' + (zipCode || '[Your Zip Code]') + '.\n\nI am writing to ask you to watch the documentary "The AI Doc: Or How I Became an Apocaloptimist," which premieres March 27th. The film examines the urgent risks that artificial intelligence poses to American jobs, our children\'s wellbeing, and our democratic institutions.\n\nI believe it is critical that our elected officials understand these challenges as they consider AI policy. I would be grateful if you would watch the film and share it with your colleagues.\n\nYou can find more information at: https://www.human.mov\n\nThank you for your time and service.\n\nSincerely,\n' + (fullName || '[Your Name]'))} className="mt-4 block w-full text-center bg-sunrise text-black rounded-full py-3 text-sm font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 hover:scale-[1.02]">Email Your Senators</a>
              </div></div>
            </div>

            <div className="mt-10">
              <p className="text-sm text-white/30 font-body tracking-widest uppercase">{t(lang, 'moreSoon')}</p>
            </div>
          </div>
          )
        })()}

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center font-body">{error}</p>
        )}
      </div>
    </section>
  )
})

export default SignupForm
