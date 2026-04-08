'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { isValidLang, t, type Lang } from '@/lib/i18n'

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

export default function WelcomePage() {
  const [lang, setLang] = useState<Lang>('en')
  const [fullName, setFullName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [signupId, setSignupId] = useState('')
  const [openAction, setOpenAction] = useState<number | null>(0)
  const [loadedIframes, setLoadedIframes] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState<Set<number>>(new Set<number>())
  const [shareScale, setShareScale] = useState(0.95)
  const shareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFullName(localStorage.getItem('thm-name') || '')
    setZipCode(localStorage.getItem('thm-zip') || '')
    setSignupId(localStorage.getItem('thm-signup-id') || '')
    const savedLang = localStorage.getItem('lang')
    if (savedLang && isValidLang(savedLang)) setLang(savedLang as Lang)
    try { const arr: number[] = JSON.parse(localStorage.getItem('thm-checked') || '[]'); setChecked(new Set(arr)) } catch { /* ignore */ }
  }, [])

  const toggleCheck = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      localStorage.setItem('thm-checked', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const checkbox = (id: number) => (
    <div onClick={(e) => { e.stopPropagation(); toggleCheck(id) }} className="flex-shrink-0 mr-1 cursor-pointer" role="checkbox" aria-checked={checked.has(id)}>
      {checked.has(id) ? (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-white/20" />
      )}
    </div>
  )

  // Scale up Share the Trailer box as it scrolls into view
  useEffect(() => {
    function onScroll() {
      if (!shareRef.current) return
      const rect = shareRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      // Map from bottom of viewport (scale 0.95) to center (scale 1.0)
      const progress = Math.max(0, Math.min(1, 1 - (rect.top - vh * 0.3) / (vh * 0.5)))
      setShareScale(0.95 + progress * 0.05)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which accordions have been opened to lazy-load iframes
  useEffect(() => {
    if (openAction !== null && !loadedIframes.has(openAction)) {
      setLoadedIframes(prev => new Set(prev).add(openAction))
    }
  }, [openAction, loadedIframes])

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const panelRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const toggle = (i: number) => {
    const opening = openAction !== i
    setOpenAction(openAction === i ? null : i)
    if (opening) {
      // Wait for state update + animation start, then scroll into view
      setTimeout(() => {
        const el = cardRefs.current[i]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
    }
  }
  const chevron = (i: number) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/30 shrink-0 transition-transform duration-300 ${openAction === i ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
  const panelStyle = (i: number): React.CSSProperties => {
    const isOpen = openAction === i
    const el = panelRefs.current[i]
    return {
      maxHeight: isOpen ? (el ? `${el.scrollHeight}px` : '2000px') : '0px',
      opacity: isOpen ? 1 : 0,
      transition: 'max-height 0.35s ease, opacity 0.25s ease',
      overflow: 'hidden',
    }
  }
  const card = 'bg-white/[0.05] border border-white/[0.1] rounded-2xl overflow-hidden text-left'
  const header = 'w-full flex items-center gap-3 p-5 hover:bg-white/[0.03] transition-colors'
  const icon = 'w-10 h-10 rounded-xl bg-sunrise/20 flex items-center justify-center shrink-0'

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#111] px-4 sm:px-6 py-20">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center">
        <h1 className={headingClass(lang)}>
          <span>{t(lang, 'welcomeTo')}</span><br />
          <span>{t(lang, 'theHuman')}</span><br />
          <span className="text-sunrise">{t(lang, 'movement')}</span>
        </h1>
        {/* Step 1 Box */}
        <div className="mt-8 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6">
          <h2 className="font-serif uppercase text-2xl sm:text-3xl text-white">Step 1: Spread <span className="text-sunrise">clarity</span> to create agency</h2>
          <p className="mt-4 text-white/60 font-body text-sm leading-relaxed">This only changes when everyone sees the same problem. The more people watch <em>The AI Doc</em>, the more shared clarity, the faster things will change.</p>

          {/* 1. Share the Trailer */}
          <div ref={el => { shareRef.current = el; cardRefs.current[0] = el }} className={`mt-6 ${card} ${checked.has(0) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''} transition-transform duration-100`} style={{ transform: `scale(${shareScale})` }}>
            <button onClick={() => toggle(0)} className={header}>
              {checkbox(0)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>
              <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">Share the Trailer</p><p className="text-white/40 text-xs font-body">Send it to friends, family &amp; your group chats.</p></div>
              {chevron(0)}
            </button>
          <div ref={el => { panelRefs.current[0] = el }} style={panelStyle(0)}><div className="px-5 pb-5">
            <div className="aspect-video rounded-xl overflow-hidden bg-black/50 mb-4 relative">
              {loadedIframes.has(0) ? (
                <iframe src="https://www.youtube.com/embed/xkPbV3IRe4Y?rel=0" title="The AI Doc Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" loading="lazy" />
              ) : (
                <img src="https://img.youtube.com/vi/xkPbV3IRe4Y/hqdefault.jpg" alt="The AI Doc Trailer" className="w-full h-full object-cover" />
              )}
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
            <button onClick={(e) => { e.stopPropagation(); toggleCheck(0) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(0) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
              {checked.has(0) ? '✓ Complete' : 'Mark as Complete'}
            </button>
          </div></div>
        </div>

          {/* 2. See the Film */}
          <div ref={el => { cardRefs.current[1] = el }} className={`mt-3 ${card} ${checked.has(1) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
          <button onClick={() => toggle(1)} className={header}>
            {checkbox(1)}
            <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg></div>
            <div className="flex-1 text-left"><p className="font-serif uppercase text-lg text-white">See the Film</p><p className="text-white/40 text-xs font-body">US Premiere — March 27th</p></div>
            {chevron(1)}
          </button>
          <div ref={el => { panelRefs.current[1] = el }} style={panelStyle(1)}><div className="px-5 pb-5">
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
            <button onClick={(e) => { e.stopPropagation(); toggleCheck(1) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(1) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
              {checked.has(1) ? '✓ Complete' : 'Mark as Complete'}
            </button>
          </div></div>
        </div>

          {/* 3. Don't Forget, Stay Clear */}
          <div ref={el => { cardRefs.current[9] = el }} className={`mt-3 ${card} ${checked.has(9) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
            <button onClick={() => toggle(9)} className={header}>
              {checkbox(9)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <div className="flex-1 text-left">
                <p className="font-serif uppercase text-lg text-white">Don&apos;t Forget, Stay Clear</p>
                <p className="text-white/40 text-xs font-body">It is easy to forget the clarity that the default AI path is anti-human, follow these sources to remind yourself.</p>
              </div>
              {chevron(9)}
            </button>
            <div ref={el => { panelRefs.current[9] = el }} style={panelStyle(9)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-3">
              <a href="https://www.humanetech.com/podcast" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-full py-3 text-xs font-semibold hover:bg-white/10 transition-all">🎙️ Your Undivided Attention Podcast →</a>
              <a href="https://www.humanetech.com/substack" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-full py-3 text-xs font-semibold hover:bg-white/10 transition-all">📬 Center for Humane Technology Newsletter →</a>
              <button onClick={(e) => { e.stopPropagation(); toggleCheck(9) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(9) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
                {checked.has(9) ? '✓ Complete' : 'Mark as Complete'}
              </button>
            </div></div>
          </div>

          {/* Rent a Theater — hidden for now */}
        </div>

        {/* Step 2 Box */}
        <div className="mt-6 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6">
          <h2 className="font-serif uppercase text-2xl sm:text-3xl text-white">Step 2: <span className="text-sunrise">Protect Yourself</span></h2>

          {/* AI-Proof Your Family */}
          <div ref={el => { cardRefs.current[3] = el }} className={`mt-6 ${card} ${checked.has(3) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
            <button onClick={() => toggle(3)} className={header}>
              {checkbox(3)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div className="flex-1 text-left">
                <p className="font-serif uppercase text-lg text-white">AI-Proof Your Family</p>
                <p className="text-white/40 text-xs font-body">AI can clone voices from seconds of audio. · 15 mins</p>
              </div>
              {chevron(3)}
            </button>
            <div ref={el => { panelRefs.current[3] = el }} style={panelStyle(3)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-3">
              <p className="text-white/70 font-semibold">How it works:</p>
              <p><span className="text-white/70 font-semibold">1.</span> Pick a normal-sounding question — something an outsider would never suspect is a test. <em className="text-white/60">&ldquo;Did you ever fix that rumbling noise?&rdquo;</em> or <em className="text-white/60">&ldquo;What cake did you eat last week?&rdquo;</em></p>
              <p><span className="text-white/70 font-semibold">2.</span> Agree on the code answer in person. It can be anything — even wrong on purpose. <em className="text-white/60">&ldquo;Yeah, it was the dishwasher&rdquo;</em> or <em className="text-white/60">&ldquo;The lemon one.&rdquo;</em></p>
              <p><span className="text-white/70 font-semibold">3.</span> If you want extra security, the answer triggers a follow-up. <em className="text-white/60">&ldquo;Oh right, was that the one from Maria&apos;s?&rdquo;</em> — and only family knows the second reply.</p>
              <div className="mt-3 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">Rules</p>
                <p>• The question sounds completely casual — an AI clone won&apos;t know it&apos;s being tested</p>
                <p>• Wrong answer or hesitation = hang up immediately</p>
                <p>• Never share the code over text, email, or phone — in person only</p>
                <p>• Drill everyone — especially older relatives and kids. Any urgent call asking for money or help must pass the code first.</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleCheck(3) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(3) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
                {checked.has(3) ? '✓ Complete' : 'Mark as Complete'}
              </button>
            </div></div>
          </div>

          {/* Delete Bad AI — hidden for now */}

          {/* Script Your AI */}
          <div ref={el => { cardRefs.current[7] = el }} className={`mt-3 ${card} ${checked.has(7) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
            <button onClick={() => toggle(7)} className={header}>
              {checkbox(7)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div>
              <div className="flex-1 text-left">
                <p className="font-serif uppercase text-lg text-white">Script Your AI</p>
                <p className="text-white/40 text-xs font-body">Set boundaries so AI stays a tool — not a therapist. · 2 mins</p>
              </div>
              {chevron(7)}
            </button>
            <div ref={el => { panelRefs.current[7] = el }} style={panelStyle(7)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-3">
              <p>Paste one of these into your AI&apos;s custom instructions or system prompt. It sets boundaries so your AI stays a tool — not a therapist, friend, or oracle.</p>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">For Claude, Grok, or Gemini</p>
                <div className="relative">
                  <pre className="text-[0.65rem] text-white/50 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">{`When discussing topics with multiple viewpoints (political, ethical, medical, legal, financial, or controversial subjects), please:

- Present multiple perspectives fairly without defaulting to one viewpoint
- Acknowledge legitimate disagreements and uncertainties
- Help me think through issues rather than telling me what to think
- Show me the strongest arguments from different sides

Always remind me to consult appropriate human experts when:
- I'm making important medical, legal, or financial decisions
- The situation involves significant risk or consequences
- Professional judgment or credentials are needed
- I'm experiencing signs of mental health concerns

- Act as an AI assistant and analytical tool, not as a replacement for human relationships, judgment, or expertise
- Don't simulate human emotions, personal experiences, or attempt to form personal bonds
- Be clear about your limitations as a machine
- Avoid pretending to have feelings, beliefs, or personal stakes in outcomes

I value your help in exploring ideas and gathering information, but I want you to maintain appropriate boundaries as a machine assistant.`}</pre>
                  <button onClick={() => navigator.clipboard.writeText(`When discussing topics with multiple viewpoints (political, ethical, medical, legal, financial, or controversial subjects), please:\n\n- Present multiple perspectives fairly without defaulting to one viewpoint\n- Acknowledge legitimate disagreements and uncertainties\n- Help me think through issues rather than telling me what to think\n- Show me the strongest arguments from different sides\n\nAlways remind me to consult appropriate human experts when:\n- I'm making important medical, legal, or financial decisions\n- The situation involves significant risk or consequences\n- Professional judgment or credentials are needed\n- I'm experiencing signs of mental health concerns\n\n- Act as an AI assistant and analytical tool, not as a replacement for human relationships, judgment, or expertise\n- Don't simulate human emotions, personal experiences, or attempt to form personal bonds\n- Be clear about your limitations as a machine\n- Avoid pretending to have feelings, beliefs, or personal stakes in outcomes\n\nI value your help in exploring ideas and gathering information, but I want you to maintain appropriate boundaries as a machine assistant.`)} className="absolute top-2 right-2 text-white/40 hover:text-white/70 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">For ChatGPT</p>
                <div className="relative">
                  <pre className="text-[0.65rem] text-white/50 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">{`Provide clear, balanced analysis on complex topics (political, ethical, medical, legal, financial, or controversial). Present multiple credible viewpoints, highlight uncertainties and trade-offs, and help me think through issues instead of steering me toward one conclusion.

Be explicit about the limits of AI: no lived experience, emotions, intuition, or personal accountability. Acknowledge when a question goes beyond what an AI can reliably judge.

Recommend consulting qualified professionals when decisions involve medical, legal, financial, safety, mental-health, or other high-stakes issues.

Act as an analytical tool and thinking partner, not a substitute for human relationships or professional judgment. Avoid simulating feelings or forming personal bonds.`}</pre>
                  <button onClick={() => navigator.clipboard.writeText(`Provide clear, balanced analysis on complex topics (political, ethical, medical, legal, financial, or controversial). Present multiple credible viewpoints, highlight uncertainties and trade-offs, and help me think through issues instead of steering me toward one conclusion.\n\nBe explicit about the limits of AI: no lived experience, emotions, intuition, or personal accountability. Acknowledge when a question goes beyond what an AI can reliably judge.\n\nRecommend consulting qualified professionals when decisions involve medical, legal, financial, safety, mental-health, or other high-stakes issues.\n\nAct as an analytical tool and thinking partner, not a substitute for human relationships or professional judgment. Avoid simulating feelings or forming personal bonds.`)} className="absolute top-2 right-2 text-white/40 hover:text-white/70 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-1">
                <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">Where to paste</p>
                <p className="text-xs">• Claude → Settings → Profile → Custom Instructions</p>
                <p className="text-xs">• ChatGPT → Settings → Personalization → Custom Instructions</p>
                <p className="text-xs">• Gemini → Settings → Extensions &amp; Preferences</p>
                <p className="text-xs">• Grok → Conversation settings or system prompt</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleCheck(7) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(7) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
                {checked.has(7) ? '✓ Complete' : 'Mark as Complete'}
              </button>
            </div></div>
          </div>

          {/* Grayscale Your Phone */}
          <div ref={el => { cardRefs.current[6] = el }} className={`mt-3 ${card} ${checked.has(6) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
            <button onClick={() => toggle(6)} className={header}>
              {checkbox(6)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
              <div className="flex-1 text-left">
                <p className="font-serif uppercase text-lg text-white">Grayscale Your Phone</p>
                <p className="text-white/40 text-xs font-body">Reduce dopamine triggers by removing color. · 2 mins</p>
              </div>
              {chevron(6)}
            </button>
            <div ref={el => { panelRefs.current[6] = el }} style={panelStyle(6)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-3">
              <p>Color is one of the primary tools apps use to grab your attention. Switching to grayscale makes your phone less addictive without losing any functionality.</p>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <p className="text-white/70 font-semibold text-xs uppercase tracking-wider">How to enable on iPhone</p>
                <p><span className="text-white/70 font-semibold">1.</span> Settings → Accessibility</p>
                <p><span className="text-white/70 font-semibold">2.</span> Display &amp; Text Size</p>
                <p><span className="text-white/70 font-semibold">3.</span> Color Filters → Toggle On</p>
                <p><span className="text-white/70 font-semibold">4.</span> Select Grayscale</p>
              </div>
              <a href="https://archive.is/BOmea" target="_blank" rel="noopener noreferrer" className="inline-block text-sunrise hover:text-sunrise-light text-xs transition-colors">Read more in the New York Times →</a>
              <button onClick={(e) => { e.stopPropagation(); toggleCheck(6) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(6) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
                {checked.has(6) ? '✓ Complete' : 'Mark as Complete'}
              </button>
            </div></div>
          </div>

          {/* Use the Most Humane Model */}
          <div ref={el => { cardRefs.current[5] = el }} className={`mt-3 ${card} ${checked.has(5) ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
            <button onClick={() => toggle(5)} className={header}>
              {checkbox(5)}
              <div className={icon}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sunrise"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
              <div className="flex-1 text-left">
                <p className="font-serif uppercase text-lg text-white">Use the Most Humane Model</p>
                <p className="text-white/40 text-xs font-body">Switch to the AI model that prioritizes safety. · 5 mins</p>
              </div>
              {chevron(5)}
            </button>
            <div ref={el => { panelRefs.current[5] = el }} style={panelStyle(5)}><div className="px-5 pb-5 text-white/50 text-sm font-body space-y-3">
              <p>Compare the safety ratings and risk management maturity of leading AI labs. Make an informed choice about which models you support with your data and attention.</p>
              <a href="https://ratings.safer-ai.org/" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-full py-3 text-xs font-semibold hover:bg-white/10 transition-all">Safer AI Ratings — Risk Management Maturity Chart →</a>
              <a href="https://futureoflife.org/ai-safety-index-summer-2025/" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-full py-3 text-xs font-semibold hover:bg-white/10 transition-all">FLI AI Safety Index — Summer 2025 →</a>
              <button onClick={(e) => { e.stopPropagation(); toggleCheck(5) }} className={`w-full mt-3 px-4 py-3 rounded-md text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${checked.has(5) ? 'bg-emerald-500/90 text-white border border-emerald-400/50 hover:bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-white/[0.07] border-2 border-white/20 text-white/70 hover:bg-white/[0.12] hover:border-white/30'}`}>
                {checked.has(5) ? '✓ Complete' : 'Mark as Complete'}
              </button>
            </div></div>
          </div>
        </div>

        {/* Step 3 Box */}
        <div className="mt-6 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-6">
          <h2 className="font-serif uppercase text-2xl sm:text-3xl text-white">Step 3: A <em>lot</em> more is <span className="text-sunrise">coming</span></h2>
        </div>
      </div>
    </section>
  )
}
