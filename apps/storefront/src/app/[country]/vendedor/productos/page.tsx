import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';

export default async function SellerProductsPage({
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

  // Obtener productos reales
  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    include: {
      Category: true,
      Variants: true,
      Media: {
        orderBy: { position: 'asc' },
        take: 1
      },
      Metrics: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary">
          {dict?.sellerProfile?.myProducts || 'Mis Productos'}
        </h1>
        <Link 
          href={`/${country}/vendedor/productos/nuevo`}
          className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {dict?.sellerProfile?.createProductBtn || '+ Crear Producto'}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-neutral font-medium mb-4">{dict?.sellerProfile?.emptyProducts || 'No tienes productos en tu catálogo.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-neutral font-bold">
                  <th className="p-4 w-16">{dict?.sellerProfile?.image || 'Imagen'}</th>
                  <th className="p-4">{dict?.sellerProfile?.product || 'Producto'}</th>
                  <th className="p-4">{dict?.sellerProfile?.status || 'Estado'}</th>
                  <th className="p-4">{dict?.sellerProfile?.metrics || 'Métricas'}</th>
                  <th className="p-4 text-right">{dict?.sellerProfile?.actions || 'Acciones'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const primaryMedia = p.Media[0]?.url || p.imageUrl;
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                          {primaryMedia ? (
                            <img src={primaryMedia} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-medium text-gray-400">{dict?.sellerProfile?.noImage || 'Sin foto'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link href={`/${country}/vendedor/productos/${p.id}`} className="font-bold text-secondary hover:underline line-clamp-1">
                          {p.title}
                        </Link>
                        <p className="text-xs text-neutral mt-1">
                          {p.Category?.name || dict?.sellerProfile?.noCategory || 'Sin Categoría'} • {dict?.sellerProfile?.variantsCount?.replace('{count}', p.Variants.length.toString()) || `${p.Variants.length} variante(s)`}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                          p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                          p.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-neutral flex flex-col gap-0.5">
                          {p.Metrics?.views ? <span>{dict?.sellerProfile?.viewsCount?.replace('{count}', p.Metrics.views.toString()) || `👀 ${p.Metrics.views} vistas`}</span> : <span className="opacity-50">-</span>}
                          {p.Metrics?.salesCount ? <span>{dict?.sellerProfile?.soldCount?.replace('{count}', p.Metrics.salesCount.toString()) || `🔥 ${p.Metrics.salesCount} vendidos`}</span> : null}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/${country}/vendedor/productos/${p.id}`}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          {dict?.sellerProfile?.edit || 'Editar'}
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
