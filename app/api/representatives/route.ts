import { NextResponse } from 'next/server'

interface Official {
  name: string
  party: string
  phones: string[]
  photoUrl?: string
  urls?: string[]
  channels?: { type: string; id: string }[]
}

interface CivicResponse {
  offices: { name: string; officialIndices: number[] }[]
  officials: {
    name: string
    party?: string
    phones?: string[]
    photoUrl?: string
    urls?: string[]
    channels?: { type: string; id: string }[]
  }[]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY

  if (!apiKey) {
    // Fallback: use the free API without key (limited but works)
    try {
      const res = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&levels=country&roles=legislatorUpperBody&key=AIzaSyCHR2KGCwkBvmJFZhTNxTiw7DW3LZxwGBk`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      )

      if (!res.ok) {
        console.error('Civic API error:', await res.text())
        return NextResponse.json({ error: 'Could not look up representatives' }, { status: 502 })
      }

      const data: CivicResponse = await res.json()
      return formatResponse(data)
    } catch (err) {
      console.error('Civic API fetch error:', err)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&levels=country&roles=legislatorUpperBody&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      console.error('Civic API error:', await res.text())
      return NextResponse.json({ error: 'Could not look up representatives' }, { status: 502 })
    }

    const data: CivicResponse = await res.json()
    return formatResponse(data)
  } catch (err) {
    console.error('Civic API fetch error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

function formatResponse(data: CivicResponse) {
  const senators: Official[] = []

  // Find the Senate office
  for (const office of data.offices) {
    if (office.name.includes('Senate') || office.name.includes('Senator')) {
      for (const idx of office.officialIndices) {
        const o = data.officials[idx]
        senators.push({
          name: o.name,
          party: o.party || 'Unknown',
          phones: o.phones || [],
          photoUrl: o.photoUrl,
          urls: o.urls,
          channels: o.channels,
        })
      }
    }
  }

  return NextResponse.json({ senators })
}
