// Attribution helpers — capture UTMs, referrer, and landing path on first visit;
// persist in sessionStorage so they survive navigation within the same session;
// attach to signup submissions for last-touch attribution.

const STORAGE_KEY = 'thm-attribution'

export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  landing_path?: string
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/**
 * Capture attribution data from the current URL and document.referrer.
 * Stores in sessionStorage on first call so it survives navigation.
 * Safe to call repeatedly — overwrites only if new UTM params are present.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const current: Attribution = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) current[key] = value
  }

  // Only capture referrer if it's external (not our own domain)
  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    current.referrer = document.referrer
  }

  current.landing_path = window.location.pathname

  const existing = getStoredAttribution()

  // If the current URL has UTMs, update stored (last-touch wins).
  // Otherwise keep what's already stored (preserves attribution across page navigation).
  const hasNewUtms = UTM_KEYS.some((k) => current[k])
  const merged = hasNewUtms ? current : { ...current, ...existing }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // sessionStorage may be unavailable (private mode, etc.) — silently continue
  }

  return merged
}

/**
 * Retrieve stored attribution data for inclusion in signup payload.
 */
export function getStoredAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}
