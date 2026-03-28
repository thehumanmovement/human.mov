'use client'

import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import dynamic from 'next/dynamic'
import { track } from '@vercel/analytics'
import { isValidLang, LANGUAGES, t, type Lang } from '@/lib/i18n'
import LanguageSelector from './components/LanguageSelector'
import SignupForm, { type SignupFormHandle } from './components/SignupForm'
import ContactSection from './components/ContactSection'
import CountryTicker from './components/CountryTicker'

const GlobeSection = dynamic(() => import('./components/WatchGlobeScroll'), { ssr: false })
const GetInformed = dynamic(() => import('./components/GetInformed'), { ssr: false })

const VIMEO_VIDEO_ID = '1177797002'
const VIMEO_HASH = '09abb31a4f'
const LOOP_START = 83   // 1:23
const LOOP_END = 139    // 2:19

function WhatWeCanDoItem({ icon, title, details }: { icon: React.ReactNode; title: string; details: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border border-white/20 rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-white/40"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-4 px-6 py-5">
        {icon}
        <h3 className="font-serif uppercase text-lg sm:text-xl text-white flex-1">{title}</h3>
        <svg
          className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ maxHeight: open ? '500px' : '0', opacity: open ? 1 : 0 }}
      >
        <ul className="px-6 pb-5 pl-18 space-y-2 list-disc list-outside ml-4">
          {details.map((d, i) => (
            <li key={i} className="text-white/70 text-sm sm:text-base leading-relaxed">{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Pick background video quality — default 360p, upgrade based on connection speed */
function getBgQuality(): string {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as unknown as { connection: { effectiveType?: string; downlink?: number } }).connection
    if (conn.effectiveType === '4g' && typeof conn.downlink === 'number') {
      if (conn.downlink >= 10) return '720p'
      if (conn.downlink >= 5) return '540p'
    }
  }
  return '360p'
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
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showSignupPopup, setShowSignupPopup] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false)
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
    if (saved && isValidLang(saved)) {
      setLang(saved)
    } else {
      // Auto-detect language from browser settings
      const browserLangs = navigator.languages || [navigator.language]
      for (const bl of browserLangs) {
        const code = bl.split('-')[0].toLowerCase()
        if (isValidLang(code)) {
          setLang(code as Lang)
          break
        }
      }
    }
    setBgQuality(getBgQuality())
    setIsSignedUp(!!localStorage.getItem('thm-signed-up'))
    const handler = () => setIsSignedUp(!!localStorage.getItem('thm-signed-up'))
    window.addEventListener('thm-signed-up', handler)
    setMounted(true)
    return () => window.removeEventListener('thm-signed-up', handler)
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
          if (seconds >= LOOP_END - 0.5 || seconds < LOOP_START) {
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
    track('video_play')
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
    track('language_changed', { language: code })
  }

  return (
    <>
      {/* Vimeo Hero */}
      <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-black">
        {!isFullscreen && (
          <div className="absolute top-0 right-0 z-50 flex items-center gap-3 p-4">
            {isSignedUp && (
              <a href="/share" className="bg-sunrise text-black text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-sunrise/90 transition-all whitespace-nowrap">
                Take Action
              </a>
            )}
            <LanguageSelector lang={lang} mounted={mounted} onSelect={selectLang} inline />
          </div>
        )}
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
              <p
                className="font-serif uppercase text-lg sm:text-xl text-white/80 [text-shadow:_0_1px_10px_rgba(0,0,0,0.6)] cursor-default select-none"
                onDoubleClick={() => {
                  localStorage.removeItem('thm-signed-up')
                  localStorage.removeItem('thm-name')
                  localStorage.removeItem('thm-country')
                  localStorage.removeItem('thm-zip')
                  localStorage.removeItem('thm-signup-id')
                  setIsSignedUp(false)
                  window.dispatchEvent(new Event('thm-signed-up'))
                  window.location.reload()
                }}
              >
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
              <button
                onClick={(e) => { e.stopPropagation(); setShowSignupPopup(true) }}
                className="mt-6 bg-sunrise text-black rounded-full px-8 py-3 text-sm font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 hover:scale-[1.02]"
              >
                Join Now
              </button>
            </div>
          </>
        )}
      </section>

      <div className="text-center px-6 pt-16 pb-0 bg-[#111]">
        <p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">{t(lang, 'itsPrefix')} <span className="text-sunrise">{t(lang, 'allHands')}</span> {t(lang, 'onDeck')}</p>
        <div className="max-w-2xl mx-auto mt-8 space-y-4 font-body text-base sm:text-lg text-white/80 leading-relaxed">
          <p>{t(lang, 'heroLine1')}</p>
          <p>{t(lang, 'heroLine2')}</p>
          <p dangerouslySetInnerHTML={{ __html: t(lang, 'heroLine3') }} />
        </div>
      </div>
      <SignupForm ref={formRef} lang={lang} variant="after-globe" overrideHeading={<></>} overridePlaceholder={t(lang, 'enterMyEmail')} overrideButton={t(lang, 'getInfoNow')} className="!pt-8 sm:!pt-10" />
      {/* <CountryTicker /> */}
      {/* What We Can Do Section */}
      <section className="relative z-10 py-20 px-6">
        <h2 className="font-serif uppercase text-4xl sm:text-5xl text-white text-center mb-12">{t(lang, 'whatWeCanDo')}</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              icon: (
                <svg className="w-8 h-8 text-sunrise flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              ),
              title: t(lang, 'endAIArmsRace'),
              details: [
                t(lang, 'endAIArmsRaceDetail1'),
                t(lang, 'endAIArmsRaceDetail2'),
              ],
            },
            {
              icon: (
                <svg className="w-8 h-8 text-sunrise flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              ),
              title: t(lang, 'stopAIEconomically'),
              details: [
                t(lang, 'stopAIEconomicallyDetail1'),
                t(lang, 'stopAIEconomicallyDetail2'),
              ],
            },
            {
              icon: (
                <svg className="w-8 h-8 text-sunrise flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              ),
              title: t(lang, 'stopAISocially'),
              details: [
                t(lang, 'stopAISociallyDetail1'),
                t(lang, 'stopAISociallyDetail2'),
                t(lang, 'stopAISociallyDetail3'),
              ],
            },
            {
              icon: (
                <svg className="w-8 h-8 text-sunrise flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </svg>
              ),
              title: t(lang, 'stopAIPolitically'),
              details: [
                t(lang, 'stopAIPoliticallyDetail1'),
              ],
            },
          ].map((item, i) => (
            <WhatWeCanDoItem key={i} icon={item.icon} title={item.title} details={item.details} />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setShowRoadmap(true)}
            className="font-body text-sm sm:text-base text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-6 py-3 transition-all"
          >
{t(lang, 'seeAIRoadmap')}
          </button>
          <a
            href="https://humanstatement.org/?utm_source=human.mov"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm sm:text-base text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-6 py-3 transition-all text-center"
          >
            See the Pro-Human AI Declaration →
          </a>
        </div>
      </section>


      {/* AI Roadmap iframe overlay */}
      {showRoadmap && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setShowRoadmap(false)}
        >
          <button
            onClick={() => setShowRoadmap(false)}
            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 transition-all"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-[95vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <iframe
              src="https://www.humanetech.com/ai-roadmap"
              title="AI Roadmap — Center for Humane Technology"
              className="w-full h-full rounded-xl bg-white"
            />
          </div>
        </div>
      )}

      {/* Signup popup overlay */}
      {showSignupPopup && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setShowSignupPopup(false)}
        >
          <button
            onClick={() => setShowSignupPopup(false)}
            className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 transition-all"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <SignupForm lang={lang} variant="hero-popup" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug text-center">{t(lang, 'joinTheHuman')} <span className="text-sunrise">{t(lang, 'humanMovement')}</span></p>} overridePlaceholder={t(lang, 'enterMyEmail')} overrideButton={t(lang, 'getInfoNow')} />
          </div>
        </div>
      )}

      <GlobeSection lang={lang} />

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

      <SignupForm lang={lang} variant="i-agree" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">{t(lang, 'antiHumanFuture')} <span className="text-sunrise">{t(lang, 'notInevitable')}</span></p>} overridePlaceholder={t(lang, 'addEmailToAgree')} overrideButton="I Agree" />

      <GetInformed lang={lang} />

      <SignupForm lang={lang} variant="after-videos" overrideHeading={<p className="font-serif uppercase text-3xl sm:text-4xl text-white leading-snug">{t(lang, 'joinTheHuman')} <span className="text-sunrise">{t(lang, 'humanMovement')}</span></p>} overridePlaceholder={t(lang, 'enterMyEmail')} overrideButton={t(lang, 'getInfoNow')} />

      <ContactSection lang={lang} overrideHeading={
        <h2 className="font-serif uppercase text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
          {t(lang, 'contactOverrideTitle1')}{' '}
          <span className="text-sunrise">{t(lang, 'contactOverrideTitle2')}</span>
        </h2>
      } hideDesc emailPlaceholder={t(lang, 'myEmail')} messagePlaceholder={t(lang, 'myIdeaMessage')} />

    </>
  )
}
