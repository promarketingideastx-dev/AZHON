import Link from 'next/link';
import { Store, TrendingUp } from 'lucide-react';

export default function CategoryQuadGrid({ dict, country, products }: { dict: any, country: string, products: any[] }) {
  if (!products || products.length < 5) return null;

  // Simulate slices for the asymmetric Mother Structure blocks
  const newArrivals = products.slice(0, 2);
  const bestSellers = products.slice(2, 5);
  // We use the 6th product or fallback to the first for the Solo Para Ti block image
  const promoProduct = products[5] || products[0];

  return (
    <section className="bg-white py-12 w-full border-t border-gray-100 mt-8 mb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: NEW ARRIVALS (Descubre Más) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Descubre Más</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex-1 border border-gray-100">
              <div className="grid grid-cols-2 gap-4 h-full">
                {newArrivals.map((product, idx) => (
                  <Link href={`/${country}/producto/${product.id}`} key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col border border-gray-100">
                    <div className="aspect-square bg-white flex items-center justify-center p-4">
                      {product.Media?.[0]?.url ? (
                        <img src={product.Media[0].url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-[10px] text-neutral opacity-50">Sin foto</span>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-50 flex-1 flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">{product.Category?.name || 'Categoría'}</span>
                      <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.title}</h3>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="text-primary font-black text-sm">HNL {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: MAS VENDIDOS (Best Sellers) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Más Vendidos</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 flex-1 flex flex-col gap-4 border border-gray-100">
              {bestSellers.map((product, idx) => (
                <Link href={`/${country}/producto/${product.id}`} key={idx} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group flex items-center gap-4 border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 p-2">
                    {product.Media?.[0]?.url ? (
                      <img src={product.Media[0].url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="text-[10px] text-neutral opacity-50">Sin foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> # {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-1">{product.title}</h3>
                    <span className="text-primary font-black text-sm">HNL {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* COLUMN 3: SOLO PARA TI (Promo Block) */}
          <div className="lg:col-span-3 flex flex-col h-full">
             <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Solo para Ti</h2>
            </div>
            <Link href={`/${country}/producto/${promoProduct.id}`} className="bg-[#1A1816] rounded-2xl p-6 flex-1 relative overflow-hidden group block shadow-lg border border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
              {promoProduct.Media?.[0]?.url && (
                <div className="absolute inset-0 z-0 bg-white p-8">
                   <img src={promoProduct.Media[0].url} alt={promoProduct.title} className="w-full h-full object-contain opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="relative z-20 h-full flex flex-col justify-end">
                <span className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">{promoProduct.Category?.name || 'Recomendado'}</span>
                <h3 className="text-lg font-black text-white leading-tight mb-2 line-clamp-3">{promoProduct.title}</h3>
                <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl mt-4 self-start">Ver Oferta</span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
