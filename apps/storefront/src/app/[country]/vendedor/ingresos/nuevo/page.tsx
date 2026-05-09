import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { createInboundAction } from '../actions';

export default async function NewInboundPage({
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

  // Load available warehouses for this tenant
  const warehouses = await prisma.warehouse.findMany({
    where: { tenantId: store.tenantId }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href={`/${country}/vendedor/ingresos`}
            className="text-sm font-bold text-neutral hover:text-primary transition-colors mb-2 inline-block"
          >
            &larr; {dict?.sellerProfile?.back || 'Volver'}
          </Link>
          <h1 className="text-2xl font-bold text-secondary">
            {dict?.sellerProfile?.inbounds?.newInbound || 'Nuevo Ingreso'}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <form action={createInboundAction} className="p-8 space-y-8">
          <input type="hidden" name="storeId" value={store.id} />
          <input type="hidden" name="tenantId" value={store.tenantId} />
          <input type="hidden" name="country" value={country} />

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-secondary border-b border-gray-100 pb-2">
              {dict?.sellerProfile?.generalInfo || 'Información General'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.inbounds?.warehouseDestination || 'Bodega Destino'} *</label>
                <select 
                  name="warehouseId" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 text-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">{dict?.sellerProfile?.inbounds?.selectWarehouse || 'Selecciona una bodega...'}</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary mb-2">{dict?.sellerProfile?.inbounds?.expectedDate || 'Fecha de Entrega Esperada'}</label>
                <input 
                  type="date"
                  name="expectedAt"
                  className="w-full bg-gray-50 border border-gray-200 text-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm font-medium border border-orange-100 flex items-center gap-3">
            <span>ℹ️</span> {dict?.sellerProfile?.draftNote || 'El documento se guardará como DRAFT. Podrás añadir SKUs en el siguiente paso.'}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Link 
              href={`/${country}/vendedor/ingresos`}
              className="px-6 py-3 rounded-xl font-bold text-neutral hover:bg-gray-100 transition-colors"
            >
              {dict?.sellerProfile?.cancel || 'Cancelar'}
            </Link>
            <button 
              type="submit"
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              {dict?.sellerProfile?.saveDraft || 'Guardar Borrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
