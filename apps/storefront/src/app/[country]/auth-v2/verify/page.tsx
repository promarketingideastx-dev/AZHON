import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function VerifyV2Page({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  const intent = sParams?.intent as string;
  const next = sParams?.next as string;
  const email = sParams?.email as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full text-center">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-2">{dict.auth.checkEmail}</h1>
        <p className="text-neutral mb-2">
          {dict.auth.weSentLink}{' '}
          <span className="font-semibold text-secondary">{email || 'tu correo'}</span>
        </p>
      </div>

      <div className="w-full space-y-4">
        <form className="w-full">
           <input type="hidden" name="email" value={email || ''} />
           <input type="hidden" name="country" value={country} />
           {next && <input type="hidden" name="next" value={next} />}
           {intent && <input type="hidden" name="intent" value={intent} />}
           
           <button 
             type="button" 
             disabled
             className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-secondary font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
           >
             {dict.auth.resendLink}
           </button>
        </form>

        <div className="text-center mt-6">
          <Link 
            href={`/${country}/auth-v2/login${intent ? `?intent=${intent}` : ''}${next ? `${intent ? '&' : '?'}next=${encodeURIComponent(next)}` : ''}`}
            className="text-primary font-bold hover:underline text-sm"
          >
            {dict.auth.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
