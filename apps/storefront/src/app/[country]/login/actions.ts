'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/utils/url'
import { headers } from 'next/headers'
import { SUPPORTED_COUNTRIES } from '@/config/countries'

function resolveCountryPrefix(formData: FormData) {
  const country = formData.get('country') as string;
  if (country && SUPPORTED_COUNTRIES.includes(country)) {
    return `/${country}`;
  }
  return '';
}

async function resolveRedirectUrl(supabase: any, formData: FormData) {
  const countryPrefix = resolveCountryPrefix(formData);
  const next = formData.get('next') as string;
  const intent = formData.get('intent') as string;

  // 1. next explícito manda
  if (next && next !== '/' && next !== countryPrefix && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }

  // 2. Estado real manda
  const { data: authData } = await supabase.auth.getUser();
  if (authData?.user) {
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (dbUser) {
      if (dbUser.role === 'SUPER_ADMIN') return `${countryPrefix}/admin`;
      if (dbUser.role === 'SELLER') return `${countryPrefix}/vendedor`;
    }
  }

  // 3. Fallback (intent como hint final)
  if (intent === 'seller') return `${countryPrefix}/vendedor/onboarding`;
  
  return `${countryPrefix || '/'}/perfil`;
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

  // Safe routing after auth
  const redirectUrl = await resolveRedirectUrl(supabase, formData);

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

  const countryPrefixSignup = resolveCountryPrefix(formData);
  
  let targetNext = formData.get('next') as string;
  if (!targetNext || targetNext === '/' || targetNext === countryPrefixSignup || !targetNext.startsWith('/') || targetNext.startsWith('//')) {
    // Si no hay next explícito, el default dependerá del intent
    targetNext = intent === 'seller' ? `${countryPrefixSignup}/vendedor/onboarding` : `${countryPrefixSignup || '/'}/perfil`;
  }

  const intentParamSignup = intent ? `&intent=${intent}` : ''
  const options: any = {
    emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(targetNext)}${intentParamSignup}`
  }

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
    const target = `${countryPrefixSignup || '/'}/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(data.email)}${intentParamSignup}`;
    console.log(`[AZHON_AUTH_TRACE] signup:redirect_to, target: ${target.replace(data.email, maskEmail(data.email))}`);
    redirect(target)
  }

  // If auto-login happened
  const redirectUrl = await resolveRedirectUrl(supabase, formData);

  revalidatePath('/', 'layout')
  console.log(`[AZHON_AUTH_TRACE] signup:success_auto_login, redirect_to: ${redirectUrl}`)
  redirect(redirectUrl)
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string

  const countryPrefixReset = resolveCountryPrefix(formData);
  
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

  const countryPrefixOAuth = resolveCountryPrefix(formData);
  
  let targetNext = nextParam;
  if (!targetNext || targetNext === '/' || targetNext === countryPrefixOAuth || !targetNext.startsWith('/') || targetNext.startsWith('//')) {
    targetNext = intent === 'seller' ? `${countryPrefixOAuth}/vendedor/onboarding` : `${countryPrefixOAuth || '/'}/perfil`;
  }

  const intentParam = intent ? `&intent=${intent}` : ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(targetNext)}${intentParam}`,
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

export async function logout(country?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // AuthAudit Base: signout_completed
    console.log(`[AUTH AUDIT] event: signout_completed, user_id: ${user.id}, date: ${new Date().toISOString()}`)
  }

  // No formData available here, fallback to home
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  if (country) {
    redirect(`/${country}`)
  } else {
    redirect(`/`)
  }
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

  const countryPrefixResend = resolveCountryPrefix(formData);
  let targetNext = nextParam;
  if (!targetNext || targetNext === '/' || targetNext === countryPrefixResend || !targetNext.startsWith('/') || targetNext.startsWith('//')) {
    targetNext = intent === 'seller' ? `${countryPrefixResend}/vendedor/onboarding` : `${countryPrefixResend || '/'}/perfil`;
  }

  const intentParamResend = intent ? `&intent=${intent}` : ''
  const options: any = {
    emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(targetNext)}${intentParamResend}`
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

  const countryPrefixVerifyResend = resolveCountryPrefix(formData);
  console.log(`[AZHON_AUTH_TRACE] resend:success_redirect_to_verify`)
  redirect(`${countryPrefixVerifyResend || '/'}/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(email)}${intentParamResend}`)
}
