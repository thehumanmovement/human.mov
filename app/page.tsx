'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { isValidLang, LANGUAGES, t, type Lang } from '@/lib/i18n'
import LanguageSelector from './components/LanguageSelector'
import VideoHero from './components/VideoHero'
import SignupForm, { type SignupFormHandle } from './components/SignupForm'
import Footer from './components/Footer'

const ProtectOurScroll = dynamic(() => import('./components/ProtectOurScroll'), { ssr: false })
const GlobeSection = dynamic(() => import('./components/GlobeSection'), { ssr: false })
const GetInformed = dynamic(() => import('./components/GetInformed'), { ssr: false })

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)
  const formRef = useRef<SignupFormHandle>(null)

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

  function selectLang(code: Lang) {
    setLang(code)
    localStorage.setItem('lang', code)
  }

  return (
    <>
      <LanguageSelector lang={lang} mounted={mounted} onSelect={selectLang} />
      <VideoHero lang={lang} onJoinClick={() => formRef.current?.scrollToForm()} />
      <SignupForm ref={formRef} lang={lang} variant="after-globe" />
      <GlobeSection lang={lang} />
      {/* <SignupForm ref={formRef} lang={lang} variant="after-globe" /> */}

      {/* Transition into Protecting section */}
      {/* <section className="bg-[#111] px-6 py-32 sm:py-44">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            The Human Movement is...
          </h2>
        </div>
      </section> */}

      {/* <ProtectOurScroll lang={lang} /> */}
      <GetInformed lang={lang} />

      <SignupForm lang={lang} variant="after-protect" />

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

      {/* Press Carousel */}
      <section className="py-6 sm:py-8 overflow-hidden bg-white">
        <div
          className="flex items-center w-max"
          style={{ animation: 'pressCarousel 150s linear infinite', willChange: 'transform', backfaceVisibility: 'hidden' }}
        >
          {[0, 1, 2].map((set) => (
            <div key={set} className="flex items-center shrink-0">
              {[
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
              ].map((logo) => (
                <img
                  key={`${set}-${logo.alt}`}
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="h-10 sm:h-14 w-auto mx-8 sm:mx-12 opacity-40"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <SignupForm lang={lang} variant="final" />

    </>
  )
}
