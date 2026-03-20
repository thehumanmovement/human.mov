'use client'

import { useState } from 'react'

const VIDEOS = [
  {
    id: 'xkPbV3IRe4Y',
    title: 'The AI Doc: Or How I Became an Apocaloptimist',
    subtitle: 'Official Trailer — Focus Features',
  },
  {
    id: 'BFU1OCkhBwo',
    title: 'Tristan Harris on The Diary Of A CEO',
    subtitle: 'AI Expert: Here Is What The World Looks Like In 2 Years!',
  },
  {
    id: 'tcr0yg7Mvg8',
    title: 'Jonathan Haidt on The Daily Show',
    subtitle: 'The Anxious Generation',
  },
]

export default function GetInformed() {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="font-serif uppercase text-4xl sm:text-5xl text-white mb-12 leading-tight text-center">
          Get <span className="text-sunrise">Informed.</span>
        </h2>
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
      </div>

      {/* Thumbnail carousel */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex gap-4 justify-center">
          {VIDEOS.map((video, i) => (
            <button
              key={video.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-[200px] sm:w-[280px] rounded-xl overflow-hidden border transition-all duration-300 text-left ${
                i === active
                  ? 'border-sunrise/50 ring-1 ring-sunrise/30 scale-[1.02]'
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
                  <div className="absolute inset-0 bg-sunrise/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-sunrise/80 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white/[0.03]">
                <p className={`font-body text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${
                  i === active ? 'text-sunrise' : 'text-white/80'
                }`}>
                  {video.title}
                </p>
                {video.subtitle && (
                  <p className="font-body text-xs text-white/30 mt-1 truncate">
                    {video.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
