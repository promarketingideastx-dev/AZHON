import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { getOrCreateOnboardingSession } from './actions';
import OnboardingClient from './OnboardingClient';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

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
  console.log(`[AZHON_AUTH_TRACE] seller_gate_onboarding:start`);
  const data = await getOrCreateOnboardingSession();

  if (!data) {
    console.log(`[AZHON_AUTH_TRACE] seller_gate_onboarding:no_session, redirecting to login`);
    const nextPath = encodeURIComponent(`/${country}/vendedor/onboarding`);
    redirect(`/${country}/login?intent=seller&next=${nextPath}`);
  }

  // PROFILE COMPLETION GATE
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const dbUserFull = await prisma.user.findUnique({
      where: { id: user.id },
      include: { BuyerProfile: true }
    });

    const isProfileComplete = dbUserFull?.phone && dbUserFull?.BuyerProfile?.fullName;

    if (!isProfileComplete) {
      console.log(`[AZHON_AUTH_TRACE] seller_gate_onboarding:profile_incomplete, redirecting to complete-profile`);
      const nextPath = encodeURIComponent(`/${country}/vendedor/onboarding`);
      redirect(`/${country}/auth-v2/complete-profile?intent=seller&next=${nextPath}`);
    }
  }

  const { profile, session } = data;
  console.log(`[AZHON_AUTH_TRACE] seller_gate_onboarding:session_active, profile_id: ${profile?.id || 'none'}, profile_status: ${profile?.status || 'none'}, step: ${session?.currentStep || 'none'}`);

  if (profile?.status === 'APPROVED') {
    redirect(`/${country}/vendedor`);
  }

  if (profile?.status === 'UNDER_REVIEW') {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="bg-white border-b border-neutral-100 py-6 mb-8">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-xl font-bold text-secondary">{dict.onboarding?.center_title || 'Centro de Registro AZHON Sellers'}</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4">
           <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100 animate-fade-in">
             <div className="w-20 h-20 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold text-secondary mb-3">{dict.onboarding?.review_title || 'Tu solicitud está en revisión'}</h2>
             <p className="text-neutral mb-8 max-w-md mx-auto">
               {dict.onboarding?.review_desc || 'Hemos recibido tu solicitud para vender en AZHON. Nuestro equipo está revisando la información de tu negocio. Te notificaremos por correo electrónico una vez que tu tienda sea aprobada.'}
             </p>
             <a href={`/${country}/perfil`} className="inline-block bg-white text-secondary border border-gray-200 rounded-full py-3 px-8 font-bold hover:bg-gray-50 transition-colors">
               {dict.onboarding?.back_profile || 'Volver a mi perfil'}
             </a>
           </div>
        </div>
      </div>
    );
  }

  // Safe fallback if session is missing for some reason but profile is DRAFT
  if (!session) {
    redirect(`/${country}/login?intent=seller`);
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-100 py-6 mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-xl font-bold text-secondary">{dict.onboarding?.center_title || 'Centro de Registro AZHON Sellers'}</h1>
        </div>
      </div>
      
      <OnboardingClient 
        country={country} 
        initialStep={session.currentStep} 
        initialData={session.progressData}
        dict={dict}
      />
    </div>
  );
}
