// Server-side event data access. Uses the existing Supabase client.

import { supabase } from './supabase'

export type Event = {
  id: string
  slug: string
  name: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location: string | null
  meeting_url: string | null
  capacity: number | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type EventRsvp = {
  id: number
  event_id: string
  email: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  referrer: string | null
  created_at: string
}

export async function getPublishedEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (error) {
    console.error('getPublishedEventBySlug error:', error)
    return null
  }
  return data as Event | null
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error('getEventBySlug error:', error)
    return null
  }
  return data as Event | null
}

export async function listAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('listAllEvents error:', error)
    return []
  }
  return (data || []) as Event[]
}

export async function listRsvpsForEvent(eventId: string): Promise<EventRsvp[]> {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('listRsvpsForEvent error:', error)
    return []
  }
  return (data || []) as EventRsvp[]
}
