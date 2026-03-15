import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { generateCode } from '@/lib/utils'
import { t, type Lang } from '@/lib/i18n'

export async function POST(req: Request) {
  try {
    const { fullName, email, zipCode, lang = 'en' } = await req.json()
    const l: Lang = lang === 'es' ? 'es' : 'en'

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: t(l, 'errorNameRequired') }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: t(l, 'errorEmailRequired') }, { status: 400 })
    }

    const code = generateCode()

    const { data, error } = await supabase
      .from('signups')
      .insert({
        full_name: fullName.trim(),
        email: email.trim(),
        zip_code: zipCode?.trim() || null,
        email_code: code,
        email_verified: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error))
      return NextResponse.json({ error: 'Failed to save', detail: error.message, code: error.code }, { status: 500 })
    }

    if (!data) {
      console.error('Supabase returned no data after insert')
      return NextResponse.json({ error: 'Failed to save', detail: 'No data returned' }, { status: 500 })
    }

    // Send verification email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: `${t(l, 'emailHeading')} <noreply@contact.human.mov>`,
          to: email.trim(),
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
      } catch (emailErr) {
        console.error('Resend email error:', emailErr)
        // Don't fail the signup if email fails
      }
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Signup route error:', err)
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
  }
}
