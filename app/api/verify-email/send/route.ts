import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { id, email } = await req.json()

  if (!id || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const code = generateCode()

  const { error: dbError } = await supabase
    .from('signups')
    .update({ email, email_code: code, email_verified: false })
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  const { error: emailError } = await resend.emails.send({
    from: 'The Human Movement <noreply@yourdomain.com>',
    to: email,
    subject: 'Your verification code',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">The Human Movement</h1>
        <p style="color: #666; margin-bottom: 32px;">Your verification code:</p>
        <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0A6847; margin-bottom: 32px;">${code}</p>
        <p style="color: #999; font-size: 13px;">This code expires in 10 minutes.</p>
      </div>
    `,
  })

  if (emailError) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
