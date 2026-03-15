import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { fullName, zipCode } = await req.json()

  if (!fullName || fullName.trim().length < 2) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('signups')
    .insert({ full_name: fullName.trim(), zip_code: zipCode?.trim() || null })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
