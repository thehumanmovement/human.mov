'use client'

export default function AddToCalendar({ slug }: { slug: string }) {
  return (
    <a
      href={`/api/event/${slug}/ics`}
      className="inline-flex items-center gap-2 font-body text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-5 py-2.5 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
      Add to calendar
    </a>
  )
}
