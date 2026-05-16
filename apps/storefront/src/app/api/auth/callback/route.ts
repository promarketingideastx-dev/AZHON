import { createClient } from '@/utils/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { SUPPORTED_COUNTRIES } from '@/config/countries'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = request.cookies
  const intentCookie = cookieStore.get('azhon_auth_intent')?.value
  const nextCookie = cookieStore.get('azhon_auth_next')?.value

  const next = requestUrl.searchParams.get('next') || nextCookie || '/'
  const intent = requestUrl.searchParams.get('intent') || intentCookie || null

  let countryPrefix = '';
  const nextSegment = next.split('/')[1];
  if (nextSegment && SUPPORTED_COUNTRIES.includes(nextSegment)) {
    countryPrefix = `/${nextSegment}`;
  }
  const authError = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (authError || errorDescription) {
    console.error(`[AZHON_AUTH_V2_TRACE] callback:error_param, error: ${authError}, desc: ${errorDescription}`);
    console.error(`[AUTH AUDIT] event: confirmation_error, error: ${authError}, desc: ${errorDescription}, date: ${new Date().toISOString()}`)
    return NextResponse.redirect(new URL(`/login?error=err_generic&msg=${encodeURIComponent('Enlace inválido o expirado. Intenta de nuevo.')}`, request.url))
  }

  console.log(`[AZHON_AUTH_V2_TRACE] callback:start, has_code: ${!!code}, intent: ${intent}, next: ${next}`);

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log(`[AZHON_AUTH_V2_TRACE] callback:session_exchange_ok`);
      // Handle safe routing post auth based on role
      const { data: authData } = await supabase.auth.getUser()
      let redirectUrl = countryPrefix || '/' // default

      if (authData?.user) {
        console.log(`[AZHON_AUTH_V2_TRACE] callback:user_authenticated, user_id: ${authData.user.id}`);
        console.log(`[AUTH AUDIT] event: email_confirmed_or_session_started, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
        let { data: dbUser } = await supabase
          .from('User')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        console.log(`[AZHON_AUTH_V2_TRACE] callback:initial_role, role: ${dbUser?.role || 'none'}`);

        // NO ROLE MUTATION HERE. Auth callback should not alter business roles.
        // Role upgrade will happen only after seller onboarding approval.
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

        // Redirection Precedence (state -> next)
        if (dbUser) {
          if (dbUser.role === 'SUPER_ADMIN') redirectUrl = `${countryPrefix}/admin`;
          else if (dbUser.role === 'SELLER') redirectUrl = `${countryPrefix}/vendedor`;
          else redirectUrl = `${countryPrefix || '/'}/perfil`; // Default for BUYER
        }
      }

      // If there's an explicit safe next parameter, honor it over the default role-based routing
      if (next && next !== '/' && next !== countryPrefix && next.startsWith('/') && !next.startsWith('//')) {
         redirectUrl = next;
      } else if (intent === 'seller' && redirectUrl === `${countryPrefix || '/'}/perfil`) {
         // Fallback to onboarding if intent is seller and we are falling back to default buyer profile
         redirectUrl = `${countryPrefix}/vendedor/onboarding`;
      }
      
      console.log(`[AZHON_AUTH_V2_TRACE] callback:final_redirect, target: ${redirectUrl}`);
      const response = NextResponse.redirect(new URL(redirectUrl, request.url))
      
      // Clear the fallback cookies
      response.cookies.delete('azhon_auth_intent')
      response.cookies.delete('azhon_auth_next')
      
      return response
    }
    
    console.error(`[AZHON_AUTH_V2_TRACE] callback:session_exchange_failed`, error);
    console.error("Callback Error:", error)
  }

  console.error(`[AZHON_AUTH_V2_TRACE] callback:fallback_error_redirect`);
  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=true&msg=Error%20de%20autenticaci%C3%B3n', request.url))
}
