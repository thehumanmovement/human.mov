import { NextResponse } from 'next/server'
import { getPublishedEventBySlug } from '@/lib/events'
import { generateIcs } from '@/lib/ics'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getPublishedEventBySlug(slug)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }
  if (!event.starts_at || !event.ends_at) {
    return NextResponse.json({ error: 'Event time not set' }, { status: 400 })
  }

  const ics = generateIcs({
    uid: `${event.id}@thehumanmovement.org`,
    summary: event.name,
    description: event.description || undefined,
    location: event.meeting_url || event.location || undefined,
    url: event.meeting_url || undefined,
    start: new Date(event.starts_at),
    end: new Date(event.ends_at),
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  })
}
