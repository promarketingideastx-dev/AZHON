import { prisma } from '@/lib/prisma';
import FlashDealsCarousel from '@/app/components/FlashDealsCarousel';
import HomeHero from '@/app/components/HomeHero';
import ExploreCategories from '@/app/components/ExploreCategories';
import FeaturedProductsGrid from '@/app/components/FeaturedProductsGrid';
import CommercialBanners from '@/app/components/CommercialBanners';
import CategoryQuadGrid from '@/app/components/CategoryQuadGrid';
import SellerPartnershipCta from '@/app/components/SellerPartnershipCta';
import BenefitStrip from '@/app/components/BenefitStrip';
import DiscoveryBlock from '@/app/components/DiscoveryBlock';

import { GLOBAL_HOME_CONFIG } from '@/config/home';
import { cookies } from 'next/headers';
import { getDictionary, defaultLocale } from '@/i18n';

export const dynamic = 'force-dynamic';

export default async function Home({ params }: { params: { country: string } }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  const dict = getDictionary(locale);
  const country = (await params).country;
  const countryCode = country.toUpperCase();

  // Resolve tenant from DB based on country route
  const tenant = await prisma.tenant.findUnique({
    where: { countryCode }
  });

  if (!tenant) {
    return <div>Tenant not found for {countryCode}</div>;
  }

  // Fetch products for all blocks
  // In a real scenario, different blocks would have different targeted queries (e.g., related, popular, new)
  const realProducts = await prisma.product.findMany({
    where: { 
      tenantId: tenant.id,
      Publication: { status: 'PUBLISHED' }
    },
    include: {
      Store: true,
      Variants: true,
      Category: true,
      Metrics: true,
      Media: true,
    },
    take: 36, // Enough data to feed multiple blocks without exhausting immediately
  });

  const tenantId = tenant.id;
  const activeMode = GLOBAL_HOME_CONFIG.activeMode;

  return (
    <div className="w-full bg-white">
      {/* 1. HERO SECTION (Always Top) */}
      <HomeHero dict={dict} country={country} currencyCode={tenant.currencyCode} />

      {/* 2. BENEFIT STRIP (Always under Hero) */}
      <BenefitStrip dict={dict} />

      {/* CONDITIONAL ARCHITECTURE ROUTING */}
      {activeMode === 'HOME_NORMAL' ? (
        <>
          {/* CATEGORIES UP TOP FOR TRADITIONAL MARKETPLACE */}
          <ExploreCategories dict={dict} country={country} />

          {/* FLASH DEALS */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
            <FlashDealsCarousel products={realProducts.slice(0, 8)} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} dict={dict} />
          </section>

          {/* AMAZON-STYLE CATEGORY QUADS */}
          <CategoryQuadGrid dict={dict} country={country} products={realProducts.slice(8, 20)} />

          {/* TOP DEALS / NEW ARRIVALS */}
          <FeaturedProductsGrid dict={dict} products={realProducts.slice(20)} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} />

          {/* COMMERCIAL BANNERS */}
          <CommercialBanners dict={dict} />
        </>
      ) : (
        <>
          {/* HOME_PRODUCT_FEED MODE - Discovery First */}
          {/* FLASH DEALS - Urgency drives discovery */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
            <FlashDealsCarousel products={realProducts.slice(0, 8)} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} dict={dict} />
          </section>

          {/* FIRST DISCOVERY BLOCK: Por si te interesa */}
          <DiscoveryBlock 
            title={dict?.home?.just_for_you || 'Por si te interesa'} 
            products={realProducts.slice(8, 16)} 
            tenantId={tenantId} 
            currencyCode={tenant.currencyCode} 
            country={country} 
            dict={dict} 
          />

          {/* SECOND DISCOVERY BLOCK: Relacionado a últimas compras */}
          <div className="bg-gray-50 border-y border-gray-100">
            <DiscoveryBlock 
              title={dict?.home?.related_purchases || 'Relacionado a tus últimas compras'} 
              products={realProducts.slice(16, 24)} 
              tenantId={tenantId} 
              currencyCode={tenant.currencyCode} 
              country={country} 
              dict={dict} 
            />
          </div>

          {/* COMMERCIAL BANNERS / SEASONAL */}
          <CommercialBanners dict={dict} />

          {/* CATEGORIES PUSHED DOWN */}
          <ExploreCategories dict={dict} country={country} />

          {/* FEED CONTINUATION */}
          <FeaturedProductsGrid dict={dict} products={realProducts.slice(24)} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} />
        </>
      )}

      {/* SELLER CTA (Always Bottom) */}
      <SellerPartnershipCta dict={dict} country={country} />
    </div>
  );
}
