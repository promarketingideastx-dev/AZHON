import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ProductCard } from '@/components/ui/ProductCard';
import Link from 'next/link';
import { 
  Package, 
  CheckCircle, 
  FileText, 
  Eye, 
  Heart, 
  ShoppingCart, 
  AlertCircle, 
  Image as ImageIcon,
  Clock,
  PauseCircle
} from 'lucide-react';
import { getDictionary, defaultLocale } from '@/i18n';
import { cookies } from 'next/headers';

export default async function SellerDashboardPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);

  if (!user) {
    redirect(`/${country}/login`);
  }

  // Fetch the store
  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { Tenant: true }
  });

  if (!store || store.Tenant.countryCode !== countryCode) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-secondary mb-2">{dict?.sellerProfile?.noStoreTitle || 'Aún no tienes una tienda'}</h2>
        <p className="text-neutral">{dict?.sellerProfile?.noStoreDesc || 'Contacta a soporte para habilitar tu cuenta de vendedor.'}</p>
      </div>
    );
  }

  const storeId = store.id;

  // 1. Catalog Health (Counts)
  const totalProducts = await prisma.product.count({ where: { storeId } });
  
  const publishedProducts = await prisma.productPublication.count({
    where: { 
      Product: { storeId },
      status: 'PUBLISHED' 
    }
  });

  const draftProducts = await prisma.product.count({
    where: { storeId, status: 'DRAFT' }
  });

  const inReviewProducts = await prisma.product.count({
    where: { storeId, status: 'IN_REVIEW' }
  });

  const rejectedProducts = await prisma.product.count({
    where: { storeId, status: 'REJECTED' }
  });

  const pausedProducts = await prisma.productPublication.count({
    where: {
      Product: { storeId },
      status: 'PAUSED'
    }
  });

  // Find products without media
  const productsWithoutMedia = await prisma.product.count({
    where: {
      storeId,
      Media: { none: {} }
    }
  });

  // 2. Engagement / Real Metrics
  const metricsAggregation = await prisma.productMetric.aggregate({
    where: { Product: { storeId } },
    _sum: {
      views: true,
      favorites: true,
      salesCount: true
    }
  });

  const totalViews = metricsAggregation._sum.views || 0;
  const totalFavorites = metricsAggregation._sum.favorites || 0;
  const soldUnits = metricsAggregation._sum.salesCount || 0;

  // 3. Top Performers (Top 3 published products by sales, then views)
  const topProducts = await prisma.product.findMany({
    where: { 
      storeId,
      Publication: { status: 'PUBLISHED' }
    },
    include: {
      Store: true,
      Variants: true,
      Category: true,
      Media: true,
      Metrics: true
    },
    orderBy: [
      { Metrics: { salesCount: 'desc' } },
      { Metrics: { views: 'desc' } }
    ],
    take: 3
  });

  const needsAttentionCount = productsWithoutMedia + rejectedProducts + pausedProducts;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-secondary">
            {dict?.sellerProfile?.dashboardTitle || 'Dashboard Operacional'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{store.name}</p>
        </div>
        <Link 
          href={`/${country}/vendedor/productos/nuevo`}
          className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 shadow-sm transition-all"
        >
          {dict?.sellerProfile?.createProductBtn || '+ Crear Producto'}
        </Link>
      </div>

      {/* LAYER 1: Catalog Health */}
      <section>
        <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          {dict?.dashboardMetrics?.catalogHealth || 'Salud del Catálogo'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard className="flex flex-col p-5">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{dict?.dashboardMetrics?.totalProducts || 'Total'}</div>
            <div className="text-3xl font-black text-secondary">{totalProducts}</div>
          </DashboardCard>
          
          <DashboardCard className="flex flex-col p-5 border-l-4 border-l-green-500">
            <div className="text-green-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {dict?.dashboardMetrics?.published || 'Publicados'}
            </div>
            <div className="text-3xl font-black text-green-700">{publishedProducts}</div>
          </DashboardCard>

          <DashboardCard className="flex flex-col p-5 border-l-4 border-l-blue-500">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {dict?.dashboardMetrics?.inReview || 'En Revisión'}
            </div>
            <div className="text-3xl font-black text-blue-700">{inReviewProducts}</div>
          </DashboardCard>

          <DashboardCard className="flex flex-col p-5">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> {dict?.dashboardMetrics?.draft || 'Borradores'}
            </div>
            <div className="text-3xl font-black text-gray-600">{draftProducts}</div>
          </DashboardCard>
        </div>
      </section>

      {/* LAYER 2: Engagement (Real Metrics) */}
      <section>
        <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          {dict?.dashboardMetrics?.engagement || 'Tracción Real'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard className="flex items-center gap-4 p-5 bg-gradient-to-br from-white to-gray-50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
              <Eye className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{dict?.dashboardMetrics?.totalViews || 'Vistas Totales'}</div>
              <div className="text-2xl font-black text-secondary">{totalViews}</div>
            </div>
          </DashboardCard>

          <DashboardCard className="flex items-center gap-4 p-5 bg-gradient-to-br from-white to-pink-50/30">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{dict?.dashboardMetrics?.totalFavorites || 'Favoritos'}</div>
              <div className="text-2xl font-black text-secondary">{totalFavorites}</div>
            </div>
          </DashboardCard>

          <DashboardCard className="flex items-center gap-4 p-5 bg-gradient-to-br from-white to-orange-50/50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{dict?.dashboardMetrics?.soldUnits || 'Unidades Vendidas'}</div>
              <div className="text-2xl font-black text-primary">{soldUnits}</div>
            </div>
          </DashboardCard>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LAYER 3: Actionable Bottlenecks */}
        <section className="lg:col-span-1">
          <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            {dict?.dashboardMetrics?.needsAttention || 'Requiere Atención'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {needsAttentionCount === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">{dict?.dashboardMetrics?.allGood || 'Todo en orden. No hay productos que requieran acción inmediata.'}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {productsWithoutMedia > 0 && (
                  <li className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-bold text-secondary">{dict?.dashboardMetrics?.missingMedia || 'Sin Imágenes'}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 font-black text-xs px-2 py-1 rounded-md">{productsWithoutMedia}</span>
                  </li>
                )}
                {rejectedProducts > 0 && (
                  <li className="p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-bold text-red-700">{dict?.dashboardMetrics?.rejected || 'Rechazados'}</span>
                    </div>
                    <span className="bg-red-100 text-red-700 font-black text-xs px-2 py-1 rounded-md">{rejectedProducts}</span>
                  </li>
                )}
                {pausedProducts > 0 && (
                  <li className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <PauseCircle className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-600">{dict?.dashboardMetrics?.paused || 'Pausados'}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-600 font-black text-xs px-2 py-1 rounded-md">{pausedProducts}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>

        {/* LAYER 4: Top Performers */}
        <section className="lg:col-span-2">
          <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {dict?.dashboardMetrics?.topPerformers || 'Top Productos'}
          </h2>
          
          {topProducts.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-4">
              {topProducts.map((p) => (
                <div key={p.id} className="snap-start flex-shrink-0">
                  <ProductCard 
                    product={p} 
                    tenantId={store.tenantId} 
                    currencyCode={store.Tenant.currencyCode} 
                    country={country} 
                    dict={dict} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">{dict?.dashboardMetrics?.noTopPerformers || 'Aún no hay productos publicados con métricas para mostrar.'}</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
