import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SLUG_RE = /^[a-z0-9-]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { slug, name, description, starts_at, ends_at, location, meeting_url, capacity, is_published } = body

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens.' }, { status: 400 })
  }
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      slug,
      name,
      description: description || null,
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      location: location || null,
      meeting_url: meeting_url || null,
      capacity: capacity ?? null,
      is_published: !!is_published,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An event with that slug already exists.' }, { status: 409 })
    }
    console.error('Event create error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, event: data })
}
