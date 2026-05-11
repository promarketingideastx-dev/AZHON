import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import CheckoutButton from '@/components/CheckoutButton';
import { ProductGallery } from '../components/ProductGallery';
import { ViewTracker } from './components/ViewTracker';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';
import { ShieldCheck, Truck, Store, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ country: string, id: string }>
}) {
  const { country, id } = await params;
  const countryCode = country.toUpperCase();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  const tenant = await prisma.tenant.findUnique({
    where: { countryCode }
  });

  if (!tenant) return notFound();

  const product = await prisma.product.findUnique({
    where: { 
      id: id,
      tenantId: tenant.id
    },
    include: {
      Store: true,
      Variants: true,
      Category: true,
      Media: { orderBy: { position: 'asc' } },
      Metrics: true,
      Publication: true
    }
  });

  if (!product) {
    return notFound();
  }

  // --- Security & Tracking Evaluations ---
  let shouldTrackView = false;
  const isPublished = product.Publication?.status === 'PUBLISHED';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isOwner = false;
  let isSuperAdmin = false;

  if (user) {
    isOwner = product.Store.ownerId === user.id;
    if (!isOwner) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      isSuperAdmin = dbUser?.role === 'SUPER_ADMIN';
    }
  }

  // 1. VISIBILITY HOTFIX
  if (!isPublished) {
    if (!user || (!isOwner && !isSuperAdmin)) {
      return notFound(); // Block public from unpublished
    }
  }

  // 2. TRACKING EVALUATION
  if (isPublished) {
    if (!user) {
      shouldTrackView = true;
    } else {
      shouldTrackView = !isOwner && !isSuperAdmin;
    }
  }

  const relatedProducts = product.categoryId ? await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'APPROVED',
      Publication: { status: 'PUBLISHED' }
    },
    include: {
      Store: true,
      Variants: true,
      Category: true,
      Metrics: true,
      Media: true,
    },
    take: 4,
  }) : [];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: tenant.currencyCode }).format(amount / 100);
  };

  return (
    <div className="w-full bg-white min-h-screen">
      {shouldTrackView && <ViewTracker productId={product.id} />}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        
        {/* Back Navigation & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral">
          <Link href={`/${country}`} className="font-bold hover:text-primary transition-colors flex items-center gap-1">
            {dict?.header?.home || 'Inicio'}
          </Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          {product.Category ? (
            <>
              <span className="font-medium">{product.Category.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </>
          ) : null}
          <span className="text-gray-400 truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-12 mb-12 lg:mb-16">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <ProductGallery 
              media={product.Media || []} 
              fallbackImageUrl={product.imageUrl} 
              productTitle={product.title} 
            />
          </div>

          {/* Product Info Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gray-100 text-secondary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                {product.Category?.name || dict?.sellerProfile?.noCategory || 'Categoría'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-secondary leading-tight mb-3 md:mb-4 tracking-tight">
              {product.title}
            </h1>

            {/* Real Metrics Surface */}
            {(product.Metrics?.views || product.Metrics?.salesCount) ? (
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-xs md:text-sm font-bold">
                {product.Metrics.salesCount > 0 && (
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100">
                    {dict?.pdp?.soldCount?.replace('{count}', product.Metrics.salesCount.toString()) || `🔥 ${product.Metrics.salesCount} vendidos`}
                  </span>
                )}
                {product.Metrics.views > 0 && (
                  <span className="text-neutral flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    {dict?.pdp?.viewsRecent?.replace('{count}', product.Metrics.views.toString()) || `👀 ${product.Metrics.views} vistas recientes`}
                  </span>
                )}
              </div>
            ) : null}

            <div className="text-3xl md:text-4xl font-black text-primary mb-6 md:mb-8 drop-shadow-sm tracking-tighter">
              {formatPrice(product.basePrice)}
            </div>

            <div className="prose prose-sm sm:prose-base text-neutral mb-8 max-w-none">
              {product.description ? (
                <p className="leading-relaxed">{product.description}</p>
              ) : (
                <p className="italic opacity-60">{dict?.pdp?.noDescription || 'No hay descripción disponible para este producto.'}</p>
              )}
            </div>

            {/* Specifications Accordion (Basic) */}
            <div className="border-t border-b border-gray-100 py-4 mb-8">
              <details className="group">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-secondary">
                  <span>{dict?.density?.specifications || 'Especificaciones'}</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-sm text-neutral mt-3">
                  {product.Variants?.[0]?.attributes && Object.keys(product.Variants[0].attributes).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(product.Variants[0].attributes).map(([key, val]) => (
                        <li key={key} className="flex border-b border-gray-50 pb-1">
                          <span className="w-1/3 font-bold text-gray-500 capitalize">{key}</span>
                          <span className="w-2/3">{String(val)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic opacity-60">{dict?.density?.noSpecs || 'No hay especificaciones adicionales.'}</p>
                  )}
                </div>
              </details>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              
              {/* Seller Context Block */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                    <Store className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary">
                      {dict?.density?.storeName?.replace('{name}', product.Store?.name || 'Store') || `Tienda: ${product.Store?.name || 'Desconocida'}`}
                    </p>
                    {product.Store?.kycStatus === 'APPROVED' && (
                      <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        {dict?.density?.verifiedSeller || 'Vendedor Verificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-xl shadow-gray-200/50">
                <div className="flex items-start gap-3 mb-4 md:mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <Truck className="w-4 h-4 md:w-5 md:h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs md:text-sm font-bold text-secondary">{dict?.density?.deliveryTrust || 'Entrega y Confianza'}</p>
                    <p className="text-[10px] md:text-xs text-neutral mt-0.5">{dict?.density?.deliveryDisclaimer || 'Envío/retiro según disponibilidad y ubicación'}</p>
                  </div>
                </div>
                {product.Variants && product.Variants.length > 0 ? (
                  <CheckoutButton
                    tenantId={tenant.id}
                    variantId={product.Variants[0].id}
                  />
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-3 md:py-4 rounded-xl text-base md:text-lg cursor-not-allowed">
                    {dict?.pdp?.outOfStock || 'Agotado'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-secondary">
                {dict?.density?.relatedProducts || 'Productos Relacionados'}
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-8">
              {relatedProducts.map((p) => (
                <div key={p.id} className="snap-start">
                  <ProductCard 
                    product={p}
                    tenantId={tenant.id}
                    currencyCode={tenant.currencyCode}
                    country={country}
                    dict={dict}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
