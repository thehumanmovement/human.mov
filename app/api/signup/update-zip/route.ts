import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { id, zipCode } = await req.json()

  if (!id || !zipCode) {
    return NextResponse.json({ error: 'Missing id or zipCode' }, { status: 400 })
  }

  if (!/^\d{5}$/.test(zipCode)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 })
  }

  // Only update if the user doesn't already have a zip code
  const { data: existing } = await supabase
    .from('signups')
    .select('zip_code')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Signup not found' }, { status: 404 })
  }

  if (existing.zip_code) {
    return NextResponse.json({ ok: true, updated: false })
  }

  const { error } = await supabase
    .from('signups')
    .update({ zip_code: zipCode })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated: true })
}
