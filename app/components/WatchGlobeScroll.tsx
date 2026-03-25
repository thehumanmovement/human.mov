'use client'

import { useState, useEffect, useRef } from 'react'
import { WINS, type WinInfo } from '../../lib/wins-data'

interface CardRegion {
  names: { name: string; label: string }[]
}

const REGIONS: CardRegion[] = [
  { names: [{ name: 'United States of America', label: 'United States' }] },
  { names: [{ name: 'Australia', label: 'Australia' }, { name: 'India', label: 'India' }] },
  { names: [{ name: 'China', label: 'China' }] },
]

interface CardWin extends WinInfo {
  regionLabel: string
}

function getCardWins(region: CardRegion): CardWin[] {
  const wins: CardWin[] = []
  for (const r of region.names) {
    for (const w of (WINS[r.name] || [])) {
      wins.push({ ...w, regionLabel: r.label })
    }
  }
  return wins
}

interface Props {
  lang: string
}

export default function WatchGlobeScroll({ lang }: Props) {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeCard, setActiveCard] = useState(-1)
  const [carouselIndices, setCarouselIndices] = useState<number[]>(REGIONS.map(() => 0))
  const [slideDirs, setSlideDirs] = useState<(string | null)[]>(REGIONS.map(() => null))

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Highlight card closest to viewport center on scroll
  useEffect(() => {
    function update() {
      const center = window.innerHeight / 2
      let closest = -1
      let minDist = Infinity
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cardCenter = rect.top + rect.height / 2
        const dist = Math.abs(cardCenter - center)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })
      if (closest !== -1) setActiveCard(closest)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [visible])

  return (
    <section ref={sectionRef} className="relative bg-[#0a0a0a] px-6 py-20 sm:py-28">
      {/* Heading */}
      <div className={`text-center mb-16 sm:mb-20 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
          The Human Movement Is
          <br />
          <span className="text-sunrise">Gaining Speed.</span>
        </h2>
        <p className="font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
          A global force is growing to protect our jobs, our kids and our freedom. To keep humans in control and make it safe for all of us.
        </p>
      </div>

      {/* Stacked news cards */}
      <div className="max-w-lg mx-auto space-y-8">
        {REGIONS.map((region, i) => {
          const wins = getCardWins(region).slice(0, 10)
          if (wins.length === 0) return null

          const curIdx = carouselIndices[i]
          const win = wins[curIdx] || wins[0]
          const slideDir = slideDirs[i]

          const goTo = (idx: number) => {
            setSlideDirs(prev => { const n = [...prev]; n[i] = idx > curIdx ? 'left' : 'right'; return n })
            setCarouselIndices(prev => { const n = [...prev]; n[i] = idx; return n })
          }
          const goPrev = () => { if (curIdx > 0) goTo(curIdx - 1) }
          const goNext = () => { if (curIdx < wins.length - 1) goTo(curIdx + 1) }

          const isHighlighted = activeCard === i

          return (
            <div
              key={region.names[0].name}
              ref={el => { cardRefs.current[i] = el }}
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="newspaper-card rounded-sm p-5 sm:p-6 transition-transform duration-500 ease-out"
                style={{ transform: `scale(${isHighlighted ? 1.04 : 1})` }}
              >
                <div className="dateline flex items-center justify-between">
                  <span className="font-bold text-[#111]">{win.regionLabel}</span>
                  <span>{win.date}</span>
                </div>
                <div className="min-h-[80px] overflow-hidden relative">
                  <div
                    key={`${region.names[0].name}-${curIdx}`}
                    className={slideDir ? 'animate-slide-in' : ''}
                    style={slideDir ? {
                      animationName: slideDir === 'left' ? 'slideFromRight' : 'slideFromLeft',
                    } : undefined}
                  >
                    {win.url ? (
                      <a
                        href={win.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="headline text-lg sm:text-xl block mb-2 hover:text-[#111] transition-colors duration-200 cursor-pointer"
                      >
                        {win.title}
                      </a>
                    ) : (
                      <p className="headline text-lg sm:text-xl mb-2">
                        {win.title}
                      </p>
                    )}
                    <p className="body-text">
                      {win.description}
                    </p>
                  </div>
                </div>
                {wins.length > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d4c9a8]">
                    <button
                      onClick={goPrev}
                      className={`text-[#999] hover:text-[#111] transition-colors p-1.5 -ml-1.5 ${curIdx === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                      aria-label="Previous win"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div className="flex gap-1.5">
                      {wins.map((_, j) => (
                        <button
                          key={j}
                          onClick={() => goTo(j)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            j === curIdx ? 'bg-[#111] w-5' : 'bg-[#ccc] hover:bg-[#999] w-1.5'
                          }`}
                          aria-label={`Win ${j + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={goNext}
                      className={`text-[#999] hover:text-[#111] transition-colors p-1.5 -mr-1.5 ${curIdx === wins.length - 1 ? 'opacity-30 pointer-events-none' : ''}`}
                      aria-label="Next win"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
