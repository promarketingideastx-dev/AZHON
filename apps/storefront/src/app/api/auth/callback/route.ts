import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const authError = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (authError || errorDescription) {
    console.error(`[AUTH AUDIT] event: confirmation_error, error: ${authError}, desc: ${errorDescription}, date: ${new Date().toISOString()}`)
    return NextResponse.redirect(new URL(`/login?error=err_generic&msg=${encodeURIComponent('Enlace inválido o expirado. Intenta de nuevo.')}`, request.url))
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Handle safe routing post auth based on role
      const { data: authData } = await supabase.auth.getUser()
      let redirectUrl = next
      
      if (authData?.user && next === '/') {
        console.log(`[AUTH AUDIT] event: email_confirmed_or_session_started, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
        const { data: dbUser } = await supabase
          .from('User')
          .select('role')
          .eq('id', authData.user.id)
          .single()
          
        if (dbUser) {
          if (dbUser.role === 'SUPER_ADMIN') redirectUrl = '/admin'
          else if (dbUser.role === 'SELLER') redirectUrl = '/vendedor'
        }
      }
      
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    
    console.error("Callback Error:", error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=true&msg=Error%20de%20autenticaci%C3%B3n', request.url))
}
