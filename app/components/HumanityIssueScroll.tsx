'use client'

import { useRef } from 'react'
import { t, type Lang } from '@/lib/i18n'
import { useScrollProgress } from '@/app/hooks/useScrollProgress'

const LINES = ['unityLine1', 'unityLine2', 'unityLine3', 'unityLine4'] as const

export default function HumanityIssueScroll({ lang }: { lang: Lang }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(sectionRef)

  const totalLines = LINES.length
  const fadeZone = 0.7
  const growZone = 0.3
  const fadeSegment = fadeZone / totalLines

  return (
    <section ref={sectionRef} className="relative bg-[#111]" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-6 px-6">
          {LINES.map((line, i) => {
            const fadeStart = i * fadeSegment
            const fadeEnd = fadeStart + fadeSegment * 0.6
            const isLast = i === totalLines - 1

            let opacity = 0
            if (progress >= fadeEnd) {
              opacity = 1
            } else if (progress >= fadeStart) {
              opacity = (progress - fadeStart) / (fadeEnd - fadeStart)
            }

            let scale = 1
            let fontWeight = 400
            let color = 'rgba(255,255,255,0.85)'
            if (isLast) {
              color = undefined as unknown as string
              const growProgress = Math.max(0, (progress - fadeZone) / growZone)
              scale = 1 + growProgress * 0.35
              fontWeight = Math.round(400 + growProgress * 500)
            }

            return (
              <p
                key={line}
                className={`font-serif italic text-xl sm:text-2xl leading-relaxed transition-none ${
                  isLast ? 'text-earth-light' : 'text-white/85'
                }`}
                style={{
                  opacity,
                  transform: `scale(${isLast ? scale : 1})`,
                  fontWeight: isLast ? fontWeight : 400,
                  ...(isLast ? {} : { color }),
                }}
              >
                {t(lang, line)}
              </p>
            )
          })}
        </div>
      </div>
    </section>
  )
}
