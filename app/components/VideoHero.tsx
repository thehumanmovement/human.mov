'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'

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

interface VideoHeroProps {
  lang: Lang
  onJoinClick: () => void
  onHeroSignup?: (email: string) => void
}

export default function VideoHero({ lang, onJoinClick, onHeroSignup }: VideoHeroProps) {
  const [email, setEmail] = useState('')
  const [alreadySignedUp, setAlreadySignedUp] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('thm-signed-up')) {
      setAlreadySignedUp(true)
    }
    const handler = () => setAlreadySignedUp(true)
    window.addEventListener('thm-signed-up', handler)
    return () => window.removeEventListener('thm-signed-up', handler)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    if (onHeroSignup) {
      onHeroSignup(email)
    } else {
      onJoinClick()
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fullscreen background video */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          src="/images/earthglobe-hd.mp4"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6] contrast-[1.15]"
        />
        {/* Subtle darkening overlay */}
        <div className="absolute inset-0 z-[3] bg-black/45" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.35)_0%,_transparent_75%)]" />
      {/* Bottom fade into form section */}
      <div className="absolute bottom-0 left-0 right-0 z-[5] h-48 pointer-events-none bg-gradient-to-b from-transparent to-[#111]" />

      {/* Top-left logo */}
      <div className="absolute top-6 left-6 z-10">
        <p className="font-serif uppercase text-lg sm:text-xl text-white/80 [text-shadow:_0_1px_10px_rgba(0,0,0,0.6)]">
          {t(lang, 'headingLine1')} {t(lang, 'headingLine2')}
        </p>
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className={headingClass(lang)}>
          <span>{t(lang, 'headingLine1')}</span>
          <br />
          <span className="text-sunrise">{t(lang, 'headingLine2')}</span>
        </h1>

        <p className="mt-6 font-body text-base sm:text-lg text-white max-w-xl mx-auto leading-relaxed [text-shadow:_0_1px_20px_rgba(0,0,0,0.9),_0_0_40px_rgba(0,0,0,0.6)]">
          {t(lang, 'heroLine3')}
        </p>

        {!alreadySignedUp && (
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t(lang, 'emailOnlyPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-white/[0.12] backdrop-blur-sm border border-white/20 focus:border-sunrise rounded-lg px-5 py-4 text-base font-body outline-none transition-all placeholder:text-white/50 text-white focus:bg-white/15 focus:ring-1 focus:ring-sunrise/30 [text-shadow:none]"
            />
            <div className="relative mt-4">
              {/* Hand-drawn pencil circle animation */}
              <svg
                className="absolute -inset-3 sm:-inset-4 w-[calc(100%+24px)] h-[calc(100%+24px)] sm:w-[calc(100%+32px)] sm:h-[calc(100%+32px)] pointer-events-none z-10"
                viewBox="0 0 400 80"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 30 40 C 30 15, 80 5, 200 8 C 320 5, 375 15, 378 38 C 380 55, 340 72, 200 75 C 80 78, 25 65, 22 45 C 20 30, 60 18, 140 14"
                  stroke="#d4a843"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.85"
                  style={{
                    strokeDasharray: 1200,
                    strokeDashoffset: 1200,
                    animation: 'drawCircle 2s ease-out 1.5s forwards',
                    filter: 'url(#pencilTexture)',
                  }}
                />
                <defs>
                  <filter id="pencilTexture">
                    <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                  </filter>
                </defs>
              </svg>
              <button
                type="submit"
                disabled={!email.trim()}
                className="relative w-full bg-sunrise text-black rounded-full py-4 text-base font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 shadow-lg shadow-sunrise/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {t(lang, 'heroButton')}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
