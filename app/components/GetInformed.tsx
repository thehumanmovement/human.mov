'use client'

import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'

const MAIN_VIDEO = {
  id: 'xkPbV3IRe4Y',
  title: 'The AI Doc: Or How I Became an Apocaloptimist',
  subtitle: 'Official Trailer — Focus Features',
}

const LEARN_MORE_VIDEOS = [
  {
    id: 'tcr0yg7Mvg8',
    title: 'Jonathan Haidt on The Daily Show',
    subtitle: 'The Anxious Generation',
  },
  {
    id: 'wKrmlDOC540',
    title: 'Tristan Harris & Aza Raskin',
    subtitle: 'The AI Dilemma',
  },
  {
    id: 'BFU1OCkhBwo',
    title: 'Tristan Harris on The Diary Of A CEO',
    subtitle: 'AI Expert: Here Is What The World Looks Like In 2 Years!',
  },
  {
    id: 'vSF-Al45hQU',
    title: 'Esther Perel on The Other AI',
    subtitle: 'Artificial Intimacy — SXSW 2023',
  },
]

export default function GetInformed({ lang }: { lang: Lang }) {
  const [openVideo, setOpenVideo] = useState<string | null>(null)

  return (
    <section className="bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight text-center">
          <span className="text-sunrise">{t(lang, 'outNow')}</span>
          <br />
          {t(lang, 'inTheatersOnly')}
        </h2>
      </div>

      <p className="font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto text-center px-5 sm:px-8 mb-10" dangerouslySetInnerHTML={{ __html: t(lang, 'aiDocDesc') }} />

      {/* Featured video player */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-6">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${MAIN_VIDEO.id}?rel=0&modestbranding=1`}
            title={MAIN_VIDEO.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
          {/* Gradient overlay to hide YouTube title bar */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        </div>
      </div>

      <h3 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white text-center px-5 sm:px-8 leading-tight">
        In US Theaters <span className="text-sunrise">March 27th</span>
      </h3>

      {/* Learn More Now - additional videos */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 mt-16">
        <h4 className="font-serif uppercase text-2xl sm:text-3xl text-white text-center mb-8">Learn More Now</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {LEARN_MORE_VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => setOpenVideo(video.id)}
              className="group relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10 hover:border-white/30 transition-all"
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-semibold text-sm sm:text-base text-left">{video.title}</p>
                <p className="text-white/60 text-xs sm:text-sm text-left mt-1">{video.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen video overlay */}
      {openVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setOpenVideo(null)}
        >
          <button
            onClick={() => setOpenVideo(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-[90vw] max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${openVideo}?autoplay=1&rel=0&modestbranding=1`}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl"
            />
          </div>
        </div>
      )}

    </section>
  )
}
