import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/utils'

export async function POST(req: Request) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json({ error: 'SMS service not configured' }, { status: 503 })
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const { id, phone } = await req.json()

  if (!id || !phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const code = generateCode()

  const { error: dbError } = await supabase
    .from('signups')
    .update({ phone, phone_code: code, phone_verified: false })
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  try {
    await client.messages.create({
      body: `The Human Movement — your code is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
