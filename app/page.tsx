'use client'

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react'

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
      body: JSON.stringify({ fullName, email, zipCode }),
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
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-earth-light rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/60 text-white focus:bg-white/15 focus:ring-1 focus:ring-earth-light/30'

  const buttonClass =
    'mt-8 w-full bg-earth text-white rounded-lg py-4 text-base font-body font-semibold tracking-wide hover:bg-earth-dark transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-earth/20'

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
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
              <span className="italic">The Human</span>
              <br />
              <span className="italic text-earth-light [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">Movement.</span>
            </h1>
          </div>
        )}

        {/* Main form — name, email, zip */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="step-enter space-y-4 bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
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
          <form onSubmit={handleEmailVerify} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Check your inbox.
            </p>
            <p className="text-white/60 text-sm font-body mb-8">
              We sent a 6-digit code to <span className="text-white">{email}</span>
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
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-body"
            >
              Go back
            </button>
          </form>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSend} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Email verified.
            </p>
            <p className="font-serif italic text-2xl sm:text-3xl mb-8 leading-snug text-earth-light">
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
          <form onSubmit={handlePhoneVerify} className="step-enter bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <p className="font-serif italic text-2xl sm:text-3xl mb-2 leading-snug">
              Almost there.
            </p>
            <p className="text-white/60 text-sm font-body mb-8">
              We texted a code to <span className="text-white">{phone}</span>
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
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors font-body"
            >
              Use a different number
            </button>
          </form>
        )}

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="step-enter text-center">
            <h1 className="font-serif text-6xl sm:text-8xl leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">
              <span className="italic">Welcome to</span>
              <br />
              <span className="italic">The Human</span>
              <br />
              <span className="italic text-earth-light [text-shadow:_0_2px_30px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,0,0,0.4)]">Movement.</span>
            </h1>
            <div className="mt-20">
              <p className="text-sm text-white/40 font-body tracking-widest uppercase">
                More soon
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
