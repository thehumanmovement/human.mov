'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { t, type Lang } from '@/lib/i18n'

interface Senator {
  name: string
  party: string
  phones: string[]
  photoUrl?: string
  urls?: string[]
}

export default function SenatorLookup({ lang, initialZip }: { lang: Lang; initialZip: string }) {
  const [zip, setZip] = useState(initialZip || '')
  const [senators, setSenators] = useState<Senator[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [looked, setLooked] = useState(false)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'asking' | 'loading' | 'done' | 'denied'>('idle')
  const zipInputRef = useRef<HTMLInputElement>(null)
  const hasAutoLooked = useRef(false)

  useEffect(() => {
    if (hasAutoLooked.current) return
    hasAutoLooked.current = true

    if (initialZip && /^\d{5}$/.test(initialZip)) {
      lookupSenators(initialZip)
      return
    }

    if ('geolocation' in navigator) {
      setGeoStatus('asking')
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setGeoStatus('loading')
          try {
            const res = await fetch(`/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`)
            const data = await res.json()
            if (data.zip && /^\d{5}$/.test(data.zip)) {
              setZip(data.zip)
              setGeoStatus('done')
              lookupSenators(data.zip)
            } else {
              setGeoStatus('done')
              zipInputRef.current?.focus()
            }
          } catch {
            setGeoStatus('done')
            zipInputRef.current?.focus()
          }
        },
        () => {
          setGeoStatus('denied')
          zipInputRef.current?.focus()
        },
        { timeout: 8000, maximumAge: 300000 }
      )
    } else {
      zipInputRef.current?.focus()
    }
  }, [initialZip])

  async function lookupSenators(zipCode: string) {
    setLookupLoading(true)
    setLookupError('')
    setSenators([])
    setLooked(true)

    try {
      const res = await fetch(`/api/representatives?zip=${zipCode}`)
      const data = await res.json()

      if (!res.ok) {
        setLookupError(data.error || 'Lookup failed')
        setLookupLoading(false)
        return
      }

      setSenators(data.senators || [])
    } catch {
      setLookupError('Network error')
    }
    setLookupLoading(false)
  }

  function handleLookup(e: FormEvent) {
    e.preventDefault()
    if (/^\d{5}$/.test(zip)) {
      lookupSenators(zip)
    }
  }

  function generateVCard(senator: Senator) {
    const phone = senator.phones[0] || ''
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:Sen. ${senator.name}`,
      `ORG:U.S. Senate (${senator.party})`,
      phone ? `TEL;TYPE=WORK:${phone}` : '',
      senator.urls?.[0] ? `URL:${senator.urls[0]}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n')

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Senator_${senator.name.replace(/\s+/g, '_')}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-4">
      {geoStatus === 'asking' && (
        <p className="mb-3 text-xs text-white/40 font-body flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sunrise animate-pulse"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {t(lang, 'senatorGeoAsking')}
        </p>
      )}
      {geoStatus === 'loading' && (
        <p className="mb-3 text-xs text-white/40 font-body">{t(lang, 'senatorGeoLoading')}</p>
      )}

      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          ref={zipInputRef}
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder={t(lang, 'senatorZipPlaceholder')}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          className="flex-1 bg-white/[0.07] border border-white/[0.12] rounded-lg px-4 py-3 text-base font-body outline-none placeholder:text-white/40 text-white focus:border-sunrise transition-all"
        />
        <button
          type="submit"
          disabled={lookupLoading || zip.length !== 5}
          className="px-5 py-3 bg-sunrise text-black rounded-lg font-body font-semibold text-sm hover:bg-sunrise-light transition-all disabled:opacity-30"
        >
          {lookupLoading ? t(lang, 'senatorLoading') : t(lang, 'senatorLookup')}
        </button>
      </form>

      {lookupError && (
        <p className="mt-3 text-sm text-red-400 font-body">{lookupError}</p>
      )}

      {looked && !lookupLoading && senators.length === 0 && !lookupError && (
        <p className="mt-3 text-sm text-white/40 font-body">{t(lang, 'senatorNoResults')}</p>
      )}

      {senators.map((senator, i) => (
        <div key={i} className="mt-4 bg-white/[0.05] border border-white/[0.1] rounded-xl p-4">
          <div className="flex items-start gap-3">
            {senator.photoUrl && (
              <img
                src={senator.photoUrl}
                alt={senator.name}
                className="w-14 h-14 rounded-full object-cover bg-white/10 border border-white/20"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="flex-1">
              <p className="font-body font-semibold text-white">{senator.name}</p>
              <p className="text-white/40 text-xs font-body">
                {t(lang, 'senatorParty')}: {senator.party}
              </p>
              {senator.phones[0] && (
                <a
                  href={`tel:${senator.phones[0]}`}
                  className="text-sunrise text-sm font-body hover:underline"
                >
                  {senator.phones[0]}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            {senator.phones[0] && (
              <a
                href={`tel:${senator.phones[0]}`}
                className="flex-1 text-center py-2 bg-sunrise text-black rounded-lg text-sm font-body font-semibold hover:bg-sunrise-light transition-all"
              >
                {t(lang, 'senatorCall')}
              </a>
            )}
            <button
              onClick={() => generateVCard(senator)}
              className="flex-1 text-center py-2 bg-white/[0.07] border border-white/[0.12] text-white/70 rounded-lg text-sm font-body font-semibold hover:bg-white/10 transition-all"
            >
              {t(lang, 'senatorSaveContact')}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
