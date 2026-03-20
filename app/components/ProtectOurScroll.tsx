'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { t, type Lang } from '@/lib/i18n'
import { useScrollProgress } from '@/app/hooks/useScrollProgress'

const PROTECT_IMAGES: Record<string, string | null> = {
  protectJobs: '/images/unemployed.png',
  protectKids: '/images/doomscrolling.webp',
  protectVote: '/images/voting.png',
  protectHumanity: '/images/humanity-mosaic.png',
}

const WORDS = ['protectJobs', 'protectKids', 'protectVote', 'protectHumanity'] as const

export default function ProtectOurScroll({ lang }: { lang: Lang }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(sectionRef)

  const segmentSize = 1 / WORDS.length

  function getWordOpacity(i: number): number {
    const segStart = i * segmentSize
    const segEnd = segStart + segmentSize
    const isLast = i === WORDS.length - 1
    const isFirst = i === 0
    const fadeInStart = Math.max(0, segStart - segmentSize * 0.25)
    const fadeInEnd = segStart + segmentSize * 0.35
    const fadeOutStart = segStart + segmentSize * 0.65
    const fadeOutEnd = segEnd + segmentSize * 0.25

    if (isLast && progress >= fadeInEnd) return 1
    if (progress >= fadeInStart && progress < fadeInEnd) {
      return isFirst
        ? Math.min(1, (progress - segStart) / (fadeInEnd - segStart))
        : (progress - fadeInStart) / (fadeInEnd - fadeInStart)
    }
    if (progress >= fadeInEnd && progress < fadeOutStart) return 1
    if (!isLast && progress >= fadeOutStart && progress < fadeOutEnd) {
      return 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
    }
    return 0
  }

  // "our" fades out after "Humanity" is fully revealed (last 15% of scroll)
  const ourFade = Math.max(0, Math.min(1, (progress - 0.85) / 0.12))

  return (
    <section ref={sectionRef} className="relative bg-[#111]" style={{ height: `${WORDS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background images layer — fades out during final "our" exit */}
        {WORDS.map((word, i) => {
          const imgSrc = PROTECT_IMAGES[word]
          if (!imgSrc) return null
          const opacity = getWordOpacity(i)
          if (opacity <= 0) return null
          return (
            <div
              key={`bg-${word}`}
              className="absolute inset-0 z-0"
              style={{ opacity: opacity * 0.35 * (1 - ourFade) }}
            >
              <Image
                src={imgSrc}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )
        })}

        {/* Text layer */}
        <h2 className="relative z-10 font-serif uppercase text-center px-4 sm:px-8" style={{ fontSize: 'clamp(1.5rem, 6vw, 4.5rem)' }}>
          <span className="text-white/40">{t(lang, 'protectOur').replace(/\s+\S+$/, '')}</span>
          <span className="inline-flex overflow-hidden align-baseline text-white/40" style={{ opacity: 1 - ourFade, maxWidth: `${(1 - ourFade) * 10}ch`, transition: 'none' }}>
            &nbsp;{t(lang, 'protectOur').split(/\s+/).pop()}
          </span>
          {' '}
          <span className="relative inline-block" style={{ minWidth: '4ch' }}>
            {WORDS.map((word, i) => {
              const segStart = i * segmentSize
              const segEnd = segStart + segmentSize
              const isLast = i === WORDS.length - 1
              const isFirst = i === 0
              const fadeInStart = Math.max(0, segStart - segmentSize * 0.25)
              const fadeInEnd = segStart + segmentSize * 0.35
              const fadeOutStart = segStart + segmentSize * 0.65
              const fadeOutEnd = segEnd + segmentSize * 0.25

              let revealP = -1
              let isFadingOut = false

              if (isLast && progress >= fadeInEnd) {
                revealP = 1
              } else if (progress >= fadeInStart && progress < fadeInEnd) {
                revealP = isFirst
                  ? Math.min(1, (progress - segStart) / (fadeInEnd - segStart))
                  : (progress - fadeInStart) / (fadeInEnd - fadeInStart)
              } else if (progress >= fadeInEnd && progress < fadeOutStart) {
                revealP = 1
              } else if (!isLast && progress >= fadeOutStart && progress < fadeOutEnd) {
                revealP = (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart)
                isFadingOut = true
              }

              if (revealP < 0) return null

              const spread = 80
              let mask: string
              if (!isFadingOut) {
                const edge = (1 - revealP) * (100 + spread) - spread
                mask = `linear-gradient(to bottom, transparent ${edge}%, black ${edge + spread}%)`
              } else {
                const edge = revealP * (100 + spread) - spread
                mask = `linear-gradient(to top, transparent ${edge}%, black ${edge + spread}%)`
              }

              return (
                <span
                  key={word}
                  className="absolute left-0 text-sunrise"
                  style={{
                    WebkitMaskImage: mask,
                    maskImage: mask,
                  }}
                >
                  {t(lang, word)}
                </span>
              )
            })}
            {/* Invisible spacer for width */}
            <span className="invisible">{t(lang, 'protectHumanity')}</span>
          </span>
        </h2>
      </div>
    </section>
  )
}
