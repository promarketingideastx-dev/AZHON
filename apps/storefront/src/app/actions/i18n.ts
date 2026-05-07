'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setLanguage(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  // Revalidate the entire layout to trigger a re-render with the new locale
  revalidatePath('/', 'layout');
}
