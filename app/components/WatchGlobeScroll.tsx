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

function getName(d: any): string { return d.properties?.name || '' }
function isHighlighted(d: any): boolean {
  const n = getName(d)
  return HIGHLIGHT_COUNTRIES.has(n) || HIGHLIGHT_STATES.has(n)
}

// The 3 regions we want to show, with card positioning
const SCROLL_STOPS = [
  { name: 'United States of America', lat: 38, lng: -97, alt: 1.8, position: 'upper-right' as const },
  { name: 'Australia', lat: -25, lng: 134, alt: 2.0, position: 'middle-left' as const },
  { name: 'China', lat: 35, lng: 105, alt: 2.0, position: 'bottom-right' as const },
]

function getRegionWins(name: string): WinInfo[] {
  return WINS[name] || []
}

// --- Component ---

interface Props {
  lang: string
}

export default function WatchGlobeScroll({ lang }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const focusedRegion = useRef<string | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [carouselIndices, setCarouselIndices] = useState<number[]>(SCROLL_STOPS.map(() => 0))
  const [slideDirs, setSlideDirs] = useState<(string | null)[]>(SCROLL_STOPS.map(() => null))

  // Detect when section enters viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function setFocusedAndRefresh(name: string | null) {
    focusedRegion.current = name
    const globe = globeRef.current
    if (globe) {
      globe
        .polygonCapColor(globe.polygonCapColor())
        .polygonStrokeColor(globe.polygonStrokeColor())
        .polygonAltitude(globe.polygonAltitude())
    }
  }

  // Initialize globe
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

      const globe = (Globe as any)({ rendererConfig: { antialias: true, alpha: true } })
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .width(width)
        .height(height)
        .showAtmosphere(true)
        .atmosphereColor('#aaaaaa')
        .atmosphereAltitude(0.15)
        .polygonStrokeColor((d: any) => {
          const n = getName(d)
          const focused = focusedRegion.current
          const isFocused = n === focused || (focused === 'United States of America' && HIGHLIGHT_STATES.has(n))
          if (isFocused) return '#ddddddcc'
          return '#66666680'
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
          if (isFocused && isHighlighted(d)) return '#ccccccee'
          return isHighlighted(d) ? '#888888aa' : '#2a2a2aaa'
        })
        .polygonLabel(() => '')
        .enablePointerInteraction(false)

      globe(container)

      const mat = globe.globeMaterial() as any
      if (mat) {
        mat.bumpScale = 5
        const THREE = await import('three')
        mat.color = new THREE.Color(0x111111)
        mat.emissive = new THREE.Color(0x0a0a0a)
        mat.emissiveIntensity = 0.3
      }

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

  // Scroll-driven card visibility and globe rotation
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(i)
            const stop = SCROLL_STOPS[i]
            const globe = globeRef.current
            if (globe) {
              setFocusedAndRefresh(stop.name)
              globe.pointOfView({ lat: stop.lat, lng: stop.lng, altitude: stop.alt }, 1500)
            }
          }
        },
        { threshold: 0.3 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [visible]) // Re-run when section becomes visible

  return (
    <section ref={sectionRef} className="relative bg-[#0a0a0a]">
      {/* Heading */}
      <div className={`relative z-10 text-center px-5 sm:px-8 pt-20 sm:pt-28 pb-10 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="font-serif uppercase text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
          The Human Movement Is
          <br />
          <span className="text-sunrise">Gaining Speed.</span>
        </h2>
        <p className="font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
          A global force is growing to protect our jobs, our kids and our freedom. To keep humans in control and make it safe for all of us.
        </p>
      </div>

      {/* Sticky globe + scrolling cards */}
      <div className="relative" style={{ height: `${SCROLL_STOPS.length * 60}vh` }}>
        {/* Sticky globe background */}
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full max-w-[1200px]"
          />
        </div>

        {/* Scrolling card overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ paddingTop: '15vh' }}>
          {SCROLL_STOPS.map((stop, i) => {
            const wins = getRegionWins(stop.name).slice(0, 10)
            if (wins.length === 0) return null

            const isActive = activeIndex === i
            const curIdx = carouselIndices[i]
            const win = wins[curIdx] || wins[0]
            const slideDir = slideDirs[i]

            const posClass = stop.position === 'upper-right'
              ? 'items-start pt-[15vh] justify-end pr-6 sm:pr-12 lg:pr-20'
              : stop.position === 'middle-left'
              ? 'items-center justify-start pl-6 sm:pl-12 lg:pl-20'
              : 'items-end pb-[15vh] justify-end pr-6 sm:pr-12 lg:pr-20'

            const isRight = stop.position !== 'middle-left'
            const rotDeg = isRight ? '-0.5' : '0.5'

            const goTo = (idx: number) => {
              setSlideDirs(prev => { const n = [...prev]; n[i] = idx > curIdx ? 'left' : 'right'; return n })
              setCarouselIndices(prev => { const n = [...prev]; n[i] = idx; return n })
            }
            const goPrev = () => { if (curIdx > 0) goTo(curIdx - 1) }
            const goNext = () => { if (curIdx < wins.length - 1) goTo(curIdx + 1) }

            return (
              <div
                key={stop.name}
                ref={el => { cardRefs.current[i] = el }}
                className={`h-[60vh] flex ${posClass}`}
              >
                <div
                  className={`pointer-events-auto max-w-[420px] w-full transition-opacity duration-700 ease-out ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="newspaper-card rounded-sm p-5 sm:p-6" style={{ transform: `rotate(${rotDeg}deg)` }}>
                    <div className="dateline flex items-center justify-between">
                      <span className="font-bold text-[#111]">{stop.name === 'United States of America' ? 'United States' : stop.name}</span>
                      <span>{win.date}</span>
                    </div>
                    <div className="min-h-[80px] overflow-hidden relative">
                      <div
                        key={`${stop.name}-${curIdx}`}
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
                            className="headline text-lg sm:text-xl block mb-2 hover:text-[#111] transition-colors duration-200 cursor-pointer"
                          >
                            {win.title}
                          </a>
                        ) : (
                          <p className="headline text-lg sm:text-xl mb-2">
                            {win.title}
                          </p>
                        )}
                        <p className="body-text">
                          {win.description}
                        </p>
                      </div>
                    </div>
                    {wins.length > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d4c9a8]">
                        <button
                          onClick={goPrev}
                          className={`text-[#999] hover:text-[#111] transition-colors p-1.5 -ml-1.5 ${curIdx === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                          aria-label="Previous win"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <div className="flex gap-1.5">
                          {wins.map((_, j) => (
                            <button
                              key={j}
                              onClick={() => goTo(j)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                j === curIdx ? 'bg-[#111] w-5' : 'bg-[#ccc] hover:bg-[#999] w-1.5'
                              }`}
                              aria-label={`Win ${j + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={goNext}
                          className={`text-[#999] hover:text-[#111] transition-colors p-1.5 -mr-1.5 ${curIdx === wins.length - 1 ? 'opacity-30 pointer-events-none' : ''}`}
                          aria-label="Next win"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
