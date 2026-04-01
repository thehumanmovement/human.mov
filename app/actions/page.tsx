'use client'

import { useState, useRef, useEffect } from 'react'

/* ───────── colour tokens per threat row ───────── */
const THREAT_COLORS = [
  { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'text-red-400', hoverBg: 'bg-red-500/20' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'text-amber-400', hoverBg: 'bg-amber-500/20' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-400', label: 'text-purple-400', hoverBg: 'bg-purple-500/20' },
  { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', label: 'text-blue-400', hoverBg: 'bg-blue-500/20' },
]

const SCALE_COLORS = [
  { text: 'text-cyan-400', icon: '👤' },
  { text: 'text-orange-400', icon: '🏘️' },
  { text: 'text-yellow-400', icon: '🏛️' },
  { text: 'text-emerald-400', icon: '🌍' },
]

const SCALES = ['Individual', 'Community', 'National', 'Global']

const THREATS = [
  { num: 1, label: 'AI Arms Race', sub: 'End the race before it ends us' },
  { num: 2, label: 'Economic Replacement', sub: 'Protect livelihoods & shared prosperity' },
  { num: 3, label: 'Social Replacement', sub: 'Defend real human connection' },
  { num: 4, label: 'Political Replacement', sub: 'Keep power in human hands' },
]

/* ───────── matrix data: [threat][scale] ───────── */
interface CellData {
  title: string
  bullets: string[]
  expanded: string[]
}

const MATRIX: CellData[][] = [
  /* ── THREAT 1: AI Arms Race ── */
  [
    {
      title: 'Understand the stakes',
      bullets: ['Watch The AI Doc', 'Read CHT AI Roadmap', 'Sign the Pro-Human AI Declaration', 'Share on social media'],
      expanded: [
        'Create political satire videos imagining AI CEOs reckoning with the human cost of their decisions',
        'Make parody ads exposing the gap between Big Tech\'s AI promises and reality',
        'Launch a "receipts" social account documenting every broken AI safety pledge',
        'Build a browser extension that flags AI-generated content in real time',
        'Start a podcast interviewing people whose jobs have already been displaced by AI',
        'Run a "human-made" label campaign for artists, writers, and musicians',
        'Create a viral "what did AI cost you?" testimonial series',
        'Design and distribute open-source protest graphics and campaign materials',
        'Write an op-ed in your local paper about AI\'s impact on your community',
        'Call into talk radio to shift the AI conversation from innovation to accountability',
        'Start a book club reading the most important AI governance literature',
      ],
    },
    {
      title: 'Spread awareness',
      bullets: ['Host film screenings', 'Start a local chapter', 'Engage faith, civic, and professional groups'],
      expanded: [
        'Organize community screenings of the AI documentary followed by action planning',
        'Launch a local chapter of The Human Movement with monthly actions',
        'Partner with churches, mosques, and synagogues to host AI ethics conversations',
        'Host a storytelling night where people share what technology has cost them',
        'Curate an art exhibition exclusively featuring human-made work, explicitly labeled',
        'Launch a "human voices" music project — no AI composition, no AI production',
        'Organize a film festival of documentaries on technology and human dignity',
        'Create a traveling photography exhibition of faces behind the AI displacement statistics',
        'Host a comedy night roasting AI CEOs — sharp, funny, and factual',
        'Organize a national day of storytelling — one million people posting what they\'re fighting to protect',
      ],
    },
    {
      title: 'Demand safety standards',
      bullets: ['Contact legislators', 'Support AI safety bills', 'Mandate ownership & independent oversight'],
      expanded: [
        'Submit public comments on every open AI regulatory proceeding',
        'Create an AI safety voter scorecard for every Congressional candidate',
        'Pressure your state legislature to pass AI transparency laws',
        'Organize a coordinated campaign pressuring your members of Congress to co-sponsor AI accountability legislation',
        'Organize a congressional lobby day with displaced workers as the face of the campaign',
        'Push for legislation requiring AI impact assessments before any government deployment',
        'File complaints with the FTC over AI companies\' deceptive safety claims',
        'Demand mandatory human review of all AI-generated medical diagnoses',
        'Build a public database tracking every politician\'s AI industry donations',
      ],
    },
    {
      title: 'International treaties',
      bullets: ['AI safety agreements', 'Prevent mutually assured AI destruction', '"If we don\'t, they will" is not a strategy'],
      expanded: [
        'Support international treaty negotiations for autonomous weapons bans',
        'Demand your city council pass a resolution opposing autonomous weapons',
        'Support litigation challenging AI use in criminal sentencing',
        'Organize legal support for whistleblowers inside AI companies',
        'File or support class action lawsuits against AI companies for data theft from workers and artists',
        'Challenge AI-generated evidence in court proceedings',
        'Prevent mutually assured AI destruction through binding international frameworks',
      ],
    },
  ],
  /* ── THREAT 2: Economic Replacement ── */
  [
    {
      title: 'Protect your livelihood',
      bullets: ['Learn where AI replaces your work', 'Build irreplaceable skills', 'Choose tools that augment, not replace'],
      expanded: [
        'Form a workplace AI impact committee at your company',
        'Negotiate AI transition clauses into union contracts',
        'Organize a "no AI replacement without consent" petition at your employer',
        'Refuse to train AI systems on your own work without compensation',
        'Document and publish your company\'s AI displacement plans',
        'Stage a walkout demanding human oversight of AI hiring tools',
        'Launch a legal challenge to AI-driven hiring discrimination',
        'Produce short documentary portraits of communities affected by AI-driven job loss',
      ],
    },
    {
      title: 'Build mutual aid',
      bullets: ['Reskilling cooperatives', 'Skill-sharing networks', 'Support displaced workers', 'Local economic initiatives'],
      expanded: [
        'Start a worker-owned alternative to an AI-threatened industry',
        'Build a solidarity fund for workers displaced by AI',
        'Create an industry-wide pledge: no AI deployment without worker consent',
        'Create a "human business" directory of local services committed to keeping humans employed',
        'Start a mutual aid network explicitly built on human labor, not automation',
        'Build a community investment fund for human-labor businesses in your area',
        'Build a consumer cooperative as an alternative to an AI-dominated marketplace',
        'Organize a community data center audit — who owns the infrastructure in your town?',
      ],
    },
    {
      title: 'Tax & regulate',
      bullets: ['Tax human labor less than silicon', 'AI liability standards', 'Protect wage floors'],
      expanded: [
        'Pledge to only vote for candidates who commit to a specific AI safety platform',
        'Run for local office on a pro-human platform',
        'Organize candidate town halls exclusively focused on AI policy',
        'Demand your state attorney general investigate AI-driven price fixing',
        'Demand your bank disclose its AI lending discrimination policies',
        'Organize a coordinated boycott of the AI company with the worst safety record',
        'Pressure your pension fund to adopt AI ethics investment criteria',
        'Organize a town hall demanding your mayor take a position on AI job displacement',
      ],
    },
    {
      title: 'Shared prosperity',
      bullets: ['Every human gets some AI ownership', 'AI augments, never replaces human judgment'],
      expanded: [
        'Divest personal investments from companies racing to deploy unsafe AI',
        'Delete one major AI-powered platform per month',
        'Switch to AI companies with the strongest published safety records',
        'Buy exclusively from human-made, human-sold businesses for one week',
        'Cancel Amazon Prime for one month in solidarity with displaced warehouse workers',
        'Create a newsletter aggregating pro-human AI policy wins globally',
        'Build a rapid response team that fact-checks AI industry claims in real time',
        'Train community spokespeople to represent The Human Movement in local media',
      ],
    },
  ],
  /* ── THREAT 3: Social Replacement ── */
  [
    {
      title: 'Protect your humanity',
      bullets: ['Recognize AI manipulation', 'Prioritize real relationships', 'Don\'t anthropomorphize synthetic intimacy'],
      expanded: [
        'Implement a family technology constitution — agreed rules, signed by everyone',
        'Host weekly phone-free family dinners, non-negotiable',
        'Replace one hour of screen time per day with a family skill — cooking, building, music',
        'Read one book together as a family every month, chosen by a child',
        'Cancel AI-powered subscription services',
        'Teach your kids to navigate, cook, write, and do math without AI assistance',
        'Have an honest family conversation about what AI is doing to your attention',
        'Build something together with your hands — a garden, a piece of furniture, a meal',
        'Create a family "AI-free zone" — one room, always',
      ],
    },
    {
      title: 'Strengthen real bonds',
      bullets: ['IRL gathering spaces', 'Support parents & schools', 'Phone-free youth spaces', 'Community practices: art, movement, ceremony'],
      expanded: [
        'Host monthly neighborhood dinners — phones locked at the door',
        'Build a community phone-free public space — a park, a café, a block',
        'Write and perform a play about a community resisting AI displacement',
        'Start a human-only literary magazine',
        'Commission a public mural in your city depicting the human future worth fighting for',
        'Build a monument in your city to workers displaced by automation',
        'Students: submit hand-written work even when AI submission is accepted',
        'Start a "learn the hard way" club where students commit to mastering skills without AI',
        'Launch a student newspaper dedicated to covering AI\'s impact on your community',
      ],
    },
    {
      title: 'Mandate disclosure',
      bullets: ['All AIs must disclose they are non-human', 'Rights over face, voice, identity, and data'],
      expanded: [
        'Support legal challenges to facial recognition in public spaces',
        'Demand mandatory human review of all AI-generated medical diagnoses',
        'Teachers: design assessments that are impossible to complete with AI',
        'Parents: organize a school board campaign for AI classroom policies',
        'Organize a student walkout demanding schools adopt AI transparency policies',
        'Petition your university to disclose all AI industry funding and partnerships',
        'Launch a youth-led campaign demanding AI companies be banned from school data',
        'Create a student pledge: no AI on creative or analytical work for one semester',
        'Flood comment sections of AI hype pieces with documented evidence of harm',
        'Organize a media literacy workshop teaching people to spot AI-generated propaganda',
      ],
    },
    {
      title: 'Human-centered design',
      bullets: ['Global ban on AI impersonation', 'Unique protections for children', 'Design for connection, not addiction'],
      expanded: [
        'Create a high school debate curriculum on AI governance',
        'Write handwritten letters to your elected officials as a family',
        'Pitch your local TV news a story on AI job displacement in your city',
        'Organize a national day of storytelling — one million people posting what they\'re fighting to protect',
        'Support international treaty negotiations for autonomous weapons bans',
        'Push for global bans on synthetic child exploitation material',
        'Demand unique protections for children in all AI legislation',
      ],
    },
  ],
  /* ── THREAT 4: Political Replacement ── */
  [
    {
      title: 'Know your rights',
      bullets: ['Understand how AI concentrates power', 'Identify AI-driven misinformation', 'Protect your data'],
      expanded: [
        'Build a public database tracking every politician\'s AI industry donations',
        'Organize a polling project to identify the most viable pro-human political messaging',
        'Design and distribute open-source protest graphics and campaign materials',
        'Flood comment sections of AI hype pieces with documented evidence of harm',
        'Organize a media literacy workshop teaching people to spot AI-generated propaganda',
        'Build a rapid response team that fact-checks AI industry claims in real time',
        'Create a newsletter aggregating pro-human AI policy wins globally',
        'Train community spokespeople to represent The Human Movement in local media',
      ],
    },
    {
      title: 'Demand a voice',
      bullets: ['Community input on AI deployment decisions', 'Local AI impact audits', 'Democratic governance of AI in public spaces'],
      expanded: [
        'Pressure local governments to block new data center construction without community consent',
        'Organize a community data center audit — who owns the infrastructure in your town?',
        'Organize a town hall demanding your mayor take a position on AI job displacement',
        'Start a mutual aid network explicitly built on human labor, not automation',
        'Create a "human business" directory of local services committed to keeping humans employed',
        'Organize community screenings of the AI documentary followed by action planning',
        'Launch a local chapter of The Human Movement with monthly actions',
        'Partner with churches, mosques, and synagogues to host AI ethics conversations',
      ],
    },
    {
      title: 'Prevent concentration',
      bullets: ['Antitrust for AI companies', 'Shared ownership of AI', 'Democratic oversight', 'AI benefits shared broadly'],
      expanded: [
        'Demand your state attorney general investigate AI-driven price fixing',
        'File or support class action lawsuits against AI companies for data theft from workers and artists',
        'Support litigation challenging AI use in criminal sentencing',
        'Organize legal support for whistleblowers inside AI companies',
        'Push for legislation requiring AI impact assessments before any government deployment',
        'Challenge AI-generated evidence in court proceedings',
        'File complaints with the FTC over AI companies\' deceptive safety claims',
        'Pressure your state legislature to pass AI transparency laws',
      ],
    },
    {
      title: 'Balance power globally',
      bullets: ['No single entity monopolizes AI', 'Global democratic input on AI governance', 'Every human gets a say'],
      expanded: [
        'Support international treaty negotiations for autonomous weapons bans',
        'Pledge to only vote for candidates who commit to a specific AI safety platform',
        'Run for local office on a pro-human platform',
        'Organize candidate town halls exclusively focused on AI policy',
        'Submit public comments on every open AI regulatory proceeding',
        'Demand your city council pass a resolution opposing autonomous weapons',
        'Create an AI safety voter scorecard for every Congressional candidate',
        'Organize a congressional lobby day with displaced workers as the face of the campaign',
      ],
    },
  ],
]

/* ───────── tooltip component ───────── */
function CellCard({ cell, threatIdx, scaleIdx }: { cell: CellData; threatIdx: number; scaleIdx: number }) {
  const tc = THREAT_COLORS[threatIdx]
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* position the tooltip so it doesn't overflow viewport */
  useEffect(() => {
    if (!open || !tooltipRef.current || !cardRef.current) return
    const tip = tooltipRef.current
    const rect = tip.getBoundingClientRect()
    // horizontal
    if (rect.right > window.innerWidth - 16) {
      tip.style.left = 'auto'
      tip.style.right = '0'
    }
    if (rect.left < 16) {
      tip.style.left = '0'
      tip.style.right = 'auto'
    }
    // vertical – if goes below viewport, flip above
    if (rect.bottom > window.innerHeight - 16) {
      tip.style.top = 'auto'
      tip.style.bottom = '100%'
      tip.style.marginBottom = '8px'
      tip.style.marginTop = '0'
    }
  }, [open])

  const enter = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setOpen(true)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${tc.bg} ${tc.border} border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${open ? tc.hoverBg : ''}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={() => setOpen(!open)}
    >
      <h4 className={`font-serif text-sm sm:text-base font-bold ${tc.text} mb-2`}>{cell.title}</h4>
      <ul className="space-y-1">
        {cell.bullets.map((b, i) => (
          <li key={i} className="text-white/70 text-xs leading-snug flex gap-1.5">
            <span className="text-white/30 mt-px">–</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-2 text-[10px] uppercase tracking-wider ${tc.text} opacity-60`}>
        {open ? 'Tap to close' : `+ ${cell.expanded.length} more actions`}
      </div>

      {/* expanded tooltip */}
      {open && (
        <div
          ref={tooltipRef}
          className="absolute z-50 left-0 mt-2 w-[340px] sm:w-[400px] max-h-[70vh] overflow-y-auto rounded-xl border border-white/20 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl p-5"
          style={{ top: '100%' }}
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <h4 className={`font-serif text-lg font-bold ${tc.text} mb-1`}>{cell.title}</h4>
          <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">
            {THREATS[threatIdx].label} × {SCALES[scaleIdx]}
          </p>
          <div className="space-y-2">
            {cell.expanded.map((action, i) => (
              <div key={i} className="flex gap-2 group">
                <span className={`${tc.text} mt-0.5 text-sm opacity-60 group-hover:opacity-100 transition-opacity`}>→</span>
                <span className="text-white/80 text-sm leading-snug group-hover:text-white transition-colors">{action}</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-3 border-t border-white/10 text-xs ${tc.text} opacity-70`}>
            Every one of these is something you can start today.
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────── main page ───────── */
export default function ActionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* header */}
      <header className="pt-12 pb-8 sm:pt-16 sm:pb-10 text-center px-4">
        <p className="text-white/40 uppercase tracking-[0.3em] text-xs sm:text-sm font-body mb-3">The Human Movement</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Action Matrix
        </h1>
        <p className="text-white/60 font-body text-base sm:text-lg max-w-2xl mx-auto mb-2">
          Four threats &times; Four scales of action. Find your cell.
        </p>
        <p className="text-sunrise font-body text-sm sm:text-base max-w-xl mx-auto">
          Hover or tap any cell to discover dozens of actions you can take right now.
        </p>
      </header>

      {/* desktop grid */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 pb-20">
        {/* column headers */}
        <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr] gap-3 mb-3">
          <div /> {/* empty corner */}
          {SCALES.map((s, i) => (
            <div key={s} className="text-center py-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xl mr-2">{SCALE_COLORS[i].icon}</span>
              <span className={`font-serif text-lg font-bold uppercase ${SCALE_COLORS[i].text}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* rows */}
        {THREATS.map((threat, ti) => (
          <div key={ti} className="grid grid-cols-[200px_1fr_1fr_1fr_1fr] gap-3 mb-3">
            {/* row header */}
            <div className={`${THREAT_COLORS[ti].bg} ${THREAT_COLORS[ti].border} border rounded-lg p-4 flex flex-col justify-center`}>
              <div className={`text-xs uppercase tracking-wider ${THREAT_COLORS[ti].text} opacity-70 mb-1`}>Threat {threat.num}</div>
              <div className={`font-serif text-lg font-bold ${THREAT_COLORS[ti].text} leading-tight`}>{threat.label}</div>
              <div className="text-white/40 text-xs mt-1 leading-snug">{threat.sub}</div>
            </div>
            {/* cells */}
            {MATRIX[ti].map((cell, si) => (
              <CellCard key={si} cell={cell} threatIdx={ti} scaleIdx={si} />
            ))}
          </div>
        ))}
      </div>

      {/* mobile/tablet: stacked by threat */}
      <div className="lg:hidden max-w-xl mx-auto px-4 pb-20 space-y-8">
        {THREATS.map((threat, ti) => (
          <div key={ti}>
            <div className={`${THREAT_COLORS[ti].border} border-l-4 pl-4 mb-4`}>
              <div className={`text-xs uppercase tracking-wider ${THREAT_COLORS[ti].text} opacity-70`}>Threat {threat.num}</div>
              <div className={`font-serif text-2xl font-bold ${THREAT_COLORS[ti].text}`}>{threat.label}</div>
              <div className="text-white/40 text-sm">{threat.sub}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATRIX[ti].map((cell, si) => (
                <div key={si}>
                  <div className={`text-xs uppercase tracking-wider mb-1 ${SCALE_COLORS[si].text} opacity-60 flex items-center gap-1`}>
                    <span>{SCALE_COLORS[si].icon}</span> {SCALES[si]}
                  </div>
                  <CellCard cell={cell} threatIdx={ti} scaleIdx={si} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* footer CTA */}
      <div className="text-center pb-16 px-4">
        <div className="max-w-2xl mx-auto border border-sunrise/30 rounded-2xl py-8 px-6 bg-sunrise/[0.03]">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            Pick your row. Pick your column. <span className="text-sunrise">Act.</span>
          </h2>
          <p className="text-white/60 font-body text-sm sm:text-base mb-1">
            Every cell is an entry point. No single approach is enough — we need all of them.
          </p>
          <p className="text-sunrise font-body text-sm font-semibold mt-4">
            You have more agency than you think.
          </p>
          <a
            href="/"
            className="inline-block mt-6 bg-sunrise text-black rounded-full px-8 py-3 text-sm font-body font-bold uppercase tracking-widest hover:bg-sunrise-light transition-all duration-300 hover:scale-[1.02]"
          >
            Join at human.mov
          </a>
        </div>
        <p className="text-white/20 text-xs mt-6">
          Sources: human.mov &middot; Center for Humane Technology &middot; Future of Life &middot; CHT AI Roadmap Report 2025
        </p>
      </div>
    </div>
  )
}
