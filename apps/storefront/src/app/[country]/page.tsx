import { prisma } from '@/lib/prisma';
import FlashDealsCarousel from '@/app/components/FlashDealsCarousel';
import HomeHero from '@/app/components/HomeHero';
import ExploreCategories from '@/app/components/ExploreCategories';
import FeaturedProductsGrid from '@/app/components/FeaturedProductsGrid';
import CommercialBanners from '@/app/components/CommercialBanners';
import CategoryQuadGrid from '@/app/components/CategoryQuadGrid';
import SellerPartnershipCta from '@/app/components/SellerPartnershipCta';

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
    // Basic fallback or error state if tenant not found
    return <div>Tenant not found for {countryCode}</div>;
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: tenant.currencyCode,
    }).format(amount / 100);
  };

  const realProducts = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: {
      Store: true,
      Variants: true,
    },
    take: 8, // Max 8 for carousels
  });

  const tenantId = tenant.id;

  return (
    <div className="w-full bg-white">
      {/* 1. HERO SECTION */}
      <HomeHero dict={dict} country={country} />

      {/* 2. CATEGORIES SECTION */}
      <ExploreCategories dict={dict} country={country} />

      {/* 3. FLASH DEALS (REAL DATA) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <FlashDealsCarousel products={realProducts} tenantId={tenantId} />
      </section>

      {/* 4. NEW ARRIVALS & TRENDING */}
      <FeaturedProductsGrid dict={dict} />

      {/* 5. COMMERCIAL BANNERS */}
      <CommercialBanners dict={dict} />

      {/* 5.5 AMAZON-STYLE CATEGORY QUADS */}
      <CategoryQuadGrid dict={dict} country={country} />

      {/* 6. PARTNERSHIP / SELLER CTA */}
      <SellerPartnershipCta dict={dict} country={country} />
    </div>
  );
}

