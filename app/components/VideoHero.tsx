'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { t, type Lang } from '@/lib/i18n'

const VIDEOS = ['/videos/baby.mp4', '/videos/turtle.mp4', '/videos/abuelos.mp4', '/videos/motorbike.mp4', '/videos/hands.mp4']

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
  const [activeIndex, setActiveIndex] = useState(0)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [aIsActive, setAIsActive] = useState(true)

  useEffect(() => {
    if (videoARef.current) {
      videoARef.current.src = VIDEOS[0]
      videoARef.current.play()
    }
    if (videoBRef.current) {
      videoBRef.current.src = VIDEOS[1]
      videoBRef.current.load()
    }
  }, [])

  const handleVideoEnd = useCallback(() => {
    const nextIndex = (activeIndex + 1) % VIDEOS.length
    const nextRef = aIsActive ? videoBRef : videoARef
    const currentRef = aIsActive ? videoARef : videoBRef

    if (nextRef.current) {
      nextRef.current.currentTime = 0
      nextRef.current.play()
    }

    setAIsActive(!aIsActive)
    setActiveIndex(nextIndex)

    const followingIndex = (nextIndex + 1) % VIDEOS.length
    if (currentRef.current) {
      currentRef.current.src = VIDEOS[followingIndex]
      currentRef.current.load()
    }
  }, [activeIndex, aIsActive])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          preload="none"
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

        <p className="mt-8 font-body text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
          Trillion-dollar AI companies are caught in a race to take the livelihood of more than a billion people, crash the economy, and crash humanity. We must fight back.
        </p>

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
