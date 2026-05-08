import { redirect } from 'next/navigation'

// /admin is the landing point — send authenticated users to the events list.
// Middleware already gates this route, so unauthed visitors get bounced to /admin/login first.
export default function AdminIndexPage() {
  redirect('/admin/events')
}
