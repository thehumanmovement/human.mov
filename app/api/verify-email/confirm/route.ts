import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { id, code } = await req.json()

  if (!id || !code) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('signups')
    .select('email_code, email')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (data.email_code !== code) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }

  await supabase
    .from('signups')
    .update({ email_verified: true, email_code: null })
    .eq('id', id)

  // Add subscriber to "Email Verified" group in MailerLite
  if (process.env.MAILERLITE_API_KEY && process.env.MAILERLITE_VERIFIED_GROUP_ID && data.email) {
    try {
      await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: data.email,
          groups: [process.env.MAILERLITE_VERIFIED_GROUP_ID],
        }),
      })
    } catch (mlErr) {
      console.error('MailerLite verified group error:', mlErr)
    }
  }

  return NextResponse.json({ verified: true })
}
