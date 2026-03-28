'use client'

import { useEffect, useState, useCallback } from 'react'

// Map common country names to flag emoji (ISO 3166-1 alpha-2)
const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'USA': '🇺🇸', 'US': '🇺🇸',
  'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
  'Canada': '🇨🇦', 'Mexico': '🇲🇽',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Peru': '🇵🇪',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
  'Poland': '🇵🇱', 'Czech Republic': '🇨🇿', 'Romania': '🇷🇴', 'Hungary': '🇭🇺',
  'Greece': '🇬🇷', 'Ireland': '🇮🇪', 'Ukraine': '🇺🇦',
  'India': '🇮🇳', 'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Korea': '🇰🇷',
  'Australia': '🇦🇺', 'New Zealand': '🇳🇿',
  'South Africa': '🇿🇦', 'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Egypt': '🇪🇬',
  'Israel': '🇮🇱', 'Turkey': '🇹🇷', 'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪',
  'Indonesia': '🇮🇩', 'Philippines': '🇵🇭', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳',
  'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'Taiwan': '🇹🇼', 'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩', 'Sri Lanka': '🇱🇰',
  'Russia': '🇷🇺', 'Iceland': '🇮🇸', 'Luxembourg': '🇱🇺',
  'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Ecuador': '🇪🇨', 'Uruguay': '🇺🇾',
  'Venezuela': '🇻🇪', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾',
  'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Ghana': '🇬🇭', 'Ethiopia': '🇪🇹',
  'Tanzania': '🇹🇿', 'Uganda': '🇺🇬',
}

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '🌍'
}

interface CountryData {
  name: string
  count: number
}

export default function CountryTicker() {
  const [countries, setCountries] = useState<CountryData[]>([])
  const [total, setTotal] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/signup-countries')
      const data = await res.json()
      setCountries(data.countries || [])
      setTotal(data.total || 0)
      setLoaded(true)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  if (!loaded || countries.length === 0) return null

  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-fade-in">
      <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl px-5 py-4">
        <p className="text-white/50 text-xs font-body uppercase tracking-widest text-center mb-3">
          {total.toLocaleString()} people joined from
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {countries.slice(0, 12).map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-1.5 bg-white/[0.06] rounded-full px-3 py-1.5 text-xs font-body text-white/70 hover:bg-white/[0.1] transition-colors"
              title={`${c.count} from ${c.name}`}
            >
              <span className="text-sm">{getFlag(c.name)}</span>
              <span>{c.name}</span>
              <span className="text-white/40">{c.count}</span>
            </div>
          ))}
          {countries.length > 12 && (
            <div className="flex items-center gap-1 bg-white/[0.06] rounded-full px-3 py-1.5 text-xs font-body text-white/40">
              +{countries.length - 12} more
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
