'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Initial = {
  slug?: string | null
  name?: string | null
  description?: string | null
  starts_at?: string | null
  ends_at?: string | null
  location?: string | null
  meeting_url?: string | null
  capacity?: number | null
  is_published?: boolean | null
}

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  // Format as YYYY-MM-DDTHH:mm in local time for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventForm({ initial, mode }: { initial?: Initial; mode: 'create' | 'edit' }) {
  const router = useRouter()
  const [slug, setSlug] = useState(initial?.slug || '')
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [startsAt, setStartsAt] = useState(toLocalInputValue(initial?.starts_at))
  const [endsAt, setEndsAt] = useState(toLocalInputValue(initial?.ends_at))
  const [location, setLocation] = useState(initial?.location || '')
  const [meetingUrl, setMeetingUrl] = useState(initial?.meeting_url || '')
  const [capacity, setCapacity] = useState(initial?.capacity ? String(initial.capacity) : '')
  const [isPublished, setIsPublished] = useState(initial?.is_published || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim() || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      location: location.trim() || null,
      meeting_url: meetingUrl.trim() || null,
      capacity: capacity ? parseInt(capacity, 10) : null,
      is_published: isPublished,
    }

    const url = mode === 'create' ? '/api/admin/events' : `/api/admin/events/${initial?.slug}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/events')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Save failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Slug (URL)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          disabled={mode === 'edit'}
          placeholder="actionar"
          pattern="[a-z0-9\-]+"
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white font-mono disabled:opacity-50"
        />
        <p className="text-xs text-white/40 mt-1">Lowercase letters, numbers, hyphens only. Public URL: /event/{slug || '...'}</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Description (markdown)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white font-mono text-sm"
        />
        <p className="text-xs text-white/40 mt-1">Supports **bold**, *italic*, [link](url), and paragraph breaks.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Starts at (local time)</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Ends at (local time)</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Virtual"
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Meeting URL</label>
        <input
          type="url"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          placeholder="https://zoom.us/j/..."
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
        />
        <p className="text-xs text-white/40 mt-1">Included in the calendar invite. Not shown publicly until added to the .ics download.</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Capacity (optional)</label>
        <input
          type="number"
          min="0"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/20 rounded-md px-4 py-2.5 text-white"
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="font-body text-sm">Published (visible at /event/{slug || 'slug'})</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={loading}
          className="bg-sunrise text-black font-bold uppercase tracking-wider px-6 py-3 rounded-md hover:bg-sunrise/90 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="text-white/60 hover:text-white px-6 py-3"
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}
