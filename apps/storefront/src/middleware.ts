import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { SUPPORTED_COUNTRIES, DEFAULT_COUNTRY } from '@/config/countries'

export async function middleware(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)
  
  const { pathname } = request.nextUrl
  
  // Check if pathname starts with a country code
  const pathnameHasCountry = SUPPORTED_COUNTRIES.some(
    (country) => pathname.startsWith(`/${country}/`) || pathname === `/${country}`
  )

  if (!pathnameHasCountry) {
    // Redirect to the default country
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_COUNTRY}${pathname}`
    return NextResponse.redirect(url)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|js|ico|txt|webmanifest)$).*)',
  ],
}
