import { NextResponse } from 'next/server'

interface Official {
  name: string
  party: string
  phones: string[]
  photoUrl?: string
  urls?: string[]
}

interface CivicResponse {
  offices: { name: string; officialIndices: number[] }[]
  officials: {
    name: string
    party?: string
    phones?: string[]
    photoUrl?: string
    urls?: string[]
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
    return NextResponse.json(
      { error: 'Senator lookup is being configured. Please try again later.' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&levels=country&roles=legislatorUpperBody&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('Civic API error:', errText)
      return NextResponse.json({ error: 'Could not look up representatives' }, { status: 502 })
    }

    const data: CivicResponse = await res.json()
    const senators: Official[] = []

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
          })
        }
      }
    }

    return NextResponse.json({ senators })
  } catch (err) {
    console.error('Civic API fetch error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
