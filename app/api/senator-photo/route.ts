import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.govtrack.us/static/legislator-photos/${id}-200px.jpeg`,
      { next: { revalidate: 86400 * 30 } } // cache for 30 days
    )

    if (!res.ok) {
      return new NextResponse(null, { status: 404 })
    }

    const imageBuffer = await res.arrayBuffer()
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000', // 30 days
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
