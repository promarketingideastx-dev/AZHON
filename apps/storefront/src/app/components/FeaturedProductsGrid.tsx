import { ProductCard } from '@/components/ui/ProductCard';

export default function FeaturedProductsGrid({ dict, products, tenantId, currencyCode, country }: { dict: any, products: any[], tenantId: string, currencyCode: string, country: string }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 border-t border-gray-100 mt-12 mb-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Feed de Productos</h2>
          <p className="text-gray-600 text-sm mt-1">Navega el catálogo completo</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {products.map((product, i) => (
          <ProductCard 
            key={`${product.id}-${i}`}
            product={product}
            tenantId={tenantId}
            currencyCode={currencyCode}
            country={country}
            dict={dict}
            isFlashDeal={false}
          />
        ))}
      </div>
      
      <div className="flex justify-center mt-10">
         <button className="bg-white border border-gray-300 text-gray-800 font-bold px-8 py-3 rounded-full shadow-sm hover:bg-gray-50 transition-colors text-sm">
           Cargar más resultados
         </button>
      </div>
    </section>
  );
}
