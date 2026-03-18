import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    // Use free BigDataCloud reverse geocoding (no API key needed)
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    const data = await res.json()
    const zip = data.postcode || ''

    if (!zip) {
      return NextResponse.json({ error: 'Could not determine zip code' }, { status: 404 })
    }

    return NextResponse.json({ zip })
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 503 })
  }
}
