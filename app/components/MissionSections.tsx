'use client'

import { useState, useEffect } from 'react'
import { t, type Lang } from '@/lib/i18n'

const PRESS_LOGOS = [
  { src: '/images/press/logos/washington-post.png', alt: 'The Washington Post' },
  { src: '/images/press/logos/60-minutes.png', alt: '60 Minutes' },
  { src: '/images/press/logos/mashable.png', alt: 'Mashable' },
  { src: '/images/press/logos/economist.png', alt: 'The Economist' },
  { src: '/images/press/logos/fox-news.png', alt: 'Fox News' },
  { src: '/images/press/logos/nyt.png', alt: 'The New York Times' },
  { src: '/images/press/logos/nbc-news.png', alt: 'NBC News Now' },
  { src: '/images/press/logos/axios.png', alt: 'Axios' },
  { src: '/images/press/logos/bloomberg.png', alt: 'Bloomberg' },
  { src: '/images/press/logos/politico.png', alt: 'Politico' },
  { src: '/images/press/logos/cnet.png', alt: 'CNET' },
  { src: '/images/press/logos/business-insider.png', alt: 'Business Insider' },
  { src: '/images/press/logos/wired.png', alt: 'Wired' },
]

export default function MissionSections({ lang }: { lang: Lang }) {
  const [signupCount, setSignupCount] = useState(847293)

  useEffect(() => {
    fetch('/api/signup-count')
      .then(r => r.json())
      .then(d => { if (d.count > 0) setSignupCount(d.count) })
      .catch(() => {})

    const interval = setInterval(() => {
      fetch('/api/signup-count')
        .then(r => r.json())
        .then(d => { if (d.count > 0) setSignupCount(d.count) })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mission */}
      <section className="min-h-screen flex items-center justify-center px-6 py-32 sm:py-44 bg-[#0a0e1c]">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-12 sm:space-y-16 mb-16 sm:mb-20">
            <p className="font-serif italic text-white text-2xl sm:text-4xl lg:text-5xl leading-snug sm:leading-tight tracking-tight text-center font-bold">
              {t(lang, 'missionLine1')}
            </p>
            <p className="font-serif italic text-white/70 text-2xl sm:text-4xl lg:text-5xl leading-snug sm:leading-tight tracking-tight text-center font-semibold">
              {t(lang, 'missionLine2')}
            </p>
            <p className="font-serif italic text-[#D4A84B] text-3xl sm:text-5xl lg:text-6xl leading-snug sm:leading-tight tracking-tight text-center font-black">
              {t(lang, 'missionLine3')}
            </p>
          </div>
          <p className="text-center text-[#D4A84B]/50 font-body text-xs sm:text-sm tracking-wide font-semibold">
            {t(lang, 'joinCount').replace('{count}', signupCount.toLocaleString())}
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="px-6 py-32 sm:py-44 bg-[#0a0e1c]">
        <div className="max-w-3xl mx-auto">
          <blockquote>
            <p className="font-serif italic text-white text-2xl sm:text-4xl lg:text-5xl leading-snug sm:leading-tight tracking-tight text-center font-bold">
              {t(lang, 'quoteTristan')}
            </p>
            <footer className="mt-6 text-center text-[#D4A84B]/70 font-body text-sm sm:text-base tracking-wide font-semibold">
              {t(lang, 'quoteAttrib')}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Manifesto */}
      <section className="px-6 py-32 sm:py-44 bg-[#0a0e1c]">
        <div className="max-w-4xl mx-auto space-y-32 sm:space-y-44">
          <p className="font-serif italic text-white text-3xl sm:text-5xl lg:text-6xl leading-snug sm:leading-tight tracking-tight text-center font-bold">
            {t(lang, 'manifestoLine1')}
          </p>
          <p className="font-serif italic text-white/60 text-2xl sm:text-4xl lg:text-5xl leading-snug sm:leading-tight tracking-tight text-center font-semibold">
            {t(lang, 'manifestoLine2')}
          </p>
          <p className="font-serif italic text-[#D4A84B] text-3xl sm:text-5xl lg:text-6xl leading-snug sm:leading-tight tracking-tight text-center font-black">
            {t(lang, 'manifestoLine3')}
          </p>
        </div>
      </section>

      {/* Partners */}
      <section className="px-6 py-24 sm:py-32 bg-white">
        <p className="text-center text-sm font-body font-semibold tracking-widest uppercase text-black/50 mb-16">
          {t(lang, 'partnersTitle')}
        </p>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-12 sm:gap-16 lg:gap-20 mb-10 sm:mb-14">
            {[
              { src: '/images/partners/CHT_logo.svg', alt: 'Center for Humane Technology', h: 'h-16 sm:h-20' },
              { src: '/images/partners/FLI_logo.webp', alt: 'Future of Life Institute', h: 'h-20 sm:h-24' },
            ].map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} loading="lazy" className={`${logo.h} w-auto`} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-12 sm:gap-16 lg:gap-20">
            {[
              { src: '/images/partners/APHRC_logo.svg', alt: 'APHRC', h: 'h-16 sm:h-20' },
              { src: '/images/partners/humanchange_logo.svg', alt: 'Human Change', h: 'h-14 sm:h-18' },
            ].map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} loading="lazy" className={`${logo.h} w-auto`} />
            ))}
          </div>
        </div>
      </section>

      {/* Press Carousel */}
      <section className="py-12 sm:py-16 overflow-hidden bg-white">
        <div
          className="flex items-center w-max"
          style={{ animation: 'pressCarousel 150s linear infinite', willChange: 'transform', backfaceVisibility: 'hidden' }}
        >
          {[0, 1, 2].map((set) => (
            <div key={set} className="flex items-center shrink-0">
              {PRESS_LOGOS.map((logo) => (
                <img
                  key={`${set}-${logo.alt}`}
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="h-6 sm:h-8 w-auto mx-8 sm:mx-12 opacity-40"
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
