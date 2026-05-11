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
    take: 36,
  });

  const tenantId = tenant.id;
  const activeMode = GLOBAL_HOME_CONFIG.activeMode;

  // Safe slicing to ensure blocks never disappear if the database has less than 24 products in dev
  const safeProducts1 = realProducts.slice(0, 8);
  const safeProducts2 = realProducts.length > 8 ? realProducts.slice(8, 16) : realProducts;
  const safeProducts3 = realProducts.length > 16 ? realProducts.slice(16, 24) : realProducts;
  const safeProductsFeed = realProducts.length > 24 ? realProducts.slice(24) : realProducts;

  return (
    <div className="w-full bg-white">
      {/* 1. HERO SECTION (Always Top) */}
      <HomeHero dict={dict} country={country} currencyCode={tenant.currencyCode} />

      {/* CONDITIONAL ARCHITECTURE ROUTING */}
      {activeMode === 'HOME_NORMAL' ? (
        <>
          {/* BENEFIT STRIP (Traditional Top) */}
          <BenefitStrip dict={dict} />

          {/* CATEGORIES UP TOP FOR TRADITIONAL MARKETPLACE */}
          <ExploreCategories dict={dict} country={country} />

          {/* FLASH DEALS */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
            <FlashDealsCarousel products={safeProducts1} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} dict={dict} />
          </section>

          {/* AMAZON-STYLE CATEGORY QUADS */}
          <CategoryQuadGrid dict={dict} country={country} products={safeProducts2} />

          {/* TOP DEALS / NEW ARRIVALS */}
          <FeaturedProductsGrid dict={dict} products={safeProductsFeed} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} />

          {/* COMMERCIAL BANNERS */}
          <CommercialBanners dict={dict} />
          
          {/* SELLER CTA */}
          <SellerPartnershipCta dict={dict} country={country} />
        </>
      ) : (
        <>
          {/* HOME_PRODUCT_FEED MODE - Discovery First (Reordered via User Request) */}
          
          {/* FLASH DEALS - Moved immediately after Hero */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
            <FlashDealsCarousel products={safeProducts1} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} dict={dict} />
          </section>

          {/* CATEGORIES - Moved after Flash Deals */}
          <ExploreCategories dict={dict} country={country} />

          {/* FIRST DISCOVERY BLOCK: Por si te interesa */}
          <DiscoveryBlock 
            title={dict?.home?.just_for_you || 'Por si te interesa'} 
            products={safeProducts2} 
            tenantId={tenantId} 
            currencyCode={tenant.currencyCode} 
            country={country} 
            dict={dict} 
          />

          {/* SECOND DISCOVERY BLOCK: Relacionado a últimas compras */}
          <div className="bg-gray-50 border-y border-gray-100">
            <DiscoveryBlock 
              title={dict?.home?.related_purchases || 'Relacionado a tus últimas compras'} 
              products={safeProducts3} 
              tenantId={tenantId} 
              currencyCode={tenant.currencyCode} 
              country={country} 
              dict={dict} 
            />
          </div>

          {/* COMMERCIAL BANNERS */}
          <CommercialBanners dict={dict} />

          {/* FEED CONTINUATION */}
          <FeaturedProductsGrid dict={dict} products={safeProductsFeed} tenantId={tenantId} currencyCode={tenant.currencyCode} country={country} />

          {/* SELLER CTA */}
          <SellerPartnershipCta dict={dict} country={country} />

          {/* BENEFIT STRIP - Moved to the bottom just before the footer */}
          <BenefitStrip dict={dict} />
        </>
      )}
    </div>
  );
}
