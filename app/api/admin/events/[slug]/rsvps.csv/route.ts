import { NextResponse } from 'next/server'
import { getEventBySlug, listRsvpsForEvent } from '@/lib/events'

function csvEscape(value: string | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }
  const rsvps = await listRsvpsForEvent(event.id)

  const headers = ['email', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer', 'created_at']
  const rows = [
    headers.join(','),
    ...rsvps.map((r) =>
      [
        csvEscape(r.email),
        csvEscape(r.utm_source),
        csvEscape(r.utm_medium),
        csvEscape(r.utm_campaign),
        csvEscape(r.utm_content),
        csvEscape(r.utm_term),
        csvEscape(r.referrer),
        csvEscape(r.created_at),
      ].join(',')
    ),
  ]

  const csv = rows.join('\n') + '\n'

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}-rsvps.csv"`,
    },
  })
}
