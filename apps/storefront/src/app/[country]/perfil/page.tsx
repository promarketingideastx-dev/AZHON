import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';

export default async function BuyerProfileOverviewPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  // Fetch or infer Buyer Profile
  let profile = await prisma.buyerProfile.findUnique({
    where: { userId: user.id }
  });

  // If profile doesn't exist, we fallback to auth metadata (auto-creation will happen in CRM background sync later)
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  const displayName = profile?.fullName || user.user_metadata?.first_name || bp?.buyerAccountDefaultName || 'Comprador AZHON';

  // Fetch base preferences if any
  const prefs = await prisma.userPreference.findUnique({
    where: { userId: user.id }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">
        {bp?.hello ? bp.hello.replace('{name}', displayName) : `Hola, ${displayName}`}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-secondary mb-2">{bp?.accountSummary || 'Resumen de cuenta'}</h2>
          <p className="text-neutral">
            {bp?.accountSummaryDesc || 'Bienvenido a tu perfil de AZHON. Desde aquí podrás gestionar tus pedidos, direcciones y métodos de pago.'}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-neutral-400">{bp?.status || 'Estado'}</p>
          <p className="text-primary font-bold">{profile?.status === 'ACTIVE' ? (bp?.active || 'Activo') : (bp?.draft || 'Borrador')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard>
          <h3 className="font-bold text-secondary mb-2">{bp?.lastOrder || 'Último pedido'}</h3>
          <p className="text-sm text-neutral">{bp?.noRecentOrders || 'No tienes pedidos recientes.'}</p>
        </DashboardCard>
        <DashboardCard>
          <h3 className="font-bold text-secondary mb-2">{bp?.mainAddress || 'Dirección principal'}</h3>
          <p className="text-sm text-neutral">{bp?.noMainAddress || 'No has configurado una dirección operativa de entrega.'}</p>
        </DashboardCard>
      </div>
      
      {/* CRM Prefs Snapshot */}
      <div className="bg-neutral-50 rounded-xl p-4 text-sm text-neutral border border-neutral-100">
        <strong>{bp?.commPrefs || 'Preferencias de Comunicación:'}</strong> {prefs?.marketingOptIn ? (bp?.subscribed || 'Suscrito a ofertas') : (bp?.notSubscribed || 'No suscrito')}
      </div>
    </div>
  );
}
