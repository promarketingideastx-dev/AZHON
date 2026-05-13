import { createClient } from '@/utils/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { SUPPORTED_COUNTRIES } from '@/config/countries'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  
  let countryPrefix = '';
  const nextSegment = next.split('/')[1];
  if (nextSegment && SUPPORTED_COUNTRIES.includes(nextSegment)) {
    countryPrefix = `/${nextSegment}`;
  }
  const intent = requestUrl.searchParams.get('intent')
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
      let redirectUrl = countryPrefix || '/' // default

      if (authData?.user) {
        console.log(`[AUTH AUDIT] event: email_confirmed_or_session_started, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
        let { data: dbUser } = await supabase
          .from('User')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (intent === 'seller' && dbUser && dbUser.role !== 'SELLER' && dbUser.role !== 'SUPER_ADMIN') {
          console.log(`[AUTH AUDIT] event: upgrading_to_seller, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
          const { data: updatedUser, error: updateError } = await supabase
            .from('User')
            .update({ role: 'SELLER' })
            .eq('id', authData.user.id)
            .select('role')
            .single()
            
          if (!updateError && updatedUser) {
            dbUser = updatedUser
          } else {
            console.error("Error upgrading user to seller:", updateError)
          }
        }
          
        // Fetch locale from cookies or default to 'es'
        const locale = request.cookies.get('NEXT_LOCALE')?.value || 'es';

        // Check if welcome email was already sent (optional safeguard, but for now we send on first verification)
        // Since callback exchanges code, it's typically the first time.
        try {
          const { sendTransactionalEmail } = await import('@/lib/email');
          await sendTransactionalEmail({
            to: authData.user.email || '',
            event: 'welcome_buyer',
            locale,
          });
        } catch (e) {
          console.error("Failed to send welcome email:", e);
        }

        if (dbUser) {
          if (dbUser.role === 'SUPER_ADMIN') redirectUrl = `${countryPrefix}/admin`
          else if (dbUser.role === 'SELLER') redirectUrl = `${countryPrefix}/vendedor`
        }
      }

      // If there's an explicit safe next parameter, honor it over the default role-based routing
      if (next && next !== '/' && next !== countryPrefix && next.startsWith('/') && !next.startsWith('//')) {
         redirectUrl = next;
      }
      
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    
    console.error("Callback Error:", error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=true&msg=Error%20de%20autenticaci%C3%B3n', request.url))
}
