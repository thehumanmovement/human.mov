'use client'

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
}

export default function VideoHero({ lang, onJoinClick }: VideoHeroProps) {
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
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7] contrast-[1.15]"
        />
        {/* Subtle darkening overlay */}
        <div className="absolute inset-0 z-[3] bg-black/30" />
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

        <div className="mt-8 font-body text-base sm:text-lg text-white max-w-xl mx-auto leading-relaxed space-y-4 [text-shadow:_0_1px_20px_rgba(0,0,0,0.9),_0_0_40px_rgba(0,0,0,0.6)]">
          <p>{t(lang, 'heroLine1')}</p>
          <p>{t(lang, 'heroLine2')}</p>
          <p>{t(lang, 'heroLine3')}</p>
        </div>

        <button
          onClick={onJoinClick}
          className="mt-8 px-12 py-4 bg-sunrise text-black rounded-full font-body font-bold text-base uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 shadow-lg shadow-sunrise/30 hover:scale-105"
        >
          {t(lang, 'buttonJoin')}
        </button>
      </div>
    </section>
  )
}
