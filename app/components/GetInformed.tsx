'use client'

import { useState, useRef, useEffect } from 'react'

const VIDEOS = [
  {
    id: 'xkPbV3IRe4Y',
    title: 'The AI Doc: Or How I Became an Apocaloptimist',
    subtitle: 'Official Trailer — Focus Features',
  },
  {
    id: 'bhYw-VlkXTU',
    title: 'The A.I. Dilemma',
    subtitle: 'Tristan Harris & Aza Raskin — Center for Humane Technology',
  },
  {
    id: 'xoVJKj8lcNQ',
    title: 'AI Expert: We Have 2 Years Before Everything Changes!',
    subtitle: 'Tristan Harris — The Diary of a CEO',
  },
  {
    id: 'UclrVWafRAI',
    title: 'These Are The Only 5 Jobs That Will Remain In 2030',
    subtitle: 'Dr. Roman Yampolskiy — The Diary of a CEO',
  },
  {
    id: 'KFqmYsCmUZE',
    title: 'Your Undivided Attention — Latest Episode',
    subtitle: 'Center for Humane Technology Podcast',
  },
]

export default function GetInformed() {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateScrollButtons() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    updateScrollButtons()
    return () => el.removeEventListener('scroll', updateScrollButtons)
  }, [])

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 320 + 16
    el.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
  }

  return (
    <section className="bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="font-serif italic text-4xl sm:text-5xl text-white mb-3 leading-tight text-center">
          Get <span className="text-earth-light">Informed.</span>
        </h2>
        <p className="font-body text-base sm:text-lg text-white/40 max-w-2xl mx-auto text-center mb-12">
          Understand what&apos;s at stake and why this movement matters.
        </p>
      </div>

      {/* Featured video player */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-10">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
          <iframe
            key={VIDEOS[active].id}
            src={`https://www.youtube.com/embed/${VIDEOS[active].id}?rel=0`}
            title={VIDEOS[active].title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="font-serif italic text-xl sm:text-2xl text-white">
            {VIDEOS[active].title}
          </p>
          <p className="font-body text-sm text-white/40 mt-1">
            {VIDEOS[active].subtitle}
          </p>
        </div>
      </div>

      {/* Thumbnail carousel */}
      <div className="relative max-w-6xl mx-auto">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white/40 hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white/40 hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-5 sm:px-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {VIDEOS.map((video, i) => (
            <button
              key={video.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-[280px] sm:w-[320px] rounded-xl overflow-hidden border transition-all duration-300 text-left ${
                i === active
                  ? 'border-earth/50 ring-1 ring-earth/30 scale-[1.02]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="relative aspect-video bg-black/40">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {i === active && (
                  <div className="absolute inset-0 bg-earth/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-earth/80 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white/[0.03]">
                <p className={`font-body text-sm font-semibold leading-snug line-clamp-2 ${
                  i === active ? 'text-earth-light' : 'text-white/80'
                }`}>
                  {video.title}
                </p>
                <p className="font-body text-xs text-white/30 mt-1 truncate">
                  {video.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
