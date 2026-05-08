import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPublishedEventBySlug } from '@/lib/events'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json()
    const { email, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const event = await getPublishedEventBySlug(slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { error } = await supabase.from('event_rsvps').insert({
      event_id: event.id,
      email: email.trim().toLowerCase(),
      utm_source: utm_source?.slice(0, 255) || null,
      utm_medium: utm_medium?.slice(0, 255) || null,
      utm_campaign: utm_campaign?.slice(0, 255) || null,
      utm_content: utm_content?.slice(0, 255) || null,
      utm_term: utm_term?.slice(0, 255) || null,
      referrer: referrer?.slice(0, 2048) || null,
    })

    if (error) {
      // Unique-constraint violation = already RSVPed; treat as success (idempotent)
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, alreadyRsvped: true })
      }
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('RSVP route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
