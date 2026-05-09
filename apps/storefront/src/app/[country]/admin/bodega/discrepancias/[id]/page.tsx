import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { AlertCircle, CheckCircle, XCircle, FileText, ChevronLeft } from 'lucide-react';
import { resolveDiscrepancyAction, rejectDiscrepancyAction } from '../actions';

export default async function DiscrepancyDetailPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { country, id } = await params;
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

  const discrepancy = await prisma.warehouseDiscrepancy.findUnique({
    where: { id },
    include: {
      Validator: true,
      InboundItem: {
        include: {
          InboundRequest: {
            include: {
              Warehouse: true,
              Store: true,
              Receipts: {
                orderBy: { receivedAt: 'desc' },
                take: 1
              }
            }
          },
          Variant: {
            include: { Product: true }
          }
        }
      }
    }
  });

  if (!discrepancy) {
    redirect(`/${country}/admin/bodega/discrepancias`);
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  const inbound = discrepancy.InboundItem.InboundRequest;
  const variant = discrepancy.InboundItem.Variant;
  const receipt = inbound.Receipts[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      
      <Link href={`/${country}/admin/bodega/discrepancias`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        {dict?.warehouseAdmin?.discrepanciesQueue || 'Volver a Discrepancias'}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
            Caso: {discrepancy.id.split('-')[0].toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Revisión de auditoría y ajuste de inventario</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${discrepancy.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : discrepancy.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {discrepancy.status}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Contexto de la Recepción */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bodega</p>
            <p className="font-medium text-gray-900">{inbound.Warehouse.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tienda / Vendedor</p>
            <p className="font-medium text-gray-900">{inbound.Store.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">ID Recepción</p>
            <p className="font-medium text-gray-900">{receipt ? receipt.id.split('-')[0].toUpperCase() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
            <p className="font-medium text-gray-900">{new Date(discrepancy.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Producto y Discrepancia */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">
              {variant.Product.title}
            </h3>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-neutral inline-block mb-6">
              SKU: {variant.sku}
            </code>

            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Motivo Reportado por Bodega:</p>
                  <p className="text-sm italic">&quot;{discrepancy.reason}&quot;</p>
                  <p className="text-xs mt-2 text-red-600/70">Operario: {discrepancy.Validator?.email}</p>
                </div>
              </div>
            </div>
            
            {/* Historial Receipt */}
            <div className="text-sm text-gray-500 border-l-2 border-gray-200 pl-4 mt-6">
              <p className="font-bold text-gray-700 mb-1 flex items-center gap-2"><FileText className="w-4 h-4"/> Receipt Audit</p>
              <p>Receipt Status: <span className="font-medium">{receipt?.status}</span></p>
              <p>Inbound Request: <span className="font-medium">{inbound.status}</span></p>
              <p className="text-xs mt-2 italic">*El ledger físico no fue afectado por este ítem durante el cierre normal de recepción debido a esta discrepancia.</p>
            </div>
          </div>

          {/* Formulario de Acción */}
          {discrepancy.status === 'OPEN' ? (
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-xs text-neutral font-medium uppercase mb-1">Declarado por Vendedor</p>
                  <p className="text-3xl font-bold text-secondary">{discrepancy.expectedQty}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral font-medium uppercase mb-1">Físico en Bodega</p>
                  <p className="text-3xl font-bold text-red-600">{discrepancy.actualQty}</p>
                </div>
              </div>

              <form action={resolveDiscrepancyAction} className="space-y-4 mb-4 border-b border-gray-100 pb-6">
                <input type="hidden" name="discrepancyId" value={discrepancy.id} />
                <input type="hidden" name="country" value={country} />
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {dict?.warehouseAdmin?.adjustQty || 'Ajustar Stock Físico (Aprobado)'}
                  </label>
                  <input 
                    type="number" 
                    name="approvedQty" 
                    defaultValue={discrepancy.actualQty} 
                    min="0"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este valor será inyectado en el Inventory Ledger y registrará un StockMovement auditado.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {dict?.warehouseAdmin?.auditNotes || 'Notas de Auditoría (Opcional)'}
                  </label>
                  <textarea 
                    name="auditNotes" 
                    rows={2}
                    placeholder="Ej. Se verificó con cámaras y efectivamente llegaron 12, no 15."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <CheckCircle className="w-5 h-5" /> {dict?.warehouseAdmin?.resolveDiscrepancy || 'Resolver y Archivar'}
                </button>
              </form>

              <form action={rejectDiscrepancyAction} className="space-y-4">
                <input type="hidden" name="discrepancyId" value={discrepancy.id} />
                <input type="hidden" name="country" value={country} />
                
                <div>
                  <textarea 
                    name="auditNotes" 
                    rows={2}
                    required
                    placeholder="Motivo de rechazo/reconteo (Obligatorio)"
                    className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-white border-2 border-red-200 text-red-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                  <XCircle className="w-5 h-5" /> {dict?.warehouseAdmin?.rejectDiscrepancy || 'Rechazar / Requerir Reconteo'}
                </button>
              </form>

            </div>
          ) : (
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Caso Cerrado</h3>
                <p className="text-sm text-gray-500 mb-4">Esta discrepancia ya fue auditada y archivada.</p>
                <div className="text-left bg-white p-3 rounded-lg text-sm border border-gray-100 italic">
                  &quot;{discrepancy.reason}&quot;
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
