'use client'

import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import dynamic from 'next/dynamic'
import { isValidLang, LANGUAGES, t, type Lang } from '@/lib/i18n'
import LanguageSelector from './components/LanguageSelector'
import SignupForm, { type SignupFormHandle } from './components/SignupForm'
import ContactSection from './components/ContactSection'

const GlobeSection = dynamic(() => import('./components/WatchGlobeScroll'), { ssr: false })
const GetInformed = dynamic(() => import('./components/GetInformed'), { ssr: false })

const VIMEO_VIDEO_ID = '1177797002'
const VIMEO_HASH = '09abb31a4f'
const LOOP_START = 83   // 1:23
const LOOP_END = 139    // 2:19

/** Pick background video quality — default 540p, upgrade to 720p on fast connections */
function getBgQuality(): string {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as unknown as { connection: { effectiveType?: string; downlink?: number } }).connection
    // Upgrade to 720p only on fast 4G+ connections with good bandwidth
    if (conn.effectiveType === '4g' && typeof conn.downlink === 'number' && conn.downlink >= 10) {
      return '720p'
    }
  }
  return '540p'
}

export default function WatchPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bgQuality, setBgQuality] = useState('540p')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [bgLoaded, setBgLoaded] = useState(false)
  const bgLoadedRef = useRef(false)
  const formRef = useRef<SignupFormHandle>(null)
  const bgIframeRef = useRef<HTMLIFrameElement>(null)
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bgInitTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved && isValidLang(saved)) setLang(saved)
    setBgQuality(getBgQuality())
    setMounted(true)
  }, [])

  useEffect(() => {
    const langInfo = LANGUAGES.find((l) => l.code === lang)
    document.documentElement.lang = lang
    document.documentElement.dir = langInfo?.dir || 'ltr'
  }, [lang])

  // Background video loop: seek back to LOOP_START when reaching LOOP_END
  // Also detect when video actually starts playing to fade out poster
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== 'string') return
      try {
        const data = JSON.parse(e.data)
        // Handle timeupdate / playProgress for background loop
        if ((data.event === 'timeupdate' || data.event === 'playProgress') && !isFullscreen) {
          const seconds = data.data?.seconds ?? data.data?.playProgress ?? 0
          // Fade out poster once video is actually playing
          if (seconds >= LOOP_START && !bgLoadedRef.current) {
            bgLoadedRef.current = true
            setBgLoaded(true)
          }
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
    function post(msg: object) {
      if (bgIframeRef.current?.contentWindow) {
        bgIframeRef.current.contentWindow.postMessage(JSON.stringify(msg), '*')
      }
    }
    function init() {
      post({ method: 'addEventListener', value: 'timeupdate' })
      post({ method: 'addEventListener', value: 'playProgress' })
      post({ method: 'setCurrentTime', value: LOOP_START })
      post({ method: 'setVolume', value: 0 })
      post({ method: 'play' })
    }
    // Clear any previous timers
    bgInitTimers.current.forEach(clearTimeout)
    bgInitTimers.current = []
    init()
    bgInitTimers.current.push(setTimeout(init, 500))
    bgInitTimers.current.push(setTimeout(init, 1500))
  }, [])

  function handlePlay() {
    // Clear bg init timers to prevent postMessage on removed iframe
    bgInitTimers.current.forEach(clearTimeout)
    bgInitTimers.current = []
    setIsFullscreen(true)
    setIsPlaying(true)
    setProgress(0)
    setCurrentTime(0)
    setShowControls(true)
  }

  function handleFullscreenClose() {
    setIsFullscreen(false)
    setIsPlaying(false)
  }

  // Custom player: send command to fullscreen iframe
  function postToPlayer(msg: object) {
    if (fullscreenIframeRef.current?.contentWindow) {
      fullscreenIframeRef.current.contentWindow.postMessage(JSON.stringify(msg), '*')
    }
  }

  function togglePlayPause() {
    if (isPlaying) {
      postToPlayer({ method: 'pause' })
    } else {
      postToPlayer({ method: 'play' })
    }
    setIsPlaying(!isPlaying)
  }

  function handleProgressClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const maxTime = duration > 1 ? duration - 1 : duration
    const time = Math.min(pct * duration, maxTime)
    const clampedPct = time / duration
    postToPlayer({ method: 'setCurrentTime', value: time })
    setCurrentTime(time)
    setProgress(clampedPct)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Auto-hide controls after inactivity
  function resetControlsTimer() {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000)
  }

  // Listen for fullscreen player messages (timeupdate, play, pause, duration)
  useEffect(() => {
    if (!isFullscreen) return
    function onMessage(e: MessageEvent) {
      if (typeof e.data !== 'string') return
      try {
        const data = JSON.parse(e.data)
        // Vimeo sends timeupdate with { seconds, duration } or playProgress with { seconds, percent, duration }
        if (data.event === 'timeupdate' || data.event === 'playProgress') {
          const s = data.data?.seconds ?? 0
          const d = data.data?.duration ?? 0
          const maxTime = d > 1 ? d - 1 : d
          // Stop 1 second before the end
          if (d > 0 && s >= maxTime) {
            fullscreenIframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ method: 'pause' }), '*'
            )
            fullscreenIframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ method: 'setCurrentTime', value: maxTime }), '*'
            )
            setIsPlaying(false)
            setCurrentTime(maxTime)
            setProgress(maxTime / d)
          } else {
            const pct = data.data?.percent ?? (d > 0 ? s / d : 0)
            if (s > 0) setCurrentTime(s)
            if (d > 0) setDuration(d)
            if (pct > 0) setProgress(typeof pct === 'number' ? pct : 0)
          }
        }
        // getDuration response
        if (data.method === 'getDuration' && data.value) {
          setDuration(Number(data.value))
        }
        if (data.event === 'play') setIsPlaying(true)
        if (data.event === 'pause') setIsPlaying(false)
      } catch {}
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isFullscreen])

  // Subscribe fullscreen player to events on load
  const onPlayerIframeLoad = useCallback(() => {
    const iframe = fullscreenIframeRef.current
    if (!iframe?.contentWindow) return
    function post(msg: object) {
      iframe?.contentWindow?.postMessage(JSON.stringify(msg), '*')
    }
    function init() {
      post({ method: 'addEventListener', value: 'timeupdate' })
      post({ method: 'addEventListener', value: 'playProgress' })
      post({ method: 'addEventListener', value: 'play' })
      post({ method: 'addEventListener', value: 'pause' })
      post({ method: 'getDuration' })
      post({ method: 'play' })
    }
    init()
    setTimeout(init, 500)
    setTimeout(init, 1500)
  }, [])

  // When fullscreen opens, listen for Escape key
  useEffect(() => {
    if (!isFullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleFullscreenClose()
      if (e.key === ' ') { e.preventDefault(); togglePlayPause() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isFullscreen, isPlaying])

  function selectLang(code: Lang) {
    setLang(code)
    localStorage.setItem('lang', code)
  }

  return (
    <>
      {/* Vimeo Hero */}
      <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-black">
        {!isFullscreen && <LanguageSelector lang={lang} mounted={mounted} onSelect={selectLang} />}
        {isFullscreen ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            onMouseMove={resetControlsTimer}
            onClick={resetControlsTimer}
          >
            {/* Vimeo iframe — no controls, we overlay our own */}
            <iframe
              ref={fullscreenIframeRef}
              src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?h=${VIMEO_HASH}&autoplay=1&muted=0&loop=0&quality=1080p&controls=0&title=0&byline=0&portrait=0&api=1&dnt=1#t=0s`}
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={onPlayerIframeLoad}
              className="w-full max-w-[177.78vh] aspect-video pointer-events-none"
              style={{ border: 'none' }}
            />

            {/* Custom controls overlay */}
            <div
              className="absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-500"
              style={{ opacity: showControls ? 1 : 0 }}
            >
              {/* Top gradient + close button */}
              <div className="bg-gradient-to-b from-black/60 to-transparent pt-5 pb-12 px-6 flex justify-end pointer-events-auto">
                <button
                  onClick={handleFullscreenClose}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer"
                  aria-label="Close video"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Center: play/pause tap area */}
              <div className="flex-1 flex items-center justify-center pointer-events-auto cursor-pointer" onClick={togglePlayPause}>
                {!isPlaying && (
                  <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform hover:scale-110">
                    <svg className="w-12 h-12 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Bottom bar: progress + controls */}
              <div className="bg-gradient-to-t from-black/70 to-transparent pt-12 pb-6 px-6 pointer-events-auto">
                {/* Progress bar */}
                <div
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className="w-full h-2 bg-white/20 rounded-full cursor-pointer group relative mb-4 hover:h-3 transition-all"
                >
                  <div
                    className="h-full bg-sunrise rounded-full relative"
                    style={{ width: `${progress * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {/* Play/Pause button */}
                  <button onClick={togglePlayPause} className="text-white hover:text-sunrise transition-colors cursor-pointer">
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                    ) : (
                      <svg className="w-8 h-8 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>

                  {/* Time */}
                  <span className="text-white/90 text-sm font-body tracking-wide">
                    {formatTime(currentTime)} <span className="text-white/40 mx-1">/</span> {duration > 0 ? formatTime(duration) : '—:——'}
                  </span>

                  <div className="flex-1" />

                  {/* Fullscreen button */}
                  <button
                    onClick={() => {
                      const el = sectionRef.current
                      if (!el) return
                      if (document.fullscreenElement) {
                        document.exitFullscreen()
                      } else {
                        el.requestFullscreen().catch(() => {})
                      }
                    }}
                    className="text-white hover:text-sunrise transition-colors cursor-pointer"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v5.25m0-5.25h5.25m-5.25 0L9 9m11.25-5.25v5.25m0-5.25h-5.25m5.25 0L15 9m-11.25 11.25v-5.25m0 5.25h5.25m-5.25 0L9 15m11.25 5.25v-5.25m0 5.25h-5.25m5.25 0L15 15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cover image until video loads */}
            <img
              src="/images/video-cover.jpg"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-1000 pointer-events-none"
              style={{ opacity: bgLoaded ? 0 : 1 }}
            />
            {/* Background looping video (muted) */}
            <iframe
              ref={bgIframeRef}
              src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?h=${VIMEO_HASH}&autoplay=1&muted=1&loop=0&background=0&controls=0&title=0&byline=0&portrait=0&quality=${bgQuality}&api=1&player_id=bg#t=${LOOP_START}s`}
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
                <span className="font-serif uppercase text-2xl sm:text-3xl text-white tracking-wide [text-shadow:_0_2px_20px_rgba(0,0,0,0.8)] group-hover:text-sunrise transition-colors duration-300">
                  {t(lang, 'heroPlayButton')}
                </span>
              </button>
            </div>
          </>
        )}
      </section>

      <div className="text-center px-6 pt-16 pb-0 bg-[#111]">
        <p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">IT&apos;S <span className="text-sunrise">URGENT</span></p>
        <div className="max-w-2xl mx-auto mt-8 space-y-4 font-body text-base sm:text-lg text-white/80 leading-relaxed">
          <p>{t(lang, 'heroLine1')}</p>
          <p>{t(lang, 'heroLine2')}</p>
          <p>{t(lang, 'heroLine3')}</p>
        </div>
      </div>
      <SignupForm ref={formRef} lang={lang} variant="after-globe" overrideHeading={<></>} overridePlaceholder={t(lang, 'enterMyEmail')} overrideButton={t(lang, 'getInfoNow')} className="!pt-8 sm:!pt-10" />
      <GlobeSection lang={lang} />

      <SignupForm lang={lang} variant="after-protect" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">{t(lang, 'antiHumanFuture')} <span className="text-sunrise">{t(lang, 'notInevitable')}</span></p>} overridePlaceholder={t(lang, 'addEmailToAgree')} overrideButton={t(lang, 'getInfoNow')} />

      <GetInformed lang={lang} />

      <SignupForm lang={lang} variant="after-protect" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">{t(lang, 'joinTheHuman')} <span className="text-sunrise">{t(lang, 'humanMovement')}</span></p>} overridePlaceholder={t(lang, 'enterMyEmail')} overrideButton={t(lang, 'getInfoNow')} />

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
              { src: '/images/partners/APHRC_logo.svg', alt: 'APHRC', h: 'h-8 sm:h-10', href: 'https://aiphrc.org/' },
              { src: '/images/partners/humanchange_logo.svg', alt: 'Human Change', h: 'h-18 sm:h-24', href: 'https://humanchange.com/' },
              { src: '/images/partners/humansfirst_logo.webp', alt: 'Humans First', h: 'h-20 sm:h-28', href: 'https://www.humansfirst.com/', detailed: true },
            ].map((logo) => (
              <a key={logo.alt} href={logo.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src={logo.src} alt={logo.alt} loading="lazy" className={`${logo.h} w-auto ${(logo as any).detailed ? 'grayscale invert brightness-[1.8] opacity-70' : 'brightness-0 invert opacity-70'}`} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <ContactSection lang={lang} overrideHeading={
        <h2 className="font-serif uppercase text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
          {t(lang, 'contactOverrideTitle1')}{' '}
          <span className="text-sunrise">{t(lang, 'contactOverrideTitle2')}</span>
        </h2>
      } hideDesc emailPlaceholder={t(lang, 'myEmail')} messagePlaceholder={t(lang, 'myIdeaMessage')} />

    </>
  )
}
