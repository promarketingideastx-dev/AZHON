import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { AlertCircle, Eye, CheckCircle } from 'lucide-react';

export default async function WarehouseDiscrepanciesQueuePage({
  params,
}: {
  params: Promise<any>;
}) {
  const { country } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${country}/login`);

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 mb-6">Esta sección es exclusiva para administradores del sistema.</p>
          <Link href={`/${country}`} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const discrepancies = await prisma.warehouseDiscrepancy.findMany({
    where: { 
      status: 'OPEN'
    },
    include: {
      InboundItem: {
        include: {
          InboundRequest: {
            include: {
              Warehouse: true,
              Store: true
            }
          },
          Variant: {
            include: {
              Product: true
            }
          }
        }
      },
      Validator: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {dict?.warehouseAdmin?.title || 'Mesa de Control'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {dict?.warehouseAdmin?.discrepanciesQueue || 'Discrepancias Pendientes'}
          </p>
        </div>
        <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {discrepancies.length} pendientes
        </span>
      </div>

      {discrepancies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Todo en orden</h2>
          <p className="text-gray-500">{dict?.warehouseAdmin?.noDiscrepancies || 'No hay discrepancias pendientes en la bodega.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {discrepancies.map(disc => {
            const inbound = disc.InboundItem.InboundRequest;
            const variant = disc.InboundItem.Variant;
            
            return (
              <div key={disc.id} className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{inbound.Warehouse.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{inbound.Store.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs text-gray-400">Req: #{inbound.id.split('-')[0].toUpperCase()}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">
                    {variant.Product.title}
                  </h3>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-neutral block mb-4 w-max">
                    SKU: {variant.sku}
                  </code>
                  
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-neutral font-medium uppercase mb-1">Declarado</p>
                      <p className="text-xl font-bold text-secondary">{disc.expectedQty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral font-medium uppercase mb-1">Recibido Físico</p>
                      <p className="text-xl font-bold text-red-600">{disc.actualQty}</p>
                    </div>
                  </div>
                  
                  {disc.reason && (
                    <div className="mt-4 bg-red-50 text-red-800 p-3 rounded-lg text-sm italic border border-red-100">
                      &quot;{disc.reason}&quot; - {disc.Validator?.email || 'Operario'}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-56 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <Link 
                    href={`/${country}/admin/bodega/discrepancias/${disc.id}`}
                    className="w-full bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Eye className="w-5 h-5" /> {dict?.warehouseOps?.verify || 'Revisar Caso'}
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
