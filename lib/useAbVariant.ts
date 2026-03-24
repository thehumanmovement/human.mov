'use client'

import { useState, useEffect } from 'react'

export type AbVariant = 'A' | 'B'

export function useAbVariant(): AbVariant {
  const [variant, setVariant] = useState<AbVariant>('A')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)ab-variant=([AB])/)
    if (match) {
      setVariant(match[1] as AbVariant)
    }
  }, [])

  return variant
}
