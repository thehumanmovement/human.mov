import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { name, email, message, zipCode, contactable } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Store in Supabase
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        zip_code: zipCode?.trim() || null,
        contactable: contactable ?? true,
      })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      // Don't block submission on DB error — still send emails
    }

    // Send notification email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Send to hello@humanetech.com with reply-to set to user's email
      await resend.emails.send({
        from: 'The Human Movement <noreply@human.mov>',
        to: 'hello@humanetech.com',
        replyTo: email.trim(),
        subject: `New message from ${name.trim()} (${email.trim()})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #333;">New Contact Message</h2>
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> ${email.trim()}</p>
            ${zipCode?.trim() ? `<p><strong>Zip Code:</strong> ${zipCode.trim()}</p>` : ''}
            <p><strong>Contactable:</strong> ${contactable ? 'Yes' : 'No'}</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
          </div>
        `,
      })

      // Send copy to sender
      if (email?.trim()) {
        try {
          await resend.emails.send({
            from: 'The Human Movement <noreply@human.mov>',
            to: email.trim(),
            subject: 'Your message to The Human Movement',
            html: `
              <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #333;">Thanks for reaching out, ${name.trim()}.</h2>
                <p>We received your message and will get back to you soon.</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                </div>
                <p style="color: #999; font-size: 14px;">— The Human Movement</p>
              </div>
            `,
          })
        } catch (emailErr) {
          console.error('Confirmation email error:', emailErr)
        }
      }
    }

    // Add to MailerLite if contactable
    if (contactable && process.env.MAILERLITE_API_KEY && email?.trim()) {
      try {
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            fields: {
              name: name.trim(),
              last_name: '',
              z_i_p: zipCode?.trim() || '',
            },
          }),
        })
      } catch (mlErr) {
        console.error('MailerLite error:', mlErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send' }, { status: 500 })
  }
}
