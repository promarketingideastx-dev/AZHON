import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { getOrCreateOnboardingSession } from './actions';
import OnboardingClient from './OnboardingClient';

export default async function SellerOnboardingPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  // Initialize or fetch existing session securely from DB
  const data = await getOrCreateOnboardingSession();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-secondary font-medium">Debes iniciar sesión para continuar.</p>
      </div>
    );
  }

  const { profile, session } = data;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-100 py-6 mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-xl font-bold text-secondary">Centro de Registro AZHON Sellers</h1>
        </div>
      </div>
      
      <OnboardingClient 
        country={country} 
        initialStep={session.currentStep} 
        initialData={session.progressData} 
      />
    </div>
  );
}
