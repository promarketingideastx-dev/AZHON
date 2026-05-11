import { getDictionary, defaultLocale } from '@/i18n';
import ResetPasswordClient from './ResetPasswordClient';
import { cookies } from 'next/headers';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const errorKey = params?.error as string;
  const msgKey = params?.msg as string;
  
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-warm flex flex-col justify-center items-center p-4">
      <ResetPasswordClient dict={dict} errorKey={errorKey} msgKey={msgKey} />
    </div>
  )
}
