'use server'

import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/utils/url'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { normalizeAuthNext } from '@/utils/url'
import dns from 'dns';

// Domain typos mapping
const COMMON_TYPOS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlook.co': 'outlook.com',
  'yaho.com': 'yahoo.com'
};

// Helper to mask email for safe logging
const maskEmail = (e: string) => e ? e.replace(/(.{2})(.*)(?=@)/, "$1***") : 'unknown';

async function resolveDestination(supabase: any, country: string, next: string | null, intent: string | null) {
  const countryPrefix = `/${country}`;

  // Business state has priority over intent and next
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

  return normalizeAuthNext({ country, intent, next });
}

function getErrorKey(message: string, intent?: string | null) {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'err_invalid_creds';
  if (msg.includes('already registered')) {
    if (intent === 'seller') return 'err_email_exists_seller';
    return 'err_email_exists';
  }
  if (msg.includes('rate limit') || msg.includes('for security purposes') || msg.includes('too many requests')) {
    return 'err_rate_limited';
  }
  if (msg.includes('password')) {
    return 'err_password_policy';
  }
  if (msg.includes('database error')) {
    // A database error during signup is almost always an orphaned public.User trigger constraint.
    // It's safer to treat them as existing users and direct them to login.
    if (intent === 'seller') return 'err_email_exists_seller';
    return 'err_email_exists';
  }
  return 'err_generic';
}

