import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { fullName, email, zipCode } = await req.json()

  if (!fullName || fullName.trim().length < 2) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('signups')
    .insert({ full_name: fullName.trim(), email: email?.trim() || null, zip_code: zipCode?.trim() || null })

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Failed to save', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
