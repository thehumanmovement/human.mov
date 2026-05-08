import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/events'
import EventForm from '../../EventForm'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <a href="/admin/events" className="text-white/50 hover:text-white text-sm mb-4 inline-block">← Events</a>
        <h1 className="font-serif uppercase text-3xl mb-8">Edit event</h1>
        <EventForm mode="edit" initial={event} />
      </div>
    </main>
  )
}
