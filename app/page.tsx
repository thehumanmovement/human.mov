'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import { t, LANGUAGES, isValidLang, type Lang } from '@/lib/i18n'

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
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  function selectLang(code: Lang) {
    setLang(code)
    localStorage.setItem('lang', code)
    setLangMenuOpen(false)
  }

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved && isValidLang(saved)) setLang(saved)
    setMounted(true)
  }, [])

  useEffect(() => {
    const langInfo = LANGUAGES.find((l) => l.code === lang)
    document.documentElement.lang = lang
    document.documentElement.dir = langInfo?.dir || 'ltr'
  }, [lang])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [langMenuOpen])

  // Video background cycling with dual elements for seamless playback
  const videos = ['/videos/baby.mp4', '/videos/soldier.mp4', '/videos/turtle.mp4', '/videos/abuelos.mp4', '/videos/motorbike.mp4', '/videos/hands.mp4']
  const [activeIndex, setActiveIndex] = useState(0)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [aIsActive, setAIsActive] = useState(true)

  useEffect(() => {
    // Preload both videos on mount
    if (videoARef.current) {
      videoARef.current.src = videos[0]
      videoARef.current.play()
    }
    if (videoBRef.current) {
      videoBRef.current.src = videos[1]
      videoBRef.current.load()
    }
  }, [])

  const handleVideoEnd = useCallback(() => {
    const nextIndex = (activeIndex + 1) % videos.length
    const nextRef = aIsActive ? videoBRef : videoARef
    const currentRef = aIsActive ? videoARef : videoBRef

    // Ensure next video is ready and play it
    if (nextRef.current) {
      nextRef.current.currentTime = 0
      nextRef.current.play()
    }

    setAIsActive(!aIsActive)
    setActiveIndex(nextIndex)

    // Preload the following video on the now-hidden element
    const followingIndex = (nextIndex + 1) % videos.length
    if (currentRef.current) {
      currentRef.current.src = videos[followingIndex]
      currentRef.current.load()
    }
  }, [activeIndex, aIsActive, videos])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Create signup record
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

  const inputClass =
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-earth-light rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/60 text-white focus:bg-white/15 focus:ring-1 focus:ring-earth-light/30'

  const buttonClass =
    'mt-8 w-full bg-earth text-white rounded-lg py-4 text-base font-body font-semibold tracking-wide hover:bg-earth-dark transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-earth/20'

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Language selector */}
      <div ref={langMenuRef} className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          aria-label="Select language"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/15 text-white/70 hover:text-white hover:bg-black/30 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="text-xs font-body font-semibold tracking-wider" suppressHydrationWarning>
            {mounted ? LANGUAGES.find((l) => l.code === lang)?.label || 'English' : 'English'}
          </span>
        </button>
        {langMenuOpen && (
          <div className="absolute right-0 mt-2 py-1 min-w-[140px] rounded-xl bg-black/40 backdrop-blur-md border border-white/15 shadow-xl overflow-hidden">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => selectLang(l.code)}
                className={`w-full text-left px-4 py-2.5 text-sm font-body transition-colors ${
                  lang === l.code
                    ? 'text-earth-light bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen background video */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          ref={videoARef}
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`absolute inset-0 w-full h-full object-cover ${aIsActive ? 'z-[2]' : 'z-[1]'}`}
        />
        <video
          ref={videoBRef}
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`absolute inset-0 w-full h-full object-cover ${!aIsActive ? 'z-[2]' : 'z-[1]'}`}
        />
        {/* Old camera warm filter */}
        <div className="absolute inset-0 z-[3] bg-[#2a1f14]/45 mix-blend-multiply" />
        <div className="absolute inset-0 z-[3] bg-[#c4a67a]/20" />
      </div>

      {/* Radial vignette behind content for readability */}
      <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.45)_0%,_transparent_75%)]" />

      <div className="relative z-10 w-full max-w-md">

        {/* Header — only on non-welcome steps */}
        {step !== 'welcome' && (
          <div className="mb-10 text-center">
            <h1 className="font-serif text-6xl sm:text-8xl leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">
              <span className="italic">{t(lang, 'headingLine1')}</span>
              <br />
              <span className="italic text-earth-light [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">{t(lang, 'headingLine2')}</span>
            </h1>
          </div>
        )}

        {/* Main form — name, email, zip */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="step-enter space-y-4 bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div>
              <input
                type="text"
                placeholder={t(lang, 'placeholderName')}
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
                placeholder={t(lang, 'placeholderEmail')}
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
                placeholder={t(lang, 'placeholderZip')}
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
              {loading ? t(lang, 'buttonJoinLoading') : t(lang, 'buttonJoin')}
            </button>
          </form>
        )}

        {/* Step: Verify Email */}
        {step === 'verify-email' && (
          <form onSubmit={handleEmailVerify} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              {t(lang, 'checkInbox')}
            </p>
            <p className="text-white/60 text-sm font-body mb-8">
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
              className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? t(lang, 'verifying') : t(lang, 'verifyEmail')}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('form') }}
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-body"
            >
              {t(lang, 'goBack')}
            </button>
          </form>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSend} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              {t(lang, 'emailVerified')}
            </p>
            <p className="font-serif italic text-2xl sm:text-3xl mb-8 leading-snug text-earth-light">
              {t(lang, 'nowPhone')}
            </p>
            <input
              type="tel"
              placeholder={t(lang, 'phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
            <button type="submit" disabled={loading || !phone.trim()} className={buttonClass}>
              {loading ? t(lang, 'sendingCode') : t(lang, 'sendCode')}
            </button>
          </form>
        )}

        {/* Step: Verify Phone */}
        {step === 'verify-phone' && (
          <form onSubmit={handlePhoneVerify} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              {t(lang, 'almostThere')}
            </p>
            <p className="text-white/60 text-sm font-body mb-8">
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
              className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
            />
            <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
              {loading ? t(lang, 'verifying') : t(lang, 'verifyPhone')}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setStep('phone') }}
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-body"
            >
              {t(lang, 'differentNumber')}
            </button>
          </form>
        )}

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="step-enter text-center">
            <h1 className="font-serif text-6xl sm:text-8xl leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">
              <span className="italic">{t(lang, 'welcomeTo')}</span>
              <br />
              <span className="italic">{t(lang, 'theHuman')}</span>
              <br />
              <span className="italic text-earth-light [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">{t(lang, 'movement')}</span>
            </h1>
            <div className="mt-20">
              <p className="text-sm text-white/40 font-body tracking-widest uppercase">
                {t(lang, 'moreSoon')}
              </p>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <p className="mt-4 text-sm text-red-400 text-center font-body">{error}</p>
        )}
      </div>
    </main>
  )
}
