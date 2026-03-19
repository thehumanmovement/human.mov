// This file parses wins.md into structured data for the globe.
// Edit lib/wins.md to add/update wins — it's much easier to read and edit.

// @ts-ignore — .md files are imported as raw strings via next.config.js webpack rule
import winsMarkdown from './wins.md'

export interface WinInfo {
  title: string
  description: string
  date: string
  url?: string
}

export interface TourStop {
  name: string
  lat: number
  lng: number
  alt: number
}

function parseWinsMarkdown(md: string): {
  wins: Record<string, WinInfo[]>
  tourStops: TourStop[]
} {
  const wins: Record<string, WinInfo[]> = {}
  const tourStops: TourStop[] = []

  // Split by region (# headings)
  const regionBlocks = md.split(/^# /m).slice(1) // skip preamble before first #

  for (const block of regionBlocks) {
    const lines = block.split('\n')
    const regionName = lines[0].trim()
    if (!regionName || regionName === 'Auto-Tour Wins') continue

    // Check for tour stop coordinates
    const tourLine = lines.find(l => l.startsWith('> Tour:'))
    if (tourLine) {
      const latMatch = tourLine.match(/lat\s+(-?[\d.]+)/)
      const lngMatch = tourLine.match(/lng\s+(-?[\d.]+)/)
      const zoomMatch = tourLine.match(/zoom\s+([\d.]+)/)
      if (latMatch && lngMatch) {
        tourStops.push({
          name: regionName,
          lat: parseFloat(latMatch[1]),
          lng: parseFloat(lngMatch[1]),
          alt: zoomMatch ? parseFloat(zoomMatch[1]) : 2.0,
        })
      }
    }

    // Parse wins (## headings)
    const winBlocks = block.split(/^## /m).slice(1)
    const regionWins: WinInfo[] = []

    for (const winBlock of winBlocks) {
      const winLines = winBlock.split('\n')
      const title = winLines[0].trim()
      if (!title) continue

      let date = ''
      let url: string | undefined
      const descLines: string[] = []

      for (let i = 1; i < winLines.length; i++) {
        const line = winLines[i].trim()
        if (line.startsWith('- Date:')) {
          date = line.replace('- Date:', '').trim()
        } else if (line.startsWith('- URL:')) {
          url = line.replace('- URL:', '').trim()
        } else if (line && !line.startsWith('---') && !line.startsWith('>') && !line.startsWith('#')) {
          descLines.push(line)
        }
      }

      if (title && date) {
        regionWins.push({
          title,
          description: descLines.join(' ').trim(),
          date,
          ...(url ? { url } : {}),
        })
      }
    }

    if (regionWins.length > 0) {
      wins[regionName] = regionWins
    }
  }

  return { wins, tourStops }
}

const parsed = parseWinsMarkdown(winsMarkdown)

export const WINS = parsed.wins
export const TOUR_STOPS = parsed.tourStops

export const DEFAULT_STATE_WIN: WinInfo[] = [
  { title: 'Phone-Free Schools', description: 'Enacted phone-free school policies for student wellbeing.', date: '2024–2025' },
]
