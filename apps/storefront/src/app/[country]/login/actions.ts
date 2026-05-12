'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/utils/url'

function getErrorKey(message: string) {
  if (message.includes('Invalid login credentials')) return 'err_invalid_creds';
  if (message.includes('already registered')) return 'err_generic'; // or specific if needed
  return 'err_generic';
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const intent = formData.get('intent') as string

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("LOGIN ERROR:", error.message)
    const intentParam = intent ? `&intent=${intent}` : ''
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  // Safe routing after auth based on Role
  let redirectUrl = '/'
  if (authData?.user) {
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('id', authData.user.id)
      .single()
      
    if (dbUser) {
      if (dbUser.role === 'SUPER_ADMIN') redirectUrl = '/admin'
      else if (dbUser.role === 'SELLER') redirectUrl = '/vendedor'
      else if (intent === 'seller') redirectUrl = '/vendedor/onboarding' // Shell routing for seller intent
    }
  }

  // AuthAudit Base: signin_success
  console.log(`[AUTH AUDIT] event: signin_success, user_id: ${authData.user?.id}, date: ${new Date().toISOString()}`)


  revalidatePath('/', 'layout')
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

  if (intent === 'seller') {
    // AuthAudit Base: seller_registration_intent_detected
    console.log(`[AUTH AUDIT] event: seller_registration_intent_detected, email: ${data.email}, date: ${new Date().toISOString()}`)
  }

  const options: any = {}
  if (intent === 'seller') {
    // Pass intent via the next param in the callback URL
    options.emailRedirectTo = `${getSiteUrl()}/api/auth/callback?next=/vendedor/onboarding`
  }

  const { data: authData, error } = await supabase.auth.signUp({
    ...data,
    options
  })

  if (error) {
    console.error("SIGNUP ERROR:", error.message)
    const intentParam = intent ? `&intent=${intent}` : ''
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  // AuthAudit Base: account_created
  console.log(`[AUTH AUDIT] event: account_created, email: ${data.email}, date: ${new Date().toISOString()}`)

  // GoTrue returns a session if auto-confirm is enabled or if verification is off.
  // If session is null, email confirmation is required.
  if (!authData.session) {
    // AuthAudit Base: email_confirmation_sent
    console.log(`[AUTH AUDIT] event: email_confirmation_sent, email: ${data.email}, date: ${new Date().toISOString()}`)
    redirect(`/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(data.email)}`)
  }

  // If auto-login happened
  let redirectUrl = '/'
  if (authData?.user) {
    // AuthAudit Base: signup_completed
    console.log(`[AUTH AUDIT] event: signup_completed, user_id: ${authData.user.id}, date: ${new Date().toISOString()}`)
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('id', authData.user.id)
      .single()
      
    if (dbUser) {
      if (dbUser.role === 'SUPER_ADMIN') redirectUrl = '/admin'
      else if (dbUser.role === 'SELLER') redirectUrl = '/vendedor'
      else if (intent === 'seller') redirectUrl = '/vendedor/onboarding'
    }
  }

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string

  // We assume the user wants to reset their password
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/api/auth/callback?next=/reset-password`,
  })

  const intentParam = intent ? `&intent=${intent}` : ''

  if (error) {
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  redirect(`/login?msg=msg_check_email_reset${intentParam}`)
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const intent = formData.get('intent') as string

  const nextPath = intent === 'seller' ? '/vendedor/onboarding' : '/'
  const intentParam = intent ? `&intent=${intent}` : ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/api/auth/callback?next=${nextPath}`,
    },
  })

  if (error) {
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // AuthAudit Base: signout_completed
    console.log(`[AUTH AUDIT] event: signout_completed, user_id: ${user.id}, date: ${new Date().toISOString()}`)
  }

  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const intent = formData.get('intent') as string
  
  if (!email) {
    redirect(`/login?error=err_generic`)
  }

  const options: any = {
    emailRedirectTo: `${getSiteUrl()}/api/auth/callback`
  }
  
  if (intent === 'seller') {
    options.emailRedirectTo = `${getSiteUrl()}/api/auth/callback?next=/vendedor/onboarding`
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options
  })

  // AuthAudit Base: confirmation_resent
  console.log(`[AUTH AUDIT] event: confirmation_resent, email: ${email}, date: ${new Date().toISOString()}`)

  if (error) {
    const intentParam = intent ? `&intent=${intent}` : ''
    redirect(`/login?error=${getErrorKey(error.message)}${intentParam}`)
  }

  redirect(`/login?msg=msg_check_email&view=verify&email=${encodeURIComponent(email)}`)
}
