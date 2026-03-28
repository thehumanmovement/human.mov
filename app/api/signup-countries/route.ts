import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 30 // cache for 30 seconds

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('signups')
      .select('country')
      .not('country', 'is', null)
      .not('country', 'eq', '')

    if (error) {
      return NextResponse.json({ countries: [], total: 0 }, { status: 200 })
    }

    // Count signups per country
    const counts: Record<string, number> = {}
    let total = 0
    for (const row of data || []) {
      const c = row.country?.trim()
      if (c) {
        counts[c] = (counts[c] || 0) + 1
        total++
      }
    }

    // Sort by count descending
    const countries = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Also get total signups (including those without country)
    const { count: totalSignups } = await supabase
      .from('signups')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      countries,
      total: totalSignups ?? total,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch {
    return NextResponse.json({ countries: [], total: 0 }, { status: 200 })
  }
}
