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

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("LOGIN ERROR:", error.message)
    redirect(`/login?error=${getErrorKey(error.message)}`)
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
    }
  }

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  if (passwordConfirm && password !== passwordConfirm) {
    redirect(`/login?error=err_pass_mismatch`)
  }

  const data = {
    email: formData.get('email') as string,
    password: password,
  }

  // Supabase GoTrue emitirá un evento insert en auth.users, el SQL trigger reaccionará.
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("SIGNUP ERROR:", error.message)
    redirect(`/login?error=${getErrorKey(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // We assume the user wants to reset their password
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirect(`/login?error=${getErrorKey(error.message)}`)
  }

  redirect(`/login?msg=msg_check_email_reset`)
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/api/auth/callback`,
    },
  })

  if (error) {
    redirect(`/login?error=${getErrorKey(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
