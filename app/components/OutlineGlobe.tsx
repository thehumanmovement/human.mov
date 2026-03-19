'use client'

import { useEffect, useRef, useState } from 'react'
import { WINS, DEFAULT_STATE_WIN, TOUR_STOPS, type WinInfo } from '../../lib/wins-data'

// --- Data ---

const HIGHLIGHT_COUNTRIES = new Set([
  'Australia', 'Spain', 'France', 'India', 'Indonesia', 'China', 'Brazil',
  'United Kingdom', 'Italy', 'Germany', 'Netherlands', 'Belgium', 'Denmark',
  'Sweden', 'Finland', 'Portugal', 'Greece', 'Austria', 'Ireland', 'Poland',
  'Czech Republic', 'Czechia', 'Romania', 'Ethiopia', 'Rwanda', 'South Africa',
  'Nigeria', 'United States of America',
])

const HIGHLIGHT_STATES = new Set([
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Nebraska', 'North Carolina', 'Ohio', 'Oklahoma', 'Pennsylvania',
  'South Carolina', 'Tennessee', 'Texas', 'Utah', 'Virginia', 'Wisconsin',
  'District of Columbia',
])

const COUNTRY_NAMES: Record<string, string> = {
  '036': 'Australia', '724': 'Spain', '250': 'France', '356': 'India',
  '360': 'Indonesia', '156': 'China', '076': 'Brazil', '826': 'United Kingdom',
  '380': 'Italy', '276': 'Germany', '528': 'Netherlands', '056': 'Belgium',
  '208': 'Denmark', '752': 'Sweden', '246': 'Finland', '620': 'Portugal',
  '300': 'Greece', '040': 'Austria', '372': 'Ireland', '616': 'Poland',
  '203': 'Czechia', '642': 'Romania', '231': 'Ethiopia', '646': 'Rwanda',
  '710': 'South Africa', '566': 'Nigeria', '840': 'United States of America',
  '124': 'Canada', '484': 'Mexico', '643': 'Russia', '392': 'Japan',
  '410': 'South Korea', '764': 'Thailand', '704': 'Vietnam', '608': 'Philippines',
  '586': 'Pakistan', '050': 'Bangladesh', '818': 'Egypt', '404': 'Kenya',
  '012': 'Algeria', '504': 'Morocco', '032': 'Argentina', '152': 'Chile',
  '170': 'Colombia', '604': 'Peru', '862': 'Venezuela', '578': 'Norway',
  '756': 'Switzerland', '804': 'Ukraine', '792': 'Turkey', '682': 'Saudi Arabia',
  '784': 'United Arab Emirates', '364': 'Iran', '368': 'Iraq',
  '004': 'Afghanistan', '180': 'DR Congo', '800': 'Uganda', '834': 'Tanzania',
  '288': 'Ghana', '384': 'Ivory Coast', '024': 'Angola', '508': 'Mozambique',
  '450': 'Madagascar', '716': 'Zimbabwe', '894': 'Zambia',
}

const STATE_FIPS: Record<string, string> = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
  '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
  '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
  '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
  '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
  '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
  '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
  '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
  '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
  '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
  '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
  '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
  '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
}

function timeAgo(dateStr: string): string {
  const now = new Date(2026, 2, 18) // March 18, 2026
  const monthNames: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
  }
  // Try "Month Year" format
  for (const [name, idx] of Object.entries(monthNames)) {
    if (dateStr.startsWith(name)) {
      const year = parseInt(dateStr.split(' ')[1])
      if (!isNaN(year)) {
        const months = (now.getFullYear() - year) * 12 + (now.getMonth() - idx)
        if (months <= 0) return 'This month'
        if (months === 1) return '1 month ago'
        if (months < 12) return `${months} months ago`
        const years = Math.floor(months / 12)
        const rem = months % 12
        if (rem === 0) return years === 1 ? '1 year ago' : `${years} years ago`
        return years === 1 ? `1 year, ${rem}mo ago` : `${years}y ${rem}mo ago`
      }
    }
  }
  // Try "Summer YYYY" or just "YYYY"
  const yearMatch = dateStr.match(/(\d{4})/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1])
    const months = (now.getFullYear() - year) * 12 + now.getMonth() - 6 // assume mid-year
    if (months <= 1) return 'Recently'
    if (months < 12) return `${months} months ago`
    const years = Math.floor(months / 12)
    return years === 1 ? '~1 year ago' : `~${years} years ago`
  }
  return dateStr
}

// WINS, DEFAULT_STATE_WIN, and TOUR_STOPS are imported from lib/wins-data.ts

function getName(d: any): string { return d.properties?.name || '' }
function isHighlighted(d: any): boolean {
  const n = getName(d)
  return HIGHLIGHT_COUNTRIES.has(n) || HIGHLIGHT_STATES.has(n)
}
function getWins(name: string): WinInfo[] {
  if (WINS[name]) return WINS[name]
  if (HIGHLIGHT_STATES.has(name)) return DEFAULT_STATE_WIN
  return []
}

