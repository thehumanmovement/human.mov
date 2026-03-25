import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { email, message } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Send to tech@human.mov
    await resend.emails.send({
      from: 'The Human Movement <noreply@human.mov>',
      to: 'tech@human.mov',
      subject: `New message from ${email || 'anonymous visitor'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>From:</strong> ${email || 'Not provided'}</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    })

    // Send copy to sender if they provided email
    if (email?.trim()) {
      await resend.emails.send({
        from: 'The Human Movement <noreply@human.mov>',
        to: email,
        subject: 'Your message to The Human Movement',
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #333;">Thanks for reaching out.</h2>
            <p>We received your message and will get back to you soon.</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="white-space: pre-wrap; margin: 0;">${message}</p>
            </div>
            <p style="color: #999; font-size: 14px;">— The Human Movement</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send' }, { status: 500 })
  }
}
