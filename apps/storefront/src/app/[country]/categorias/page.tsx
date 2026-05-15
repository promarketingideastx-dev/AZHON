import { cookies } from "next/headers";
import { getDictionary, defaultLocale } from "@/i18n";
import { CATALOG_CATEGORIES } from "@/config/categories";
import { AdultWarning } from "@/components/AdultWarning";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FlashDealsCarousel from "@/app/components/FlashDealsCarousel";
import DiscoveryBlock from "@/app/components/DiscoveryBlock";

// Helper para resolver paths tipo "categories.cell_phones.title" en el objeto dict
function resolvePath(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}

export default async function CategoriesPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const countryCode = country.toUpperCase();

  // Resolve tenant
  const tenant = await prisma.tenant.findUnique({
    where: { countryCode }
  });

  // Fetch products for mobile commercial continuity
  let safeProducts1: any[] = [];
  let safeProducts2: any[] = [];
  
  if (tenant) {
    const realProducts = await prisma.product.findMany({
      where: { 
        tenantId: tenant.id,
        Publication: { status: 'PUBLISHED' }
      },
      include: { Store: true, Variants: true, Category: true, Metrics: true, Media: true },
      take: 16,
    });
    safeProducts1 = realProducts.slice(0, 8);
    safeProducts2 = realProducts.length > 8 ? realProducts.slice(8, 16) : realProducts;
  }

  return (
    <div className="w-full bg-warm min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-secondary text-white py-16 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {dict.categories.title}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {dict.categories?.subtitle || 'Explora nuestro catálogo completo con miles de productos en todas nuestras categorías principales.'}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {CATALOG_CATEGORIES.map((cat) => {
            const title = resolvePath(dict, cat.i18nKey) || cat.id;
            
            const content = (
              <div className="bg-white rounded-xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group relative">
                
                {/* Mobile Compact View (Icon + Bg Only) */}
                <div className="md:hidden h-24 w-full relative bg-gray-50 flex flex-col items-center justify-center p-2 group-hover:bg-orange-50 transition-colors">
                   <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{cat.icon}</div>
                   <h2 className="text-[11px] font-bold text-center text-secondary leading-tight line-clamp-2 px-1">{title}</h2>
                </div>

                {/* Desktop Rich Editorial View */}
                <div className="hidden md:block h-48 w-full relative overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                  <img src={cat.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full text-2xl shadow-lg z-20">
                    {cat.icon}
                  </div>
                </div>
                
                {/* Desktop Info Area */}
                <div className="hidden md:flex p-6 md:p-8 flex-1 flex-col">
                  <h2 className="text-2xl font-black text-secondary tracking-tight mb-6">
                    {title}
                  </h2>
                  
                  <ul className="space-y-3 flex-1">
                    {cat.subcategories.map((sub) => {
                      const subTitle = resolvePath(dict, sub.i18nKey) || sub.id;
                      return (
                        <li key={sub.id}>
                          <Link href={`/${country}/categorias/${cat.id}?sub=${sub.id}`} className="text-neutral font-medium hover:text-primary hover:underline flex items-center gap-2 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {subTitle}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <span className="text-primary font-bold hover:text-orange-700 flex items-center gap-2 group-hover:text-orange-600">
                      {dict.home.see_all} {title}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            );

            return (
              <Link href={`/${country}/categorias/${cat.id}`} key={cat.id} className="block h-full outline-none">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* MOBILE ONLY: COMMERCIAL CONTINUITY BLOCKS            */}
      {/* (Injected to prevent dead-end browsing on mobile)    */}
      {/* ==================================================== */}
      {tenant && (
        <div className="md:hidden flex flex-col gap-2 pb-10">
          <section className="px-4 py-2">
            <FlashDealsCarousel 
              products={safeProducts1} 
              tenantId={tenant.id} 
              currencyCode={tenant.currencyCode} 
              country={country} 
              dict={dict} 
            />
          </section>

          <div className="bg-[#FAF8F5] border-y border-[#F0EBE1] mt-4">
            <DiscoveryBlock 
              title={dict?.home?.just_for_you || 'Por si te interesa'} 
              badgeText={dict?.home?.azhon_selection || 'Selección AZHON'}
              products={safeProducts2} 
              tenantId={tenant.id} 
              currencyCode={tenant.currencyCode} 
              country={country} 
              dict={dict} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
