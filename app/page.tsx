'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { isValidLang, LANGUAGES, type Lang } from '@/lib/i18n'
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
      <GlobeSection />
      <SignupForm ref={formRef} lang={lang} />

      {/* Transition into Protecting section */}
      <section className="bg-[#111] px-6 py-32 sm:py-44">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            The Human Movement is...
          </h2>
        </div>
      </section>

      <ProtectOurScroll lang={lang} />
      <SignupForm ref={formRef} lang={lang} />
      <GetInformed />
      <SignupForm ref={formRef} lang={lang} />
      <Footer />
    </>
  )
}
