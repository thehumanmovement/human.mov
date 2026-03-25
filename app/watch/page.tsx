'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isValidLang, LANGUAGES, t, type Lang } from '@/lib/i18n'
import LanguageSelector from '../components/LanguageSelector'
import SignupForm, { type SignupFormHandle } from '../components/SignupForm'

const GlobeSection = dynamic(() => import('../components/WatchGlobeScroll'), { ssr: false })
const GetInformed = dynamic(() => import('../components/GetInformed'), { ssr: false })

const VIMEO_VIDEO_ID = '1176390079'
const VIMEO_HASH = '65046f9d31'
const LOOP_START = 89   // 1:29
const LOOP_END = 140    // 2:20

export default function WatchPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const formRef = useRef<SignupFormHandle>(null)
  const bgIframeRef = useRef<HTMLIFrameElement>(null)
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

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

  // Background video loop: seek back to LOOP_START when reaching LOOP_END
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== 'string') return
      try {
        const data = JSON.parse(e.data)
        // Handle timeupdate for background loop
        if (data.event === 'timeupdate' && !isFullscreen) {
          const seconds = data.data?.seconds ?? 0
          if (seconds >= LOOP_END || seconds < LOOP_START) {
            bgIframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ method: 'setCurrentTime', value: LOOP_START }),
              '*'
            )
          }
        }
      } catch {}
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isFullscreen])

  // Send initial commands to background iframe once loaded
  const onBgIframeLoad = useCallback(() => {
    const iframe = bgIframeRef.current
    if (!iframe?.contentWindow) return
    const post = (msg: object) => iframe.contentWindow!.postMessage(JSON.stringify(msg), '*')
    // Seek to loop start
    post({ method: 'setCurrentTime', value: LOOP_START })
    post({ method: 'play' })
    // Listen for timeupdate
    post({ method: 'addEventListener', value: 'timeupdate' })
  }, [])

  function handlePlay() {
    setIsFullscreen(true)
  }

  function handleFullscreenClose() {
    setIsFullscreen(false)
  }

  // When fullscreen opens, listen for Escape key
  useEffect(() => {
    if (!isFullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  function selectLang(code: Lang) {
    setLang(code)
    localStorage.setItem('lang', code)
  }

  return (
    <>
      <LanguageSelector lang={lang} mounted={mounted} onSelect={selectLang} />

      {/* Fullscreen Vimeo Hero */}
      <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-black">
        {/* Background looping video (muted) */}
        <iframe
          ref={bgIframeRef}
          src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?h=${VIMEO_HASH}&autoplay=1&muted=1&loop=0&background=1&quality=1080p&api=1#t=${LOOP_START}s`}
          allow="autoplay; fullscreen"
          onLoad={onBgIframeLoad}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full min-h-full pointer-events-none"
          style={{ border: 'none' }}
        />
        {/* Darkening overlay */}
        <div className="absolute inset-0 z-[3] bg-black/30 pointer-events-none" />
        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 z-[5] h-48 pointer-events-none bg-gradient-to-b from-transparent to-[#111]" />

        {/* Top-left logo */}
        <div className="absolute top-6 left-6 z-10">
          <p className="font-serif uppercase text-lg sm:text-xl text-white/80 [text-shadow:_0_1px_10px_rgba(0,0,0,0.6)]">
            {t(lang, 'headingLine1')} {t(lang, 'headingLine2')}
          </p>
        </div>

        {/* Centered play button */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <button
            onClick={handlePlay}
            className="group flex flex-col items-center gap-6 cursor-pointer"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110 group-hover:border-white">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-serif uppercase text-xl sm:text-2xl text-white tracking-wide [text-shadow:_0_2px_20px_rgba(0,0,0,0.8)] group-hover:text-sunrise transition-colors duration-300">
              What&apos;s the human movement?
            </span>
          </button>
        </div>
      </section>

      {/* Fullscreen video overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={handleFullscreenClose}
            className="absolute top-6 right-6 z-[60] w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="Close video"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <iframe
            ref={fullscreenIframeRef}
            src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?h=${VIMEO_HASH}&autoplay=1&muted=0&loop=0&quality=1080p&controls=1&api=1#t=0s`}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      )}

      <SignupForm ref={formRef} lang={lang} variant="after-globe" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">I&apos;d like to <span className="text-sunrise">learn more.</span></p>} overridePlaceholder="Enter my email" overrideButton="Get Info Now" />
      <GlobeSection lang={lang} />

      <SignupForm lang={lang} variant="after-protect" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">An anti-human future with AI is <span className="text-sunrise">not inevitable.</span></p>} overridePlaceholder="Add your email to agree" overrideButton="I Agree" />

      <GetInformed lang={lang} />

      {/* In Alliance With */}
      <section className="px-6 pt-40 pb-44 sm:pt-52 sm:pb-56 bg-[#111]">
        <p className="text-center text-base sm:text-lg font-body font-semibold tracking-widest uppercase text-white/50 mb-28">
          {t(lang, 'partnersTitle')}
        </p>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-20 sm:gap-28 lg:gap-36 mb-20 sm:mb-24">
            {[
              { src: '/images/partners/CHT_logo.svg', alt: 'Center for Humane Technology', h: 'h-20 sm:h-28', href: 'https://www.humanetech.com/' },
              { src: '/images/partners/FLI_logo.webp', alt: 'Future of Life Institute', h: 'h-24 sm:h-32', href: 'https://futureoflife.org/' },
            ].map((logo) => (
              <a key={logo.alt} href={logo.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src={logo.src} alt={logo.alt} loading="lazy" className={`${logo.h} w-auto brightness-0 invert opacity-70`} />
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-20 sm:gap-28 lg:gap-36">
            {[
              { src: '/images/partners/APHRC_logo.svg', alt: 'APHRC', h: 'h-20 sm:h-28', href: 'https://aiphrc.org/' },
              { src: '/images/partners/humanchange_logo.svg', alt: 'Human Change', h: 'h-18 sm:h-24', href: 'https://humanchange.com/' },
            ].map((logo) => (
              <a key={logo.alt} href={logo.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src={logo.src} alt={logo.alt} loading="lazy" className={`${logo.h} w-auto brightness-0 invert opacity-70`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <SignupForm lang={lang} variant="final" />
    </>
  )
}
