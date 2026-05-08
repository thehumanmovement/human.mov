import Link from 'next/link'
import { listAllEvents } from '@/lib/events'

export const dynamic = 'force-dynamic'

function formatDate(s: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function AdminEventsPage() {
  const events = await listAllEvents()
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif uppercase text-3xl">Events</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/events/new"
              className="bg-sunrise text-black font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded-md hover:bg-sunrise/90 transition-colors"
            >
              + New event
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="text-sm text-white/50 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="text-white/50">No events yet. Create your first one.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
                <th className="py-3">Name</th>
                <th className="py-3">Slug</th>
                <th className="py-3">Starts</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-white/5">
                  <td className="py-4">{ev.name}</td>
                  <td className="py-4 font-mono text-sm text-white/70">{ev.slug}</td>
                  <td className="py-4 text-sm text-white/70">{formatDate(ev.starts_at)}</td>
                  <td className="py-4">
                    <span
                      className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                        ev.is_published
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {ev.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex gap-3 justify-end text-sm">
                      <Link href={`/admin/events/${ev.slug}/edit`} className="text-sunrise hover:underline">
                        Edit
                      </Link>
                      <Link href={`/admin/events/${ev.slug}/rsvps`} className="text-sunrise hover:underline">
                        RSVPs
                      </Link>
                      {ev.is_published && (
                        <Link href={`/event/${ev.slug}`} target="_blank" className="text-white/60 hover:underline">
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
