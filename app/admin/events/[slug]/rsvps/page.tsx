import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventBySlug, listRsvpsForEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

function formatDate(s: string): string {
  return new Date(s).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function EventRsvpsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()
  const rsvps = await listRsvpsForEvent(event.id)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/events" className="text-white/50 hover:text-white text-sm mb-4 inline-block">← Events</Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif uppercase text-3xl">{event.name}</h1>
            <p className="text-white/50 mt-1 text-sm">{rsvps.length} RSVPs</p>
          </div>
          <a
            href={`/api/admin/events/${event.slug}/rsvps.csv`}
            className="bg-sunrise text-black font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded-md hover:bg-sunrise/90 transition-colors"
          >
            Export CSV
          </a>
        </div>

        {rsvps.length === 0 ? (
          <p className="text-white/50">No RSVPs yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
                <th className="py-3">Email</th>
                <th className="py-3">Source</th>
                <th className="py-3">Campaign</th>
                <th className="py-3">RSVP'd at</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-3 font-mono text-sm">{r.email}</td>
                  <td className="py-3 text-sm text-white/70">{r.utm_source || '—'}</td>
                  <td className="py-3 text-sm text-white/70">{r.utm_campaign || '—'}</td>
                  <td className="py-3 text-sm text-white/70">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
