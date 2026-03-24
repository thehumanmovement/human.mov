import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const existing = request.cookies.get('ab-variant')?.value
  if (existing === 'A' || existing === 'B') {
    return NextResponse.next()
  }

  const variant = Math.random() < 0.5 ? 'A' : 'B'
  const response = NextResponse.next()
  response.cookies.set('ab-variant', variant, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)'],
}
