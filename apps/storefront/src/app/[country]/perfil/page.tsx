import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardCard } from '@/components/ui/DashboardCard';

export default async function BuyerProfileOverviewPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">
        Hola, {user.user_metadata?.first_name || 'Comprador'}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-secondary mb-2">Resumen de cuenta</h2>
        <p className="text-neutral">
          Bienvenido a tu perfil de AZHON. Desde aquí podrás gestionar tus pedidos, direcciones y métodos de pago.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard>
          <h3 className="font-bold text-secondary mb-2">Último pedido</h3>
          <p className="text-sm text-neutral">No tienes pedidos recientes.</p>
        </DashboardCard>
        <DashboardCard>
          <h3 className="font-bold text-secondary mb-2">Dirección principal</h3>
          <p className="text-sm text-neutral">No has configurado una dirección.</p>
        </DashboardCard>
      </div>
    </div>
  );
}