function buildQueryString(params: Record<string, string | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.append(key, value);
  }
  const str = query.toString();
  return str ? `?${str}` : '';
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient()
  const country = formData.get('country') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const intent = formData.get('intent') as string | null
  const rawNext = formData.get('next') as string | null
  const nextParam = normalizeAuthNext({ country, intent, next: rawNext })

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  const qs = buildQueryString({ error: error ? getErrorKey(error.message, intent) : null, intent, next: nextParam });

  if (error) {
    redirect(`/${country}/auth-v2/login${qs}`)
  }

  const destination = await resolveDestination(supabase, country, nextParam, intent);

  // PROFILE COMPLETION GATE (PREVENT VISUAL BOUNCE)
  if (authData?.user) {
    const dbUserFull = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { BuyerProfile: true }
    });
    
    const isProfileComplete = dbUserFull?.phone && dbUserFull?.BuyerProfile?.fullName;
    
    if (!isProfileComplete) {
      console.log(`[AZHON_AUTH_V2_TRACE] loginAction:profile_incomplete, redirecting to complete-profile`);
      const nextPath = encodeURIComponent(destination);
      
      const cookieStore = await cookies();
      const finalIntent = intent || 'buyer';
      cookieStore.set('azhon_auth_intent', finalIntent, { maxAge: 3600, path: '/', sameSite: 'lax' });
      if (destination) {
        cookieStore.set('azhon_auth_next', destination, { maxAge: 3600, path: '/', sameSite: 'lax' });
      }

      redirect(`/${country}/auth-v2/complete-profile?intent=${finalIntent}&next=${nextPath}`);
    }
  }
  
  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signupAction(formData: FormData) {
  const country = formData.get('country') as string
  const rawEmail = formData.get('email') as string
  const email = rawEmail?.trim().toLowerCase()
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string
  const intent = formData.get('intent') as string | null
  const rawNext = formData.get('next') as string | null
  const nextParam = normalizeAuthNext({ country, intent, next: rawNext })

  console.log('[AZHON_AUTH_V2_TRACE]', {
    step: 'signup:start',
    intent,
    hasNext: Boolean(nextParam),
    country,
    emailMasked: maskEmail(email),
  });

  if (!email || !email.includes('@')) {
    const qs = buildQueryString({ error: 'err_invalid_email', intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`);
  }

  const [localPart, domain] = email.split('@');
  if (!domain || !domain.includes('.')) {
    const qs = buildQueryString({ error: 'err_invalid_email', intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`);
  }

  if (COMMON_TYPOS[domain]) {
    const qs = buildQueryString({ error: 'err_domain_typo', intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`);
  }

  // DNS MX Check
  let dnsError: string | null = null;
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      dnsError = 'err_domain_not_found';
    }
  } catch (err: any) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      try {
        const aRecords = await dns.promises.resolve4(domain);
        if (!aRecords || aRecords.length === 0) {
          dnsError = 'err_domain_not_found';
        }
      } catch (fallbackErr) {
        dnsError = 'err_domain_not_found';
      }
    } else {
      dnsError = 'err_domain_check_failed';
    }
  }

  if (dnsError) {
    const qs = buildQueryString({ error: dnsError, intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`);
  }

  const cookieStore = await cookies();
  
  // DUPLICATE EMAIL GUARD
  const existingUser = await prisma.user.findFirst({
    where: { email }
  });

  if (existingUser) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:email_already_exists_blocking' });
    if (intent) cookieStore.set('azhon_auth_intent', intent, { maxAge: 3600, path: '/', sameSite: 'lax' });
    if (nextParam) cookieStore.set('azhon_auth_next', nextParam, { maxAge: 3600, path: '/', sameSite: 'lax' });
    const errorKey = intent === 'seller' ? 'err_email_exists_seller' : 'err_email_exists';
    const qs = buildQueryString({ error: errorKey, intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`);
  }

  if (intent) cookieStore.set('azhon_auth_intent', intent, { maxAge: 3600, path: '/', sameSite: 'lax' });
  if (nextParam) cookieStore.set('azhon_auth_next', nextParam, { maxAge: 3600, path: '/', sameSite: 'lax' });

  const supabase = await createClient()

  if (password !== passwordConfirm) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:password_mismatch_redirecting' });
    const qs = buildQueryString({ error: 'err_pass_mismatch', intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`)
  }

  // Determine the final destination for the callback redirect
  const destination = await resolveDestination(supabase, country, nextParam, intent);
  const intentParam = intent ? `&intent=${intent}` : '';
  const emailRedirectTo = `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(destination)}${intentParam}`;
  
  console.log('[AZHON_AUTH_V2_TRACE]', {
    step: 'signup:destination_resolved',
    destination,
    emailRedirectTo_hasValue: Boolean(emailRedirectTo)
  });

  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:supabase_call_start' });
  
  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:metadata_attached', auth_intent: intent, auth_next: nextParam, auth_country: country });

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        auth_intent: intent || null,
        auth_next: nextParam || null,
        auth_country: country || null
      }
    }
  })

  console.log('[AZHON_AUTH_V2_TRACE]', { 
    step: 'signup:supabase_call_end',
    hasData: !!authData, 
    hasSession: !!authData?.session, 
    hasUser: !!authData?.user, 
    success: !error,
    error: error ? { message: error.message, status: error.status, name: error.name } : null 
  });

  if (error) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:redirecting_due_to_error', errorKey: getErrorKey(error.message, intent) });
    const qs = buildQueryString({ error: getErrorKey(error.message, intent), intent, next: nextParam });
    redirect(`/${country}/auth-v2/signup${qs}`)
  }

  if (!authData.session) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:no_session_redirecting_to_verify' });
    // Requires email confirmation
    const qs = buildQueryString({ email, intent, next: nextParam });
    redirect(`/${country}/auth-v2/verify${qs}`)
  }

  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'signup:auto_login_success_redirecting' });
  // Auto-login successful (e.g., if confirmation is disabled)
  const autoDestination = await resolveDestination(supabase, country, nextParam, intent);
  revalidatePath('/', 'layout')
  redirect(autoDestination)
}

