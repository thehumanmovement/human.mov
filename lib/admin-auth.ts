// Single-password admin auth.
// Works in both Edge Runtime (middleware) and Node Runtime (API routes) by
// using Web Crypto (subtle.sign) which is available in both.

import { cookies } from 'next/headers'

const COOKIE_NAME = 'thm-admin-session'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 hours

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET env var must be set (32+ chars)')
  }
  return s
}

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return hexEncode(sig)
}

// Constant-time string comparison (works in Edge Runtime — no Buffer/Node crypto).
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || ''
  if (!expected) return false
  return constantTimeEqual(input, expected)
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = `admin:${expiresAt}`
  const sig = await hmacHex(getSecret(), payload)
  return `${payload}:${sig}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split(':')
  if (parts.length !== 3) return false
  const [user, expiresAt, sig] = parts
  if (user !== 'admin') return false
  const expectedSig = await hmacHex(getSecret(), `${user}:${expiresAt}`)
  if (!constantTimeEqual(sig, expectedSig)) return false
  const exp = parseInt(expiresAt, 10)
  if (!Number.isFinite(exp) || Date.now() / 1000 > exp) return false
  return true
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
}
