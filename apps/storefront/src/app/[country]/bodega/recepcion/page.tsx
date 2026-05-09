import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { startReceivingAction } from './actions';

export default async function WarehouseQueuePage({
  params,
}: {
  params: Promise<any>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!user) redirect(`/${country}/login`);

  // Solo mostrar SUBMITTED y RECEIVING para respetar F1 ADN. DRAFT es invisible.
  const inbounds = await prisma.inboundRequest.findMany({
    where: { 
      status: { in: ['SUBMITTED', 'RECEIVING'] }
    },
    orderBy: { createdAt: 'asc' },
    include: {
      Warehouse: true,
      Store: true,
      _count: {
        select: { Items: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          {dict?.warehouseOps?.queue || 'Cola de Ingresos'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {inbounds.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-neutral font-medium mb-4">No hay ingresos pendientes de recepción.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-neutral font-bold">
                  <th className="p-4">ID / Fecha</th>
                  <th className="p-4">Origen</th>
                  <th className="p-4">Bodega Destino</th>
                  <th className="p-4 text-center">Items</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inbounds.map((inbound) => {
                  return (
                    <tr key={inbound.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-secondary block">#{inbound.id.split('-')[0].toUpperCase()}</span>
                        <span className="text-xs text-neutral">
                          {new Date(inbound.createdAt).toLocaleDateString(locale)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-secondary block">{inbound.Store.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-neutral">{inbound.Warehouse.name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-secondary text-lg">{inbound._count.Items}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                          inbound.status === 'RECEIVING' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {inbound.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inbound.status === 'SUBMITTED' ? (
                          <form action={startReceivingAction}>
                            <input type="hidden" name="inboundRequestId" value={inbound.id} />
                            <input type="hidden" name="country" value={country} />
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                              {dict?.warehouseOps?.startReceiving || 'Iniciar Recepción'}
                            </button>
                          </form>
                        ) : (
                          <Link 
                            href={`/${country}/bodega/recepcion/${inbound.id}`}
                            className="text-primary font-bold text-sm hover:underline"
                          >
                            Continuar Recepción
                          </Link>
                        )}
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
