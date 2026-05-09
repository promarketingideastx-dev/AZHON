import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { validateItemAction, closeReceiptAction } from '../actions';

export default async function ReceiptValidationPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { country, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!user) redirect(`/${country}/login`);

  const inbound = await prisma.inboundRequest.findUnique({
    where: { id },
    include: {
      Warehouse: true,
      Store: true,
      Items: {
        include: {
          Variant: {
            include: { Product: true }
          },
          Discrepancies: true // To see if it has discrepancies recorded
        }
      },
      Receipts: {
        orderBy: { receivedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!inbound) {
    redirect(`/${country}/bodega/recepcion`);
  }

  const isReceiving = inbound.status === 'RECEIVING';
  const isCompleted = inbound.status === 'COMPLETED';
  const receipt = inbound.Receipts[0]; // El recibo activo
  
  // Validar progreso
  const totalItems = inbound.Items.length;
  const verifiedCount = inbound.Items.filter((i: any) => i.status === 'VERIFIED').length;
  const discrepancyCount = inbound.Items.filter((i: any) => i.status === 'DISCREPANCY').length;
  const pendingCount = totalItems - verifiedCount - discrepancyCount;
  const canClose = pendingCount === 0 && isReceiving && receipt?.status === 'OPEN';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href={`/${country}/bodega/recepcion`}
            className="text-sm font-bold text-neutral hover:text-primary transition-colors mb-2 inline-block"
          >
            &larr; {dict?.warehouseOps?.backToQueue || 'Volver a la Cola'}
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-secondary">
              Auditoría #{inbound.id.split('-')[0].toUpperCase()}
            </h1>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-widest ${
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {inbound.status}
            </span>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-3">
          <span>✅</span> {dict?.warehouseOps?.receiptClosed || 'Recepción Cerrada y registrada en inventario.'}
        </div>
      )}

      {/* Stats Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral uppercase mb-1">Bodega</p>
          <p className="font-bold text-secondary text-sm">{inbound.Warehouse.name}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral uppercase mb-1">Tienda (Seller)</p>
          <p className="font-bold text-secondary text-sm">{inbound.Store.name}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral uppercase mb-1">Verificados</p>
          <p className="font-bold text-green-600 text-xl">{verifiedCount} / {totalItems}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-bold text-neutral uppercase mb-1">Discrepancias</p>
          <p className="font-bold text-red-600 text-xl">{discrepancyCount}</p>
        </div>
      </div>

      {/* Tabla de Validación de Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-neutral font-bold">
                <th className="p-4">SKU / Producto</th>
                <th className="p-4 text-center">{dict?.warehouseOps?.declaredQty || 'Declarado'}</th>
                <th className="p-4 text-center">{dict?.warehouseOps?.actualQty || 'Físico'}</th>
                <th className="p-4">Estado</th>
                {isReceiving && <th className="p-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inbound.Items.map((item: any) => {
                const isItemProcessed = item.status === 'VERIFIED' || item.status === 'DISCREPANCY';
                
                return (
                  <tr key={item.id} className={`transition-colors ${isItemProcessed ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <p className="font-bold text-secondary text-sm">{item.Variant.Product.title}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-neutral block mt-1 w-max">
                        {item.Variant.sku}
                      </code>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-neutral text-lg">{item.expectedQty}</span>
                    </td>
                    <td className="p-4 text-center">
                      {isItemProcessed ? (
                        <span className={`font-bold text-lg ${item.status === 'VERIFIED' ? 'text-green-600' : 'text-red-600'}`}>
                          {/* We don't save the physical count directly on the item, but we can display the discrepancy value if needed */}
                          {item.status === 'VERIFIED' ? item.expectedQty : (item.Discrepancies[0]?.actualQty ?? '?')}
                        </span>
                      ) : (
                        <span className="text-neutral">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                        item.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        item.status === 'DISCREPANCY' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                    
                    {isReceiving && (
                      <td className="p-4 text-right min-w-[300px]">
                        {!isItemProcessed ? (
                          <form action={validateItemAction} className="flex gap-2 justify-end items-center">
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="inboundRequestId" value={inbound.id} />
                            <input type="hidden" name="country" value={country} />
                            
                            <input 
                              type="number" 
                              name="actualQty" 
                              required 
                              min="0"
                              placeholder="Físico" 
                              className="w-20 bg-white border border-gray-200 text-secondary rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary text-sm" 
                            />
                            <input 
                              type="text" 
                              name="reason" 
                              placeholder="Nota (si hay error)" 
                              className="w-32 bg-white border border-gray-200 text-secondary rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary text-sm" 
                            />
                            <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded-lg font-bold text-sm hover:opacity-90">
                              {dict?.warehouseOps?.verify || 'Verificar'}
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-neutral italic">Auditado</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Button */}
      {isReceiving && (
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <p className="text-sm text-neutral font-medium">
              Al cerrar la recepción, se inyectará el inventario verificado en la bodega.
            </p>
          </div>
          <form action={closeReceiptAction}>
            <input type="hidden" name="inboundRequestId" value={inbound.id} />
            <input type="hidden" name="country" value={country} />
            <button 
              type="submit" 
              disabled={!canClose}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
            >
              🔒 {dict?.warehouseOps?.closeReceipt || 'Cerrar Recepción'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
