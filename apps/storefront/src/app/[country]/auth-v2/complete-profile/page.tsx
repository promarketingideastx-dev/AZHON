import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { SubmitButton } from '../SubmitButton';
import { completeProfileAction } from '../actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CompleteProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { country } = await params;
  const sParams = await searchParams;
  const rawIntent = Array.isArray(sParams?.intent) ? sParams.intent[0] : sParams?.intent;
  const rawNext = Array.isArray(sParams?.next) ? sParams.next[0] : sParams?.next;
  
  const intent = rawIntent === 'seller' || rawNext?.includes('/vendedor/') ? 'seller' : 'buyer';
  const errorKey = Array.isArray(sParams?.error) ? sParams.error[0] : sParams?.error;
  const next = rawNext as string | undefined;

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const qs = new URLSearchParams();
    if (intent) qs.set('intent', intent);
    if (next) qs.set('next', next);
    redirect(`/${country}/auth-v2/login?${qs.toString()}`);
  }

  const errors = dict.auth?.complete_profile ?? {};
  const errorMessage =
    errorKey && typeof errorKey === "string"
      ? errors[errorKey as keyof typeof errors] ?? 'Algo salió mal. Inténtalo nuevamente.'
      : null;

  return (
    <div className="w-full flex flex-col items-center relative animate-fade-in">
      <div className="mb-8 w-full text-center">
        <h1 className="text-3xl font-bold text-secondary mb-2">
          {intent === 'seller' ? dict.auth?.complete_profile?.title_seller : dict.auth?.complete_profile?.title_buyer}
        </h1>
        <p className="text-sm text-neutral mb-2">
          {intent === 'seller' ? dict.auth?.complete_profile?.subtitle_seller : dict.auth?.complete_profile?.subtitle_buyer}
        </p>
      </div>

      <div className="w-full">
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium text-center border border-red-100">
            {errorMessage}
          </div>
        )}

        <form action={completeProfileAction} className="flex flex-col gap-5">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="country" value={country} />
          {next && <input type="hidden" name="next" value={next} />}

          <div>
            <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="firstName">
              {dict.auth?.complete_profile?.label_first_name || 'Nombre'}
            </label>
            <input 
              id="firstName" name="firstName" type="text" required 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder={dict.auth?.complete_profile?.placeholder_first_name || 'Tu nombre'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="lastName">
              {dict.auth?.complete_profile?.label_last_name || 'Apellido'}
            </label>
            <input 
              id="lastName" name="lastName" type="text" required 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder={dict.auth?.complete_profile?.placeholder_last_name || 'Tu apellido'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral mb-1.5 uppercase tracking-wide" htmlFor="phone">
              {dict.auth?.complete_profile?.label_phone || 'Teléfono'}
            </label>
            <input 
              id="phone" name="phone" type="tel" required 
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-secondary bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              placeholder={dict.auth?.complete_profile?.placeholder_phone || '+504 9999-9999'}
            />
          </div>

          <div className="mt-4">
            <SubmitButton 
              pendingText="..." 
              className="w-full bg-primary text-white rounded-full py-3.5 font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {dict.auth?.complete_profile?.btn_continue || 'Continuar'}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
