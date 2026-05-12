import { getDictionary, defaultLocale } from '@/i18n';
import AuthClient from './AuthClient';
import { cookies } from 'next/headers';
import { ClientLogger } from '@/components/ClientLogger';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const errorKey = params?.error as string;
  const msgKey = params?.msg as string;
  const intent = params?.intent as string;
  const email = params?.email as string;
  
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  // Server-side log to track when Next.js builds/renders this page
  console.log(`[🔍 AZHON-SERVER-AUDIT] [LoginPage] Render triggered. Intent: ${intent}`);

  return (
    <div className="min-h-screen bg-warm flex flex-col justify-center items-center p-4">
      <ClientLogger componentName="LOGIN_PAGE_WRAPPER" />
      <AuthClient dict={dict} errorKey={errorKey} msgKey={msgKey} intent={intent} defaultEmail={email} />
    </div>
  )
}
