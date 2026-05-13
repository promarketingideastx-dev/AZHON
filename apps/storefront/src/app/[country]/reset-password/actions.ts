'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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
  }
  return '';
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string

  const countryPrefix = await getCountryPrefix();

  if (password !== passwordConfirm) {
    redirect(`${countryPrefix || '/'}/reset-password?error=err_pass_mismatch`)
  }

  const { error } = await supabase.auth.updateUser({ password })

  // AuthAudit Base: password_reset_completed
  console.log(`[AUTH AUDIT] event: password_reset_completed, date: ${new Date().toISOString()}`)

  if (error) {
    console.error("UPDATE PASSWORD ERROR:", error.message)
    redirect(`${countryPrefix || '/'}/reset-password?error=err_password_update`)
  }

  // Once updated successfully, redirect to login with success message
  redirect(`${countryPrefix || '/'}/login?msg=msg_password_updated`)
}
