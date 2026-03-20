'use client'

import { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const OutlineGlobe = dynamic(() => import('./OutlineGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] sm:h-[600px] lg:h-[700px] max-w-[900px] mx-auto flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-white/[0.03] animate-pulse" />
    </div>
  ),
})

export default function GlobeSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

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

  return (
    <section ref={sectionRef} className="relative bg-[#111] overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-sunrise/20 to-transparent" />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-10 sm:pb-16">
        <div className={`text-center mb-2 sm:mb-4 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            The Human Movement is
            <br />
            <span className="text-sunrise">already happening.</span>
          </h2>
          <div className="font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto space-y-4 text-center">
            <p>From phone-free schools...</p>
            <p>To countries banning social media for kids under 16<br />in Australia, India, and France...</p>
            <p>To people boycotting AI companies that enable mass surveillance...</p>
            <p className="text-white font-bold">Humanity is pushing back against the anti-human machine.</p>
          </div>
        </div>
      </div>
      <OutlineGlobe startTourOnVisible={visible} />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28" />
    </section>
  )
}
