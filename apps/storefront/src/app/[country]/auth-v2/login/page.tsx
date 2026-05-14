import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { SubmitButton } from '../SubmitButton';
import { loginAction, googleOAuthAction } from '../actions';

export default async function LoginV2Page({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  const intent = sParams?.intent as string;
  const errorKey = sParams?.error as string;
  const next = sParams?.next as string;

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-8 w-full text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">{dict.auth.loginTitle}</h1>
        {intent === 'seller' ? (
          <p className="text-sm text-neutral mb-2">
            {dict.auth.loginSubtitleSeller}
          </p>
        ) : (
          <p className="text-sm text-neutral mb-2">
            {dict.auth.loginSubtitle}
          </p>
        )}
        <p className="text-sm text-neutral">
          {dict.auth.noAccountPrompt}{' '}
          <Link 
            href={intent ? `/${country}/auth-v2/signup?intent=${intent}${next ? `&next=${encodeURIComponent(next)}` : ''}` : `/${country}/auth-v2/start${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-primary font-bold hover:underline"
          >
            {dict.auth.signUpLink}
          </Link>
        </p>
      </div>

      {errorKey && (
        <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600 text-center font-medium">
            {dict.auth.errors[errorKey as keyof typeof dict.auth.errors] || 'Ha ocurrido un error.'}
          </p>
        </div>
      )}

      {/* Mensaje de exito opcional */}
      {sParams?.msg === 'msg_check_email_reset' && (
        <div className="mb-6 w-full p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            {dict.auth.msg_check_email_reset || 'Revisa tu correo para recuperar tu contraseña.'}
          </p>
        </div>
      )}
      {sParams?.msg === 'msg_password_updated' && (
        <div className="mb-6 w-full p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            {dict.auth.msg_password_updated || 'Tu contraseña ha sido actualizada con éxito.'}
          </p>
        </div>
      )}
      {sParams?.msg === 'msg_check_email' && (
        <div className="mb-6 w-full p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            {dict.auth.msg_check_email || 'Revisa tu correo para confirmar tu cuenta.'}
          </p>
        </div>
      )}

      {/* Atomic Form bound to Server Action */}
      <form action={loginAction} className="w-full space-y-4">
        <input type="hidden" name="country" value={country} />
        {next && <input type="hidden" name="next" value={next} />}
        {intent && <input type="hidden" name="intent" value={intent} />}

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">{dict.auth.emailLabel}</label>
          <input 
            type="email" 
            name="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder={dict.auth.emailPlaceholder}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-secondary">{dict.auth.passwordLabel}</label>
            <Link href={`/${country}/auth-v2/forgot-password`} className="text-sm text-primary hover:underline">
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <input 
            type="password" 
            name="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton pendingText="Iniciando...">
          {dict.auth.loginButton}
        </SubmitButton>
      </form>

      <div className="mt-8 relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{dict.auth.separatorOr}</span>
        </div>
      </div>

      <div className="mt-6 w-full">
        <form action={googleOAuthAction}>
          <input type="hidden" name="country" value={country} />
          {next && <input type="hidden" name="next" value={next} />}
          {intent && <input type="hidden" name="intent" value={intent} />}
          <SubmitButton 
            pendingText="Redirigiendo..."
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-full transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {dict.auth.continueWithGoogle}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
