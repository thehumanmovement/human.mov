import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/utils'
import { t, type Lang } from '@/lib/i18n'

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { id, email, lang = 'en' } = await req.json()
  const l: Lang = lang === 'es' ? 'es' : 'en'

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
    from: `${t(l, 'emailHeading')} <noreply@contact.human.mov>`,
    to: email,
    subject: t(l, 'emailSubject'),
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 8px;">${t(l, 'emailHeading')}</h1>
        <p style="color: #666; margin-bottom: 32px;">${t(l, 'emailBody')}</p>
        <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0A6847; margin-bottom: 32px;">${code}</p>
        <p style="color: #999; font-size: 13px;">${t(l, 'emailExpiry')}</p>
      </div>
    `,
  })

  if (emailError) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
