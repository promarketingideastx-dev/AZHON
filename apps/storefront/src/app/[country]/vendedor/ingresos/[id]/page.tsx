import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { addInboundItemAction, removeInboundItemAction, submitInboundAction } from '../actions';

export default async function InboundDetailPage({
  params,
}: {
  params: Promise<{ country: string, id: string }>;
}) {
  const { country, id } = await params;
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

  const inbound = await prisma.inboundRequest.findUnique({
    where: { id },
    include: {
      Warehouse: true,
      Items: {
        include: {
          Variant: {
            include: { Product: true }
          }
        }
      }
    }
  });

  if (!inbound || inbound.storeId !== store.id) {
    redirect(`/${country}/vendedor/ingresos`);
  }

  const isDraft = inbound.status === 'DRAFT';

  // Obtener variantes disponibles para añadir
  const storeProducts = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { Variants: true }
  });

  const availableVariants = storeProducts.flatMap(p => 
    p.Variants.map(v => ({
      ...v,
      productTitle: p.title
    }))
  );

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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-secondary">
              {dict?.sellerProfile?.inbounds?.inboundDetails || 'Detalles de Ingreso'} #{inbound.id.split('-')[0].toUpperCase()}
            </h1>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-widest ${
              inbound.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              inbound.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
              inbound.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {inbound.status}
            </span>
          </div>
        </div>
      </div>

      {!isDraft && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex items-center gap-3">
          <span>🔒</span> {dict?.sellerProfile?.inbounds?.readOnlyMode || 'Modo Lectura. Este ingreso ya fue enviado a bodega.'}
        </div>
      )}

      {/* Resumen */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs font-bold text-neutral uppercase mb-1">{dict?.sellerProfile?.inbounds?.warehouseDestination || 'Bodega Destino'}</p>
          <p className="font-bold text-secondary">{inbound.Warehouse.name}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral uppercase mb-1">{dict?.sellerProfile?.inbounds?.expectedDate || 'Fecha Esperada'}</p>
          <p className="font-bold text-secondary">
            {inbound.expectedAt ? new Date(inbound.expectedAt).toLocaleDateString(locale) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral uppercase mb-1">{dict?.sellerProfile?.inbounds?.totalItems || 'Total SKUs'}</p>
          <p className="font-bold text-secondary">{inbound.Items.length}</p>
        </div>
      </div>

      {/* Agregar SKUs (Solo DRAFT) */}
      {isDraft && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-secondary mb-4">{dict?.sellerProfile?.inbounds?.addItems || 'Añadir SKU'}</h2>
          <form action={addInboundItemAction} className="flex gap-4 items-end">
            <input type="hidden" name="inboundRequestId" value={inbound.id} />
            <input type="hidden" name="country" value={country} />
            
            <div className="flex-1">
              <label className="block text-xs font-bold text-secondary mb-2">{dict?.sellerProfile?.product || 'Producto / Variante'}</label>
              <select name="variantId" required className="w-full bg-gray-50 border border-gray-200 text-secondary rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-all">
                <option value="">{dict?.sellerProfile?.inbounds?.selectVariant || 'Selecciona una variante...'}</option>
                {availableVariants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.productTitle} - SKU: {v.sku}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-32">
              <label className="block text-xs font-bold text-secondary mb-2">{dict?.sellerProfile?.inbounds?.expectedQty || 'Cant. Esperada'}</label>
              <input type="number" name="expectedQty" min="1" required defaultValue="1" className="w-full bg-gray-50 border border-gray-200 text-secondary rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-all" />
            </div>

            <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity">
              {dict?.sellerProfile?.inbounds?.add || 'Añadir'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {inbound.Items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-neutral font-medium">{dict?.sellerProfile?.inbounds?.noItems || 'No hay ítems en esta solicitud.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-neutral font-bold">
                  <th className="p-4">{dict?.sellerProfile?.product || 'Producto'}</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-center">{dict?.sellerProfile?.inbounds?.expectedQty || 'Cant. Esperada'}</th>
                  <th className="p-4">{dict?.sellerProfile?.inbounds?.status || 'Estado'}</th>
                  {isDraft && <th className="p-4 text-right"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inbound.Items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-secondary">{item.Variant.Product.title}</p>
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-neutral">{item.Variant.sku}</code>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-secondary text-lg">{item.expectedQty}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                        item.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        item.status === 'DISCREPANCY' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    {isDraft && (
                      <td className="p-4 text-right">
                        <form action={removeInboundItemAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="inboundRequestId" value={inbound.id} />
                          <input type="hidden" name="country" value={country} />
                          <button type="submit" className="text-red-500 hover:text-red-700 font-medium text-sm">
                            {dict?.sellerProfile?.inbounds?.delete || 'Borrar'}
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {isDraft && (
        <div className="flex justify-end pt-4">
          <form action={submitInboundAction}>
            <input type="hidden" name="inboundRequestId" value={inbound.id} />
            <input type="hidden" name="country" value={country} />
            <button 
              type="submit" 
              disabled={inbound.Items.length === 0}
              className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {dict?.sellerProfile?.inbounds?.submitToWarehouse || 'Enviar a Bodega'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
