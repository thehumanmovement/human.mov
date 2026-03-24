import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import twilio from 'twilio'
import { generateCode } from '@/lib/utils'
import { t, isValidLang, type Lang } from '@/lib/i18n'

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, zipCode, lang = 'en', abVariant = 'A' } = await req.json()
    const l: Lang = isValidLang(lang) ? lang : 'en'
    const isPhoneFirst = abVariant === 'B'

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: t(l, 'errorNameRequired') }, { status: 400 })
    }

    if (isPhoneFirst) {
      if (!phone || !phone.trim()) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
      }
    } else {
      if (!email || !email.trim()) {
        return NextResponse.json({ error: t(l, 'errorEmailRequired') }, { status: 400 })
      }
    }

    const code = generateCode()

    const insertData: Record<string, unknown> = {
      full_name: fullName.trim(),
      zip_code: zipCode?.trim() || null,
      ab_variant: isPhoneFirst ? 'B' : 'A',
    }

    if (isPhoneFirst) {
      insertData.phone = phone.trim()
      insertData.phone_code = code
      insertData.phone_verified = false
      if (email?.trim()) {
        insertData.email = email.trim()
      }
    } else {
      insertData.email = email.trim()
      insertData.email_code = code
      insertData.email_verified = false
    }

    const { data, error } = await supabase
      .from('signups')
      .insert(insertData)
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

    if (isPhoneFirst) {
      // Send SMS verification via Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
          await client.messages.create({
            body: t(l, 'smsBody').replace('{code}', code),
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone.trim(),
          })
        } catch (smsErr) {
          console.error('Twilio SMS error:', smsErr)
          // Don't fail the signup if SMS fails
        }
      }
    } else {
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
        }
      }
    }

    // Add subscriber to MailerLite (when email is available)
    const emailToAdd = (email?.trim()) || null
    if (process.env.MAILERLITE_API_KEY && emailToAdd) {
      try {
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
          body: JSON.stringify({
            email: emailToAdd,
            fields: {
              name: fullName.trim(),
              last_name: '',
              z_i_p: zipCode?.trim() || '',
            },
          }),
        })
      } catch (mlErr) {
        console.error('MailerLite error:', mlErr)
      }
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Signup route error:', err)
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
  }
}
