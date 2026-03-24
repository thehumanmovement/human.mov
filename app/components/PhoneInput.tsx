'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
]

interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, placeholder = '', className = '', autoFocus }, ref) {
    // Parse existing value to extract country code
    const defaultCountry = COUNTRIES[0] // US
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry)
    const [localNumber, setLocalNumber] = useState('')
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    // Initialize from value prop
    useEffect(() => {
      if (value && !localNumber) {
        // Try to match a country code from the value
        const match = COUNTRIES.find(c => value.startsWith(c.code))
        if (match) {
          setSelectedCountry(match)
          setLocalNumber(value.slice(match.code.length).trim())
        } else if (value.startsWith('+')) {
          setLocalNumber(value)
        } else {
          setLocalNumber(value)
        }
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Close dropdown on outside click
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setOpen(false)
          setSearch('')
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClick)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    function updatePhone(country: typeof defaultCountry, number: string) {
      setSelectedCountry(country)
      setLocalNumber(number)
      onChange(`${country.code}${number}`)
    }

    const filtered = search
      ? COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
        )
      : COUNTRIES

    return (
      <div className="relative flex gap-0">
        {/* Country code button */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="h-full bg-white/[0.07] border border-white/[0.12] border-r-0 rounded-l-lg px-3 flex items-center gap-1.5 hover:bg-white/10 transition-all focus:border-sunrise focus:outline-none"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-white/70 text-sm font-body">{selectedCountry.code}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-auto bg-[#1a1a1a] border border-white/[0.15] rounded-lg shadow-xl z-50">
              <div className="sticky top-0 bg-[#1a1a1a] p-2 border-b border-white/[0.1]">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.07] border border-white/[0.12] rounded px-3 py-2 text-sm font-body text-white placeholder:text-white/30 outline-none focus:border-sunrise"
                />
              </div>
              {filtered.map((country, i) => (
                <button
                  key={`${country.code}-${country.name}-${i}`}
                  type="button"
                  onClick={() => {
                    updatePhone(country, localNumber)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.07] transition-colors text-left ${
                    selectedCountry.name === country.name && selectedCountry.code === country.code ? 'bg-white/[0.05]' : ''
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-white/80 text-sm font-body flex-1">{country.name}</span>
                  <span className="text-white/40 text-xs font-body">{country.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-white/30 text-sm font-body text-center">No results</p>
              )}
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          placeholder={placeholder}
          value={localNumber}
          onChange={(e) => updatePhone(selectedCountry, e.target.value)}
          autoFocus={autoFocus}
          className={`${className} !rounded-l-none !border-l-0`}
        />
      </div>
    )
  }
)

export default PhoneInput
