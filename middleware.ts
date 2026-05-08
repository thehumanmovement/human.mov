import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth'

// Protect /admin/* routes (except /admin/login itself).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login page and login API are public
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const valid = await verifySessionToken(token)
    if (!valid) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = `?from=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
