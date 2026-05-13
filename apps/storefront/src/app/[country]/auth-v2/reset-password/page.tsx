import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { SubmitButton } from '../SubmitButton';
import { resetPasswordAction } from '../actions';

export default async function ResetPasswordV2Page({
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
        <h1 className="text-3xl font-bold text-secondary mb-2">{dict.auth.resetPassword}</h1>
        <p className="text-sm text-neutral">
          Ingresa tu nueva contraseña para acceder a tu cuenta.
        </p>
      </div>

      {errorKey && (
        <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600 text-center font-medium">
            {dict.auth.errors[errorKey as keyof typeof dict.auth.errors] || 'Ha ocurrido un error.'}
          </p>
        </div>
      )}

      {/* Atomic Form bound to Server Action */}
      <form action={resetPasswordAction} className="w-full space-y-4">
        <input type="hidden" name="country" value={country} />

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">{dict.auth.password}</label>
          <input 
            type="password" 
            name="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1">{dict.auth.passwordConfirm}</label>
          <input 
            type="password" 
            name="passwordConfirm"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton pendingText="Actualizando...">
          {dict.auth.updatePassword}
        </SubmitButton>
      </form>
    </div>
  );
}
