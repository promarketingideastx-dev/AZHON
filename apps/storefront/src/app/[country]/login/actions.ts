'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/utils/url'
import { headers } from 'next/headers'
import { SUPPORTED_COUNTRIES } from '@/config/countries'

async function getCountryPrefix() {
  try {
    const headersList = await headers();
    const referer = headersList.get('referer');
    if (referer) {
      const path = new URL(referer).pathname;
      const segment = path.split('/')[1];
      if (segment && SUPPORTED_COUNTRIES.includes(segment)) {
        return `/${segment}`;
      }
    }
  } catch (e) {
    console.error("Error parsing referer for country", e);
  }
  return '';
}

function getErrorKey(message: string) {
  if (message.includes('Invalid login credentials')) return 'err_invalid_creds';
  if (message.includes('already registered')) return 'err_generic'; // or specific if needed
  return 'err_generic';
}

function maskEmail(email: string) {
  if (!email) return 'null';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  if (name.length <= 2) return `***@${parts[1]}`;
  return `${name.substring(0, 2)}***@${parts[1]}`;
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const intent = formData.get('intent') as string

  console.log(`[AZHON_AUTH_TRACE] login:start, email: ${maskEmail(data.email)}, intent: ${intent}`);

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(`[AZHON_AUTH_TRACE] login:supabase_error, msg: ${error.message}`)
    const intentParam = intent ? `&intent=${intent}` : ''
    console.log(`[AZHON_AUTH_TRACE] login:redirect_to, target: /login?error=${getErrorKey(error.message)}`)
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  // Safe routing after auth based on Role
  const countryPrefix = await getCountryPrefix()
  let redirectUrl = countryPrefix || '/'
  const next = formData.get('next') as string
  
  if (authData?.user) {
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('id', authData.user.id)
      .single()
      
    if (dbUser) {
      if (dbUser.role === 'SUPER_ADMIN') redirectUrl = `${countryPrefix}/admin`
      else if (dbUser.role === 'SELLER') redirectUrl = `${countryPrefix}/vendedor`
      else if (intent === 'seller') redirectUrl = `${countryPrefix}/vendedor/onboarding` // Shell routing for seller intent
    }
  }

  // If there's an explicit next parameter and it's a valid relative path, honor it over the default role-based routing
  if (next && next !== '/' && next !== countryPrefix && next.startsWith('/') && !next.startsWith('//')) {
    redirectUrl = next
  }

  // AuthAudit Base: signin_success
  console.log(`[AZHON_AUTH_TRACE] login:success, user_id: ${authData.user?.id}, target_url: ${redirectUrl}`)
  console.log(`[AUTH AUDIT] event: signin_success, user_id: ${authData.user?.id}, date: ${new Date().toISOString()}`)

  revalidatePath('/', 'layout')
  console.log(`[AZHON_AUTH_TRACE] login:redirect_to, target: ${redirectUrl}`)
  redirect(redirectUrl)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  if (passwordConfirm && password !== passwordConfirm) {
    const intentParam = formData.get('intent') as string ? `&intent=${formData.get('intent')}` : ''
    redirect(`/login?error=err_pass_mismatch${intentParam}`)
  }

  const data = {
    email: formData.get('email') as string,
    password: password,
  }
  const intent = formData.get('intent') as string
  const nextParam = formData.get('next') as string

  console.log(`[AZHON_AUTH_TRACE] signup:start, email: ${maskEmail(data.email)}, intent: ${intent}, next: ${nextParam}`);

  if (intent === 'seller') {
    // AuthAudit Base: seller_registration_intent_detected
    console.log(`[AUTH AUDIT] event: seller_registration_intent_detected, email: ${maskEmail(data.email)}, date: ${new Date().toISOString()}`)
  }

  const options: any = {}
  
  const countryPrefixSignup = await getCountryPrefix();
  let safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;
  let defaultNext = intent === 'seller' ? `${countryPrefixSignup}/vendedor/onboarding` : `${countryPrefixSignup || '/'}`;
  const nextPath = safeNext || defaultNext;

  const intentParamSignup = intent ? `&intent=${intent}` : ''
  options.emailRedirectTo = `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(nextPath)}${intentParamSignup}`

  const { data: authData, error } = await supabase.auth.signUp({
    ...data,
    options
  })

  console.log(`[AZHON_AUTH_TRACE] signup:supabase_response, error: ${error?.message || 'none'}, user_created: ${!!authData?.user}, session_created: ${!!authData?.session}`);

  if (error) {
    console.error(`[AZHON_AUTH_TRACE] signup:supabase_error, msg: ${error.message}`)
    const intentParam = intent ? `&intent=${intent}` : ''
    console.log(`[AZHON_AUTH_TRACE] signup:redirect_to, target: /login?error=${getErrorKey(error.message)}`)
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  // AuthAudit Base: account_created
  console.log(`[AUTH AUDIT] event: account_created, email: ${maskEmail(data.email)}, date: ${new Date().toISOString()}`)

  // GoTrue returns a session if auto-confirm is enabled or if verification is off.
  // If session is null, email confirmation is required.
  if (!authData.session) {
    console.log(`[AZHON_AUTH_TRACE] signup:session_null_redirecting_to_verify`);
    // AuthAudit Base: email_confirmation_sent
    console.log(`[AUTH AUDIT] event: email_confirmation_sent, email: ${maskEmail(data.email)}, date: ${new Date().toISOString()}`)
    const countryPrefixVerify = await getCountryPrefix();
    const target = `${countryPrefixVerify || '/'}/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(data.email)}${intentParamSignup}`;
    console.log(`[AZHON_AUTH_TRACE] signup:redirect_to, target: ${target.replace(data.email, maskEmail(data.email))}`);
    redirect(target)
  }

  // If auto-login happened
  const countryPrefixAuto = await getCountryPrefix();
  let redirectUrl = countryPrefixAuto || '/'

  if (authData?.user) {
    // AuthAudit Base: signup_completed
    console.log(`[AUTH AUDIT] event: signup_completed, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('id', authData.user.id)
      .single()
      
    if (dbUser) {
      if (dbUser.role === 'SUPER_ADMIN') redirectUrl = `${countryPrefixAuto}/admin`
      else if (dbUser.role === 'SELLER') redirectUrl = `${countryPrefixAuto}/vendedor`
      else if (intent === 'seller') redirectUrl = `${countryPrefixAuto}/vendedor/onboarding`
    }
  }

  // If there's an explicit next parameter and it's a valid relative path, honor it over the default role-based routing
  if (nextParam && nextParam !== '/' && nextParam !== countryPrefixAuto && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    redirectUrl = nextParam
  }

  revalidatePath('/', 'layout')
  console.log(`[AZHON_AUTH_TRACE] signup:success_auto_login, redirect_to: ${redirectUrl}`)
  redirect(redirectUrl)
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string

  const countryPrefixReset = await getCountryPrefix();
  
  // We assume the user wants to reset their password
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/api/auth/callback?next=${countryPrefixReset || '/'}/reset-password`,
  })

  const intentParam = intent ? `&intent=${intent}` : ''

  if (error) {
    redirect(`${countryPrefixReset || '/'}/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  redirect(`${countryPrefixReset || '/'}/login?msg=msg_check_email_reset${intentParam}`)
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const intent = formData.get('intent') as string
  const nextParam = formData.get('next') as string

  console.log(`[AZHON_AUTH_TRACE] google:start, intent: ${intent}, next: ${nextParam}`);

  const countryPrefixOAuth = await getCountryPrefix();
  let safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;
  let defaultNext = intent === 'seller' ? `${countryPrefixOAuth}/vendedor/onboarding` : `${countryPrefixOAuth || '/'}`;
  const nextPath = safeNext || defaultNext;

  const intentParam = intent ? `&intent=${intent}` : ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(nextPath)}${intentParam}`,
    },
  })

  if (error) {
    console.error(`[AZHON_AUTH_TRACE] google:supabase_error, msg: ${error.message}`)
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  if (data?.url) {
    let finalUrl = data.url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (supabaseUrl) {
      if (!finalUrl.startsWith('http')) {
        finalUrl = `${supabaseUrl}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
      } else {
        try {
          const urlObj = new URL(finalUrl);
          const supabaseObj = new URL(supabaseUrl);
          if (urlObj.hostname !== supabaseObj.hostname) {
            console.warn(`[OAUTH WARN] Fixing incorrect OAuth hostname: ${urlObj.hostname} -> ${supabaseObj.hostname}`);
            urlObj.hostname = supabaseObj.hostname;
            urlObj.protocol = supabaseObj.protocol;
            urlObj.port = supabaseObj.port;
            finalUrl = urlObj.toString();
          }
        } catch (e) {
          console.error("[OAUTH ERROR] Failed to parse URL", e);
        }
      }
    }
    
    return { url: finalUrl };
  }
}

export async function logout() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // AuthAudit Base: signout_completed
    console.log(`[AUTH AUDIT] event: signout_completed, user_id: ${user.id}, date: ${new Date().toISOString()}`)
  }

  const countryPrefixLogout = await getCountryPrefix();
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(`${countryPrefixLogout || '/'}/login`)
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string
  const nextParam = formData.get('next') as string
  
  console.log(`[AZHON_AUTH_TRACE] resend:start, email: ${maskEmail(email)}, intent: ${intent}`);

  if (!email) {
    redirect(`/login?error=err_generic`)
  }

  const countryPrefixResend = await getCountryPrefix();
  let safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null;
  let defaultNext = intent === 'seller' ? `${countryPrefixResend}/vendedor/onboarding` : `${countryPrefixResend || '/'}`;
  const nextPath = safeNext || defaultNext;

  const intentParamResend = intent ? `&intent=${intent}` : ''
  const options: any = {
    emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(nextPath)}${intentParamResend}`
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options
  })

  // AuthAudit Base: confirmation_resent
  console.log(`[AUTH AUDIT] event: confirmation_resent, email: ${maskEmail(email)}, date: ${new Date().toISOString()}`)

  if (error) {
    console.error(`[AZHON_AUTH_TRACE] resend:error, msg: ${error.message}`)
    const intentParam = intent ? `&intent=${intent}` : ''
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  const countryPrefixVerifyResend = await getCountryPrefix();
  console.log(`[AZHON_AUTH_TRACE] resend:success_redirect_to_verify`)
  redirect(`${countryPrefixVerifyResend || '/'}/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(email)}${intentParamResend}`)
}