// --- Component ---

export default function OutlineGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const tourIndex = useRef(0)
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusedRegion = useRef<string | null>(null) // Currently highlighted by tour
  const isCardHovered = useRef(false)

  const [tourCard, setTourCard] = useState<{ name: string; wins: WinInfo[] } | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  function stopTour() {
    if (tourTimer.current) {
      clearTimeout(tourTimer.current)
      tourTimer.current = null
    }
  }

  function setFocusedAndRefresh(name: string | null) {
    focusedRegion.current = name
    const globe = globeRef.current
    if (globe) {
      // Re-trigger color accessors
      globe
        .polygonCapColor(globe.polygonCapColor())
        .polygonStrokeColor(globe.polygonStrokeColor())
        .polygonAltitude(globe.polygonAltitude())
    }
  }

  function flyToStop(index: number) {
    const globe = globeRef.current
    if (!globe) return

    const stop = TOUR_STOPS[index % TOUR_STOPS.length]
    const wins = getWins(stop.name)
    if (wins.length === 0) return

    // Update content and highlight
    if (stop.name === 'The World') {
      setFocusedAndRefresh(null)
      // Glow the entire globe white for "The World"
      if (globe.atmosphereColor) globe.atmosphereColor('#ffffff')
      if (globe.atmosphereAltitude) globe.atmosphereAltitude(0.25)
    } else {
      setFocusedAndRefresh(stop.name)
      if (globe.atmosphereColor) globe.atmosphereColor('#1E7A3A')
      if (globe.atmosphereAltitude) globe.atmosphereAltitude(0.15)
    }
    setCarouselIndex(0)
    setSlideDir(null)
    setTourCard({ name: stop.name, wins })

    globe.pointOfView({ lat: stop.lat, lng: stop.lng, altitude: stop.alt }, 1500)

    // Schedule next stop
    function scheduleNext() {
      tourTimer.current = setTimeout(() => {
        if (isCardHovered.current) {
          scheduleNext()
          return
        }
        tourIndex.current = (index + 1) % TOUR_STOPS.length
        flyToStop(tourIndex.current)
      }, 4000)
    }
    scheduleNext()
  }

  function startTour() {
    stopTour()
    tourTimer.current = setTimeout(() => flyToStop(tourIndex.current), 1500)
  }

  function jumpTour(direction: 'prev' | 'next') {
    stopTour()
    const total = TOUR_STOPS.length
    if (direction === 'next') {
      tourIndex.current = (tourIndex.current + 1) % total
    } else {
      tourIndex.current = (tourIndex.current - 1 + total) % total
    }
    flyToStop(tourIndex.current)
  }

  useEffect(() => {
    let destroyed = false

    async function init() {
      if (!containerRef.current) return

      const [GlobeModule, { feature }] = await Promise.all([
        import('globe.gl'),
        import('topojson-client'),
      ])

      if (destroyed) return

      const Globe = GlobeModule.default
      const container = containerRef.current!
      const width = container.offsetWidth
      const height = container.offsetHeight

      const globe = Globe({ rendererConfig: { antialias: true, alpha: true } })
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .width(width)
        .height(height)
        .showAtmosphere(true)
        .atmosphereColor('#1E7A3A')
        .atmosphereAltitude(0.15)
        .polygonStrokeColor((d: any) => {
          const n = getName(d)
          const focused = focusedRegion.current
          // When US is focused, highlight all US state borders too
          const isFocused = n === focused || (focused === 'United States of America' && HIGHLIGHT_STATES.has(n))
          if (isFocused) return '#b8f0c8cc'
          return '#3da85780'
        })
        .polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonAltitude((d: any) => {
          const n = getName(d)
          const focused = focusedRegion.current
          const isFocused = n === focused || (focused === 'United States of America' && HIGHLIGHT_STATES.has(n))
          if (isFocused) return 0.025
          return isHighlighted(d) ? 0.012 : 0.003
        })
        .polygonCapColor((d: any) => {
          const n = getName(d)
          const focused = focusedRegion.current
          const isFocused = n === focused || (focused === 'United States of America' && HIGHLIGHT_STATES.has(n))
          if (isFocused && isHighlighted(d)) return '#8eeaa0ee'
          return isHighlighted(d) ? '#34A853aa' : '#1a281aaa'
        })
        .polygonLabel(() => '')
        .enablePointerInteraction(false) // Disable all mouse interaction with polygons

      globe(container)

      const mat = globe.globeMaterial() as any
      if (mat) {
        mat.bumpScale = 5
        const THREE = await import('three')
        mat.color = new THREE.Color(0x0a150a)
        mat.emissive = new THREE.Color(0x051005)
        mat.emissiveIntensity = 0.3
      }

      // Disable all user controls — auto-tour only
      const controls = globe.controls() as any
      if (controls) {
        controls.autoRotate = false
        controls.enableZoom = false
        controls.enablePan = false
        controls.enableRotate = false
      }

      globe.pointOfView({ lat: 25, lng: -30, altitude: 2.2 })
      globeRef.current = globe

      // Load polygon data
      try {
        const [countriesResp, statesResp] = await Promise.all([
          fetch('https://unpkg.com/world-atlas@2/countries-110m.json'),
          fetch('https://unpkg.com/us-atlas@3/states-10m.json'),
        ])
        const [countriesData, statesData] = await Promise.all([
          countriesResp.json(),
          statesResp.json(),
        ])

        if (destroyed) return

        const countriesGeo = feature(countriesData, countriesData.objects.countries) as any
        const statesGeo = feature(statesData, statesData.objects.states) as any

        countriesGeo.features.forEach((f: any) => {
          if (f.id && COUNTRY_NAMES[f.id]) f.properties.name = COUNTRY_NAMES[f.id]
        })
        statesGeo.features.forEach((f: any) => {
          if (f.id && STATE_FIPS[f.id]) f.properties.name = STATE_FIPS[f.id]
        })

        const nonUS = countriesGeo.features.filter((f: any) => f.id !== '840')
        globe.polygonsData([...nonUS, ...statesGeo.features])

        startTour()
      } catch (err) {
        console.error('Failed to load globe data:', err)
      }

      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          globe.width(containerRef.current.offsetWidth).height(containerRef.current.offsetHeight)
        }
      })
      ro.observe(container)

      return () => {
        ro.disconnect()
        stopTour()
        globe._destructor?.()
      }
    }

    let cleanup: (() => void) | undefined
    init().then(c => { cleanup = c })

    return () => {
      destroyed = true
      cleanup?.()
    }
  }, [])

  const [cardHoverState, setCardHoverState] = useState(false)

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[500px] sm:h-[600px] lg:h-[700px] mx-auto max-w-[900px]"
      />

      {/* Big tour navigation arrows flanking the globe */}
      <button
        onClick={() => jumpTour('prev')}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 text-white/20 hover:text-earth-light hover:bg-white/[0.04] rounded-full transition-all duration-300 group"
        aria-label="Previous location"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-9 sm:h-9 group-hover:scale-110 transition-transform">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        onClick={() => jumpTour('next')}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 text-white/20 hover:text-earth-light hover:bg-white/[0.04] rounded-full transition-all duration-300 group"
        aria-label="Next location"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-9 sm:h-9 group-hover:scale-110 transition-transform">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Tour win card — carousel */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[480px] transition-all duration-700 ${
          tourCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onMouseEnter={() => { isCardHovered.current = true; setCardHoverState(true) }}
        onMouseLeave={() => { isCardHovered.current = false; setCardHoverState(false) }}
      >
        {tourCard && (() => {
          const wins = tourCard.wins.slice(0, 10)
          const total = wins.length
          const win = wins[carouselIndex] || wins[0]

          const goTo = (i: number) => {
            setSlideDir(i > carouselIndex ? 'left' : 'right')
            setCarouselIndex(i)
          }
          const goPrev = () => goTo((carouselIndex - 1 + total) % total)
          const goNext = () => goTo((carouselIndex + 1) % total)

          return (
            <div className={`backdrop-blur-lg border rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
              cardHoverState
                ? 'bg-black/70 border-earth/40 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(110,207,129,0.12)] -translate-y-1'
                : 'bg-black/50 border-earth/25 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(110,207,129,0.06)]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif italic text-xl sm:text-2xl text-earth-light leading-tight">
                    {tourCard.name}
                  </h3>
                  <span className="text-xs font-body text-amber-400/70 whitespace-nowrap">
                    {timeAgo(win.date)}
                  </span>
                </div>
                <div className="min-h-[100px] overflow-hidden relative">
                  <div
                    key={`${tourCard.name}-${carouselIndex}`}
                    className={slideDir ? 'animate-slide-in' : ''}
                    style={slideDir ? {
                      animationName: slideDir === 'left' ? 'slideFromRight' : 'slideFromLeft',
                    } : undefined}
                  >
                    {win.url ? (
                      <a
                        href={win.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif italic text-base sm:text-lg text-white/90 leading-snug mb-2 block hover:text-earth-light transition-colors duration-200 cursor-pointer"
                      >
                        {win.title}
                      </a>
                    ) : (
                      <p className="font-serif italic text-base sm:text-lg text-white/90 leading-snug mb-2">
                        {win.title}
                      </p>
                    )}
                    <p className="font-body text-sm text-white/45 leading-relaxed">
                      {win.description}
                    </p>
                  </div>
                </div>
              </div>
              {total > 1 && (
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/[0.06]">
                  <button
                    onClick={goPrev}
                    className="text-white/30 hover:text-earth-light transition-colors p-1.5 -ml-1.5"
                    aria-label="Previous win"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <div className="flex gap-2">
                    {wins.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === carouselIndex ? 'bg-earth-light w-6' : 'bg-white/20 hover:bg-white/30 w-2'
                        }`}
                        aria-label={`Win ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goNext}
                    className="text-white/30 hover:text-earth-light transition-colors p-1.5 -mr-1.5"
                    aria-label="Next win"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
