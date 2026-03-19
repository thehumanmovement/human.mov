import { NextResponse } from 'next/server'
import { zipToState } from '@/lib/zip-to-state'

interface Official {
  name: string
  party: string
  phones: string[]
  photoUrl?: string
  urls?: string[]
}

interface GovTrackRole {
  person: {
    name: string
    firstname: string
    lastname: string
    bioguideid: string
    link: string
  }
  party: string
  phone: string | null
  website: string
  extra?: {
    contact_form?: string
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 })
  }

  const state = zipToState(zip)

  if (!state) {
    return NextResponse.json({ error: 'Could not determine state from zip code' }, { status: 400 })
  }

  // DC, territories — no senators
  if (['DC', 'PR', 'VI', 'GU', 'AS', 'MP', 'AA', 'AE', 'AP'].includes(state)) {
    return NextResponse.json({ senators: [], note: 'This area does not have voting U.S. Senators.' })
  }

  try {
    const res = await fetch(
      `https://www.govtrack.us/api/v2/role?current=true&role_type=senator&state=${state}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      console.error('GovTrack API error:', res.status)
      return NextResponse.json({ error: 'Could not look up representatives' }, { status: 502 })
    }

    const data = await res.json()
    const senators: Official[] = (data.objects || []).map((role: GovTrackRole) => {
      // Extract numeric GovTrack ID from link like ".../adam_schiff/400361"
      const govtrackId = role.person.link.replace(/\/$/, '').split('/').pop()
      // Clean up display name: "Sen. Adam Schiff [D-CA]" → "Adam Schiff"
      const displayName = role.person.name
        .replace(/^Sen\.\s*/, '')
        .replace(/\s*\[.*\]$/, '')
        .replace(/\u201c.*?\u201d\s*/g, '') // remove quoted nicknames
        .trim()
      return {
        name: displayName,
        party: role.party || 'Unknown',
        phones: role.phone ? [role.phone] : [],
        photoUrl: govtrackId
          ? `/api/senator-photo?id=${govtrackId}`
          : undefined,
        urls: role.website ? [role.website] : [],
      }
    })

    return NextResponse.json({ senators })
  } catch (err) {
    console.error('GovTrack API fetch error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
