import { ProductCard } from '@/components/ui/ProductCard';

export default function DiscoveryBlock({ 
  title, 
  subtitle, 
  products, 
  tenantId, 
  currencyCode, 
  country, 
  dict 
}: { 
  title: string, 
  subtitle?: string, 
  products: any[], 
  tenantId: string, 
  currencyCode: string, 
  country: string, 
  dict: any 
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-6 pt-2">
        {products.map((product, index) => (
          <div key={`${product.id}-${index}`} className="min-w-[240px] md:min-w-[280px] snap-start">
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
