'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  if (password !== passwordConfirm) {
    redirect(`/reset-password?error=err_pass_mismatch`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  // AuthAudit Base: password_reset_completed
  console.log(`[AUTH AUDIT] event: password_reset_completed, date: ${new Date().toISOString()}`)

  if (error) {
    console.error("UPDATE PASSWORD ERROR:", error.message)
    redirect(`/reset-password?error=err_password_update`)
  }

  // Once updated successfully, redirect to login with success message
  redirect(`/login?msg=msg_password_updated`)
}
