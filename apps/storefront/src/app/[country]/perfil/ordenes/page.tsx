import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import { DashboardCard } from '@/components/ui/DashboardCard';

export default async function OrderHistoryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${country}/login`);
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const bp = dict.buyerProfile;

  // Leer órdenes reales del usuario
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      Shipments: true,
    }
  });

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-secondary mb-8">{bp?.orders || 'Mis Órdenes'}</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <p className="text-neutral font-medium mb-4">{bp?.noPurchases || 'Aún no has realizado ninguna compra.'}</p>
          <Link href={`/${country}`} className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
            {bp?.exploreCatalog || 'Explorar Catálogo'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <DashboardCard key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-neutral bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    #{order.id.split('-')[0].toUpperCase()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                    {order.status}
                  </span>
                </div>
                
                <p className="text-sm text-neutral mb-1">
                  {bp?.date || 'Fecha: '} {new Date(order.createdAt).toLocaleDateString(locale === 'es' ? 'es-HN' : locale === 'pt' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-neutral">
                  {bp?.shipments || 'Envíos: '} {order.Shipments.length} {bp?.packages || 'paquete(s)'}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-xl font-black text-secondary">
                  HNL {(order.grandTotal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <Link href={`/${country}/perfil/ordenes/${order.id}`} className="text-sm font-bold text-primary hover:underline">
                  {bp?.viewDetails || 'Ver Detalles'} &rarr;
                </Link>
              </div>
              
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
}
