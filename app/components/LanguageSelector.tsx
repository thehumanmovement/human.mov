'use client'

import { useState, useEffect, useRef } from 'react'
import { LANGUAGES, type Lang } from '@/lib/i18n'

interface LanguageSelectorProps {
  lang: Lang
  mounted: boolean
  onSelect: (code: Lang) => void
}

export default function LanguageSelector({ lang, mounted, onSelect }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  function handleSelect(code: Lang) {
    onSelect(code)
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="absolute top-6 right-6 z-20">
      <button
        onClick={() => setOpen(!open)}
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
      {open && (
        <div className="absolute right-0 mt-2 py-1 min-w-[140px] rounded-xl bg-black/40 backdrop-blur-md border border-white/15 shadow-xl overflow-hidden">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
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
  )
}
