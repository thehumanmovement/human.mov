import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-uuid-123' },
            error: null,
          })),
        })),
      })),
    })),
  },
}))

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ data: { id: 'email-id' }, error: null })),
    },
  })),
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
  generateCode: vi.fn(() => '123456'),
}))

describe('POST /api/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
  })

  it('rejects missing full name', async () => {
    const { POST } = await import('@/app/api/signup/route')
    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName: '', email: 'test@test.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('name')
  })

  it('rejects missing email', async () => {
    const { POST } = await import('@/app/api/signup/route')
    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'John Doe', email: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('Email')
  })

  it('accepts valid signup and returns id', async () => {
    const { POST } = await import('@/app/api/signup/route')
    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'Jane Doe', email: 'jane@example.com', zipCode: '10001' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.id).toBe('test-uuid-123')
  })
})