export async function resendVerifyAction(formData: FormData) {
  const supabase = await createClient()
  const country = formData.get('country') as string
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string | null
  const rawNext = formData.get('next') as string | null
  const nextParam = normalizeAuthNext({ country, intent, next: rawNext })

  if (!email) {
    redirect(`/${country}/auth-v2/login`)
  }

  console.log('[AZHON_AUTH_V2_TRACE]', {
    step: 'verify:resend_start',
    emailMasked: maskEmail(email),
    intent,
    hasNext: Boolean(nextParam),
    country
  });

  const destination = await resolveDestination(supabase, country, nextParam, intent);
  const intentParam = intent ? `&intent=${intent}` : '';
  
  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'verify:resend_supabase_call_start' });
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(destination)}${intentParam}`
    }
  })

  console.log('[AZHON_AUTH_V2_TRACE]', { 
    step: 'verify:resend_supabase_call_end',
    success: !error,
    error: error ? 'Supabase Auth Error' : null
  });

  if (error) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'verify:resend_redirect_error' });
    const qs = buildQueryString({ error: getErrorKey(error.message, intent), email, intent, next: nextParam });
    redirect(`/${country}/auth-v2/verify${qs}`)
  }

  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'verify:resend_redirect_success' });
  // Si fue exitoso, redirigimos a login con el mensaje de revisar correo
  const qs = buildQueryString({ msg: 'msg_check_email', intent, next: nextParam });
  redirect(`/${country}/auth-v2/login${qs}`)
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient()
  const country = formData.get('country') as string
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/api/auth/callback?next=/${country}/auth-v2/reset-password`,
  })

  if (error) {
    const qs = buildQueryString({ error: getErrorKey(error.message) });
    redirect(`/${country}/auth-v2/forgot-password${qs}`)
  }

  const qs = buildQueryString({ msg: 'msg_check_email_reset' });
  redirect(`/${country}/auth-v2/login${qs}`)
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()
  const country = formData.get('country') as string
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  if (password !== passwordConfirm) {
    const qs = buildQueryString({ error: 'err_pass_mismatch' });
    redirect(`/${country}/auth-v2/reset-password${qs}`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    const qs = buildQueryString({ error: getErrorKey(error.message) });
    redirect(`/${country}/auth-v2/reset-password${qs}`)
  }

  const qs = buildQueryString({ msg: 'msg_password_updated' });
  redirect(`/${country}/auth-v2/login${qs}`)
}

export async function googleOAuthAction(formData: FormData) {
  const supabase = await createClient()
  const country = formData.get('country') as string
  const intent = formData.get('intent') as string | null
  const rawNext = formData.get('next') as string | null
  const nextParam = normalizeAuthNext({ country, intent, next: rawNext })

  const destination = await resolveDestination(supabase, country, nextParam, intent);
  const intentParam = intent ? `&intent=${intent}` : '';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/api/auth/callback?next=${encodeURIComponent(destination)}${intentParam}`,
    },
  })

  if (error) {
    const qs = buildQueryString({ error: getErrorKey(error.message), intent, next: nextParam });
    redirect(`/${country}/auth-v2/login${qs}`)
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
             urlObj.hostname = supabaseObj.hostname;
             urlObj.protocol = supabaseObj.protocol;
             urlObj.port = supabaseObj.port;
             finalUrl = urlObj.toString();
          }
        } catch (e) {}
      }
    }
    
    redirect(finalUrl);
  }
}

export async function completeProfileAction(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const intent = formData.get('intent') as string;
  const rawNext = formData.get('next') as string;
  const country = formData.get('country') as string || 'hn';
  const nextParam = normalizeAuthNext({ country, intent, next: rawNext });

  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'complete_profile:start', intent, nextParam, country });

  // Basic validation
  if (!firstName || !firstName.trim() || !lastName || !lastName.trim() || !phone || !phone.trim()) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'complete_profile:validation_failed', reason: 'missing_fields' });
    const qs = buildQueryString({ error: 'err_profile_required', intent, next: nextParam });
    redirect(`/${country}/auth-v2/complete-profile${qs}`);
  }

  // Very basic phone validation (just check length for safety, allow + and digits)
  const phoneRegex = /^\+?[0-9\s\-]{8,15}$/;
  if (!phoneRegex.test(phone)) {
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'complete_profile:validation_failed', reason: 'invalid_phone' });
    const qs = buildQueryString({ error: 'err_invalid_phone', intent, next: nextParam });
    redirect(`/${country}/auth-v2/complete-profile${qs}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/auth-v2/login`);
  }

  const fullName = `${firstName.trim()} ${lastName.trim()}`;

  try {
    // 1. Update User phone
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: phone.trim() }
    });

    // 2. Upsert BuyerProfile
    await prisma.buyerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: fullName
      },
      update: {
        fullName: fullName
      }
    });
    
    console.log('[AZHON_AUTH_V2_TRACE]', { step: 'complete_profile:saved' });
  } catch (error) {
    console.error('[AZHON_AUTH_V2_TRACE] complete_profile:error_saving', error);
    const qs = buildQueryString({ error: 'err_generic', intent, next: nextParam });
    redirect(`/${country}/auth-v2/complete-profile${qs}`);
  }

  // 3. Resolve destination
  const redirectUrl = nextParam;

  console.log('[AZHON_AUTH_V2_TRACE]', { step: 'complete_profile:redirecting', target: redirectUrl });
  redirect(redirectUrl);
}
