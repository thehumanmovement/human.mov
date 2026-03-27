'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.removeItem('thm-signed-up')
    localStorage.removeItem('thm-name')
    localStorage.removeItem('thm-country')
    localStorage.removeItem('thm-zip')
    localStorage.removeItem('thm-signup-id')
    window.dispatchEvent(new Event('thm-signed-up'))
    router.replace('/')
  }, [router])

  return null
}
