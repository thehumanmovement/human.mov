'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'
import { t, LANGUAGES, isValidLang, type Lang } from '@/lib/i18n'

type Step = 'email' | 'details' | 'verify-email' | 'phone' | 'verify-phone' | 'welcome'

// Responsive heading sizes per language to prevent overflow on CJK / long translations
function headingClass(lang: Lang): string {
  const base = 'font-serif leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]'
  switch (lang) {
    case 'zh':
      return `${base} text-6xl sm:text-8xl`
    case 'ko':
      return `${base} text-5xl sm:text-7xl`
    case 'ja':
      return `${base} text-4xl sm:text-6xl`
    case 'hi':
      return `${base} text-4xl sm:text-6xl`
    case 'ar':
      return `${base} text-5xl sm:text-7xl`
    case 'es':
    case 'fr':
      return `${base} text-5xl sm:text-7xl`
    default:
      return `${base} text-6xl sm:text-8xl`
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>('email')
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
  const formSectionRef = useRef<HTMLElement>(null)

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
  const videos = ['/videos/baby.mp4', '/videos/turtle.mp4', '/videos/abuelos.mp4', '/videos/motorbike.mp4', '/videos/hands.mp4']
  const [activeIndex, setActiveIndex] = useState(0)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [aIsActive, setAIsActive] = useState(true)

  useEffect(() => {
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

    if (nextRef.current) {
      nextRef.current.currentTime = 0
      nextRef.current.play()
    }

    setAIsActive(!aIsActive)
    setActiveIndex(nextIndex)

    const followingIndex = (nextIndex + 1) % videos.length
    if (currentRef.current) {
      currentRef.current.src = videos[followingIndex]
      currentRef.current.load()
    }
  }, [activeIndex, aIsActive, videos])

  const emailInputRef = useRef<HTMLInputElement>(null)

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    // Focus the email input after scroll animation completes
    setTimeout(() => {
      emailInputRef.current?.focus()
    }, 600)
  }

  // Step 1: Email submitted — move to details
  function handleEmailNext(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStep('details')
  }

  // Step 2: Details submitted — call signup API
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

  const inputClass =
    'w-full bg-white/[0.07] border border-white/[0.12] focus:border-earth-light rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/40 text-white focus:bg-white/10 focus:ring-1 focus:ring-earth-light/30'

  const buttonClass =
    'mt-6 w-full bg-earth text-white rounded-lg py-4 text-base font-body font-semibold tracking-wide hover:bg-earth-dark transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <>
      {/* ===== SECTION 1: VIDEO HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          {/* Warm filter overlay */}
          <div className="absolute inset-0 z-[3] bg-[#2a1f14]/45 mix-blend-multiply" />
          <div className="absolute inset-0 z-[3] bg-[#c4a67a]/20" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.35)_0%,_transparent_75%)]" />
        {/* Bottom fade into form section */}
        <div className="absolute bottom-0 left-0 right-0 z-[5] h-48 pointer-events-none bg-gradient-to-b from-transparent to-[#111]" />

        {/* Top-left logo */}
        <div className="absolute top-6 left-6 z-10">
          <p className="font-serif italic text-lg sm:text-xl text-white/80 [text-shadow:_0_1px_10px_rgba(0,0,0,0.6)]">
            {t(lang, 'headingLine1')} {t(lang, 'headingLine2')}
          </p>
        </div>

        {/* Hero content — new headline */}
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <h1 className="font-serif leading-[1.15] tracking-tight text-white text-4xl sm:text-6xl [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">
            <span className="italic">{t(lang, 'heroLine1')}</span>
            <br />
            <span className="italic text-earth-light">{t(lang, 'heroLine2')}</span>
          </h1>

          {/* Join button */}
          <button
            onClick={scrollToForm}
            className="mt-10 px-10 py-4 bg-earth text-white rounded-lg font-body font-semibold text-base tracking-wide hover:bg-earth-dark transition-all duration-300 shadow-lg shadow-earth/30"
          >
            {t(lang, 'buttonJoin')}
          </button>
        </div>
      </section>

      {/* ===== SECTION 2: FORM ===== */}
      <section ref={formSectionRef} className="min-h-screen flex items-center justify-center bg-[#111] px-6 py-20">
        <div className="w-full max-w-md">

          {/* Step: Email only */}
          {step === 'email' && (
            <div className="step-enter">
              <div className="mb-12 text-center">
                <p className="font-serif italic text-3xl sm:text-4xl text-white leading-snug">
                  {t(lang, 'tagline1')}
                </p>
                <p className="font-serif italic text-3xl sm:text-4xl text-earth-light leading-snug mt-1">
                  {t(lang, 'tagline2')}
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
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className={buttonClass}
                >
                  {t(lang, 'buttonJoin')}
                </button>
              </form>
            </div>
          )}

          {/* Step: Name + Zip */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="step-enter space-y-4">
              <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug text-white text-center">
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
                className={inputClass}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder={t(lang, 'placeholderZip')}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={loading || !fullName.trim()}
                className={buttonClass}
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

          {/* Step: Verify Email */}
          {step === 'verify-email' && (
            <form onSubmit={handleEmailVerify} className="step-enter">
              <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug text-white">
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
                className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
              />
              <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
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

          {/* Step: Phone */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSend} className="step-enter">
              <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug text-white">
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
            <form onSubmit={handlePhoneVerify} className="step-enter">
              <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug text-white">
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
                className={`${inputClass} text-center text-3xl tracking-[0.5em] font-serif`}
              />
              <button type="submit" disabled={loading || code.length !== 6} className={buttonClass}>
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

          {/* Step: Welcome + Senator Widget */}
          {step === 'welcome' && (
            <div className="step-enter text-center">
              <h1 className={headingClass(lang)}>
                <span className="italic">{t(lang, 'welcomeTo')}</span>
                <br />
                <span className="italic">{t(lang, 'theHuman')}</span>
                <br />
                <span className="italic text-earth-light">{t(lang, 'movement')}</span>
              </h1>

              {/* Senator Lookup Widget */}
              <div className="mt-16 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6 text-left">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-earth/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-earth-light">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-serif italic text-lg text-white">{t(lang, 'senatorTitle')}</p>
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

          {/* Error display */}
          {error && (
            <p className="mt-4 text-sm text-red-400 text-center font-body">{error}</p>
          )}
        </div>
      </section>
    </>
  )
}

// --- Senator Lookup Component ---
interface Senator {
  name: string
  party: string
  phones: string[]
  photoUrl?: string
  urls?: string[]
}

function SenatorLookup({ lang, initialZip }: { lang: Lang; initialZip: string }) {
  const [zip, setZip] = useState(initialZip || '')
  const [senators, setSenators] = useState<Senator[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [looked, setLooked] = useState(false)

  // Auto-lookup if zip was provided during signup
  useEffect(() => {
    if (initialZip && /^\d{5}$/.test(initialZip)) {
      lookupSenators(initialZip)
    }
  }, [initialZip])

  async function lookupSenators(zipCode: string) {
    setLookupLoading(true)
    setLookupError('')
    setSenators([])
    setLooked(true)

    try {
      const res = await fetch(`/api/representatives?zip=${zipCode}`)
      const data = await res.json()

      if (!res.ok) {
        setLookupError(data.error || 'Lookup failed')
        setLookupLoading(false)
        return
      }

      setSenators(data.senators || [])
    } catch {
      setLookupError('Network error')
    }
    setLookupLoading(false)
  }

  function handleLookup(e: FormEvent) {
    e.preventDefault()
    if (/^\d{5}$/.test(zip)) {
      lookupSenators(zip)
    }
  }

  function generateVCard(senator: Senator) {
    const phone = senator.phones[0] || ''
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:Sen. ${senator.name}`,
      `ORG:U.S. Senate (${senator.party})`,
      phone ? `TEL;TYPE=WORK:${phone}` : '',
      senator.urls?.[0] ? `URL:${senator.urls[0]}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n')

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Senator_${senator.name.replace(/\s+/g, '_')}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-4">
      {/* Zip input + lookup */}
      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder={t(lang, 'senatorZipPlaceholder')}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          className="flex-1 bg-white/[0.07] border border-white/[0.12] rounded-lg px-4 py-3 text-base font-body outline-none placeholder:text-white/40 text-white focus:border-earth-light transition-all"
        />
        <button
          type="submit"
          disabled={lookupLoading || zip.length !== 5}
          className="px-5 py-3 bg-earth text-white rounded-lg font-body font-semibold text-sm hover:bg-earth-dark transition-all disabled:opacity-30"
        >
          {lookupLoading ? t(lang, 'senatorLoading') : t(lang, 'senatorLookup')}
        </button>
      </form>

      {/* Error */}
      {lookupError && (
        <p className="mt-3 text-sm text-red-400 font-body">{lookupError}</p>
      )}

      {/* No results */}
      {looked && !lookupLoading && senators.length === 0 && !lookupError && (
        <p className="mt-3 text-sm text-white/40 font-body">{t(lang, 'senatorNoResults')}</p>
      )}

      {/* Senator cards */}
      {senators.map((senator, i) => (
        <div key={i} className="mt-4 bg-white/[0.05] border border-white/[0.1] rounded-xl p-4">
          <div className="flex items-start gap-3">
            {senator.photoUrl && (
              <img
                src={senator.photoUrl}
                alt={senator.name}
                className="w-12 h-12 rounded-full object-cover bg-white/10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="flex-1">
              <p className="font-body font-semibold text-white">{senator.name}</p>
              <p className="text-white/40 text-xs font-body">
                {t(lang, 'senatorParty')}: {senator.party}
              </p>
              {senator.phones[0] && (
                <a
                  href={`tel:${senator.phones[0]}`}
                  className="text-earth-light text-sm font-body hover:underline"
                >
                  {senator.phones[0]}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {senator.phones[0] && (
              <a
                href={`tel:${senator.phones[0]}`}
                className="flex-1 text-center py-2 bg-earth text-white rounded-lg text-sm font-body font-semibold hover:bg-earth-dark transition-all"
              >
                {t(lang, 'senatorCall')}
              </a>
            )}
            <button
              onClick={() => generateVCard(senator)}
              className="flex-1 text-center py-2 bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-lg text-sm font-body font-semibold hover:bg-white/10 transition-all"
            >
              {t(lang, 'senatorSaveContact')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
