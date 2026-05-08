import { notFound } from 'next/navigation'
import { getPublishedEventBySlug } from '@/lib/events'
import EventRsvpForm from './EventRsvpForm'
import AddToCalendar from './AddToCalendar'

export const dynamic = 'force-dynamic'

function renderMarkdown(md: string): string {
  // Minimal markdown: bold (**text**), italic (*text*), links, paragraphs.
  // Avoids pulling in a markdown library for v1.
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>')
  // Paragraphs split on blank lines
  const paragraphs = html.split(/\n\s*\n/).map((p) => `<p class="mb-4">${p.replace(/\n/g, '<br/>')}</p>`)
  return paragraphs.join('\n')
}

function formatEventTime(starts_at: string | null, ends_at: string | null): string | null {
  if (!starts_at) return null
  const start = new Date(starts_at)
  const end = ends_at ? new Date(ends_at) : null
  const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }
  const datePart = start.toLocaleDateString('en-US', dateOpts)
  const startTime = start.toLocaleTimeString('en-US', timeOpts)
  if (!end) return `${datePart} · ${startTime}`
  const endTime = end.toLocaleTimeString('en-US', timeOpts)
  return `${datePart} · ${startTime} – ${endTime}`
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getPublishedEventBySlug(slug)
  if (!event) notFound()

  const timeStr = formatEventTime(event.starts_at, event.ends_at)
  const canDownloadIcs = !!(event.starts_at && event.ends_at)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-white/40 mb-4">The Human Movement</p>

        <h1 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-8">
          {event.name}
        </h1>

        {timeStr && (
          <div className="font-body text-base sm:text-lg text-sunrise mb-2">{timeStr}</div>
        )}
        {event.location && (
          <div className="font-body text-sm sm:text-base text-white/60 mb-8">{event.location}</div>
        )}

        {event.description && (
          <div
            className="font-body text-base sm:text-lg text-white/80 leading-relaxed mb-10"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }}
          />
        )}

        <div className="border-t border-white/10 pt-10">
          <EventRsvpForm slug={event.slug} />
        </div>

        {canDownloadIcs && (
          <div className="mt-8">
            <AddToCalendar slug={event.slug} />
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-white/10">
          <a href="/" className="font-body text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to The Human Movement
          </a>
        </div>
      </div>
    </main>
  )
}
