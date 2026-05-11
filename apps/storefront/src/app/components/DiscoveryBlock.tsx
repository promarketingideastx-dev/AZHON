import { ProductCard } from '@/components/ui/ProductCard';

export default function DiscoveryBlock({ 
  title, 
  subtitle, 
  products, 
  tenantId, 
  currencyCode, 
  country, 
  dict,
  badgeText
}: { 
  title: string, 
  subtitle?: string, 
  products: any[], 
  tenantId: string, 
  currencyCode: string, 
  country: string, 
  dict: any,
  badgeText?: string
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 md:py-12">
      <div className="mb-8">
        {badgeText && (
          <span className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm mb-3">
            {badgeText}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-2 font-medium">{subtitle}</p>}
      </div>

      <div className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory hide-scrollbar pb-8 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((product, index) => (
          <div key={`${product.id}-${index}`} className="min-w-[150px] sm:min-w-[240px] md:min-w-[280px] snap-start">
            <ProductCard 
              product={product}
              tenantId={tenantId}
              currencyCode={currencyCode}
              country={country}
              dict={dict}
              isFlashDeal={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
