import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await req.json().catch(() => ({}))
  const { name, description, starts_at, ends_at, location, meeting_url, capacity, is_published } = body

  const { data, error } = await supabase
    .from('events')
    .update({
      name,
      description: description ?? null,
      starts_at: starts_at ?? null,
      ends_at: ends_at ?? null,
      location: location ?? null,
      meeting_url: meeting_url ?? null,
      capacity: capacity ?? null,
      is_published: !!is_published,
    })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    console.error('Event update error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, event: data })
}
