'use client'

type LinkItem = { title: string; url: string; description?: string }

const POLICY: LinkItem[] = [
  { title: 'OECD.AI Policy Navigator', url: 'https://oecd.ai/en/dashboards/overview', description: 'A live global database of national and international AI strategies, policies and initiatives.' },
  { title: 'Brennan Center AI Legislation Tracker', url: 'https://www.brennancenter.org/our-work/research-reports/artificial-intelligence-legislation-tracker', description: 'Monitors all AI-related bills introduced by the US Congress.' },
]

const PODCASTS: LinkItem[] = [
  { title: 'AI for Humans', url: 'https://www.aiforhumans.show', description: 'Weekly AI news — educational and engaging.' },
  { title: 'Your Undivided Attention', url: 'https://www.humanetech.com/podcast', description: 'Tristan Harris & Aza Raskin on the power of emerging tech.' },
  { title: 'Dwarkesh Podcast', url: 'https://www.dwarkesh.com', description: 'Interviewing tech leaders on what\'s happening and what\'s coming.' },
]

const ADVOCACY: LinkItem[] = [
  { title: 'Encode', url: 'https://encodeai.org' },
  { title: 'Design It For Us', url: 'https://designitforus.org' },
  { title: 'Fairplay', url: 'https://fairplayforkids.org' },
  { title: '5Rights Foundation', url: 'https://5rightsfoundation.com' },
]

const PRO_HUMAN: LinkItem[] = [
  { title: 'Future of Life Institute', url: 'https://futureoflife.org' },
  { title: 'Center for Humane Technology', url: 'https://www.humanetech.com' },
  { title: 'Center for AI Safety', url: 'https://safe.ai' },
  { title: 'Fathom', url: 'https://fathom.org' },
]

function FooterColumn({ heading, items, showDescriptions = false }: { heading: string; items: LinkItem[]; showDescriptions?: boolean }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 mb-4 uppercase">
        {heading}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.title}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sunrise text-sm hover:text-sunrise-light hover:underline underline-offset-2"
            >
              {item.title}
            </a>
            {showDescriptions && item.description && (
              <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <FooterColumn heading="Track AI Policy" items={POLICY} showDescriptions />
          <FooterColumn heading="Your New Podcast" items={PODCASTS} showDescriptions />
          <FooterColumn heading="Support Advocacy" items={ADVOCACY} />
          <FooterColumn heading="Pro-Human Orgs" items={PRO_HUMAN} />
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6">
        <p className="text-center text-white/30 text-sm">
          This page brought to you by{' '}
          <a
            href="https://www.humanetech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/70"
          >
            The Center for Humane Technology
          </a>
        </p>
      </div>
    </footer>
  )
}
