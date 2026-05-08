// Minimal RFC 5545 ICS generator. No external dependency.
// Used to generate downloadable calendar invites for events.

function escapeIcsText(text: string): string {
  // RFC 5545 §3.3.11
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

function formatIcsDate(date: Date): string {
  // Format: YYYYMMDDTHHMMSSZ (UTC)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

export type IcsEvent = {
  uid: string
  summary: string
  description?: string
  location?: string
  url?: string
  start: Date
  end: Date
}

export function generateIcs(event: IcsEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Human Movement//Event RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
  ]
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
  if (event.url) lines.push(`URL:${event.url}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  // RFC 5545 mandates CRLF line endings
  return lines.join('\r\n') + '\r\n'
}
