import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';
import FeaturedProductsGrid from '@/app/components/FeaturedProductsGrid';
import { CATALOG_CATEGORIES } from '@/config/categories';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: { country: string, slug: string } }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const country = (await params).country;
  const slug = (await params).slug;
  const countryCode = country.toUpperCase();

  // Validate if the slug exists in our static config
  const staticCategory = CATALOG_CATEGORIES.find(c => c.id === slug);

  // Helper to translate the category title
  const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };
  
  const categoryTitle = staticCategory ? (resolvePath(dict, staticCategory.i18nKey) || staticCategory.id) : slug;

  const tenant = await prisma.tenant.findUnique({
    where: { countryCode }
  });

  if (!tenant) {
    return <div>Tenant not found for {countryCode}</div>;
  }

  // Find products matching the category slug
  const realProducts = await prisma.product.findMany({
    where: { 
      tenantId: tenant.id,
      Publication: { status: 'PUBLISHED' },
      Category: {
        slug: slug
      }
    },
    include: {
      Store: true,
      Variants: true,
      Category: true,
      Metrics: true,
      Media: true,
    },
    take: 48,
  });

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="bg-secondary text-white py-12 px-4">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-gray-300">
            {dict.home?.explore_categories || 'Navega los productos de esta categoría'}
          </p>
        </div>
      </div>
      
      <div className="max-w-[1440px] mx-auto">
         {realProducts.length > 0 ? (
           <FeaturedProductsGrid dict={dict} products={realProducts} tenantId={tenant.id} currencyCode={tenant.currencyCode} country={country} />
         ) : (
           <div className="py-24 text-center">
             <div className="text-6xl mb-4 text-gray-200">🛒</div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos disponibles</h3>
             <p className="text-gray-500">Aún no hay productos publicados en esta categoría para tu región.</p>
           </div>
         )}
      </div>
    </div>
  );
}
