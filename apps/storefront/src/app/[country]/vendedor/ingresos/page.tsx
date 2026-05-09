import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';

export default async function SellerInboundsPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!user) redirect(`/${country}/login`);

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id }
  });

  if (!store) redirect(`/${country}/vendedor`);

  // Obtener ingresos reales
  const inbounds = await prisma.inboundRequest.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    include: {
      Warehouse: true,
      _count: {
        select: { Items: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          {dict?.sellerProfile?.inbounds?.title || 'Ingresos a Bodega'}
        </h1>
        <Link 
          href={`/${country}/vendedor/ingresos/nuevo`}
          className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {dict?.sellerProfile?.inbounds?.newInbound || '+ Nuevo Ingreso'}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {inbounds.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-neutral font-medium mb-4">{dict?.sellerProfile?.inbounds?.emptyInbounds || 'No tienes ingresos registrados.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-neutral font-bold">
                  <th className="p-4">{dict?.sellerProfile?.inbounds?.inboundId || 'ID Ingreso'}</th>
                  <th className="p-4">{dict?.sellerProfile?.inbounds?.warehouseDestination || 'Bodega Destino'}</th>
                  <th className="p-4">{dict?.sellerProfile?.inbounds?.status || 'Estado'}</th>
                  <th className="p-4">{dict?.sellerProfile?.inbounds?.items || 'Items'}</th>
                  <th className="p-4 text-right">{dict?.sellerProfile?.actions || 'Acciones'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inbounds.map((inbound) => {
                  return (
                    <tr key={inbound.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <Link href={`/${country}/vendedor/ingresos/${inbound.id}`} className="font-bold text-secondary hover:underline">
                          #{inbound.id.split('-')[0].toUpperCase()}
                        </Link>
                        <p className="text-xs text-neutral mt-1">
                          {new Date(inbound.createdAt).toLocaleDateString(locale)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-secondary">{inbound.Warehouse.name}</p>
                        <p className="text-xs text-neutral mt-1">
                          {inbound.expectedAt 
                            ? new Date(inbound.expectedAt).toLocaleDateString(locale) 
                            : '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                          inbound.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          inbound.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                          inbound.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {inbound.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-neutral">
                          {inbound._count.Items} SKU(s)
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/${country}/vendedor/ingresos/${inbound.id}`}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          {inbound.status === 'DRAFT' 
                            ? (dict?.sellerProfile?.edit || 'Editar') 
                            : (dict?.sellerProfile?.inbounds?.actionDetails || 'Ver')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
