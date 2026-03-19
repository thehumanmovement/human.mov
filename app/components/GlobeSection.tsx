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
    <section ref={sectionRef} className="relative bg-[#080808] overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-earth/20 to-transparent" />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-10 sm:pb-16">
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            A global{' '}
            <span className="text-earth-light">movement.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-white/40 max-w-2xl mx-auto">
            Countries and states highlighted in green have enacted protections for children and citizens in the digital age.
          </p>
        </div>
      </div>
      <OutlineGlobe />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-earth/60" />
            <span className="font-body text-xs sm:text-sm text-white/40">Active regulation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-white/10" />
            <span className="font-body text-xs sm:text-sm text-white/40">No regulation yet</span>
          </div>
        </div>
      </div>
    </section>
  )
}
