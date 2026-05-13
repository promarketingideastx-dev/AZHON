import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function ForgotPasswordV2Page({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  const errorKey = sParams?.error as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">{dict.auth.forgotPassword}</h1>
        <p className="text-sm text-neutral">
          {dict.auth.forgotPasswordDesc}
        </p>
      </div>

      {errorKey && (
        <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600 text-center font-medium">
            {dict.auth.errors[errorKey as keyof typeof dict.auth.errors] || 'Ha ocurrido un error.'}
          </p>
        </div>
      )}

      {/* Scaffold for Atomic Form - Logic intentionally omitted for Phase 1 */}
      <form className="w-full space-y-4">
        <input type="hidden" name="country" value={country} />

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">{dict.auth.email}</label>
          <input 
            type="email" 
            name="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder={dict.auth.emailPlaceholder}
          />
        </div>

        <button 
          type="button" 
          disabled
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
        >
          {dict.auth.sendResetLink}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link 
          href={`/${country}/auth-v2/login`}
          className="text-primary font-bold hover:underline text-sm"
        >
          {dict.auth.backToLogin}
        </Link>
      </div>
    </div>
  );
}
