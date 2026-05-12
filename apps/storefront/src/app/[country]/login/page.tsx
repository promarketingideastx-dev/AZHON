import { getDictionary, defaultLocale } from '@/i18n';
import AuthClient from './AuthClient';
import { cookies } from 'next/headers';

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

  return (
    <div className="flex flex-col justify-center items-center p-4 flex-1 h-full pt-16">
      <AuthClient dict={dict} errorKey={errorKey} msgKey={msgKey} intent={intent} defaultEmail={email} />
    </div>
  )
}
