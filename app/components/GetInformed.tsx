'use client'

import { t, type Lang } from '@/lib/i18n'

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

export default function GetInformed({ lang }: { lang: Lang }) {

  return (
    <section className="bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight text-center">
          {t(lang, 'outNow')}
          <br />
          <span className="text-sunrise">{t(lang, 'inTheatersOnly')}</span>
        </h2>
      </div>

      {/* Featured video player */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-10">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${VIDEOS[0].id}?rel=0&modestbranding=1`}
            title={VIDEOS[0].title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
          {/* Gradient overlay to hide YouTube title bar */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        </div>
      </div>

      <p className="font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto text-center px-5 sm:px-8">
        {t(lang, 'aiDocDesc')}
      </p>

    </section>
  )
}
