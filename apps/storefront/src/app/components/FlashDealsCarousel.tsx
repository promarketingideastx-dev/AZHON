'use client';

import { useState, useEffect, useRef } from 'react';
import CheckoutButton from '@/components/CheckoutButton';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function FlashDealsCarousel({ products, tenantId }: { products: any[], tenantId: string }) {
  const [timeLeft, setTimeLeft] = useState(15959); // 04:25:59 en segundos
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Timer para el countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const mins = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#FF5500] to-[#FF3300] rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-orange-500/30 relative overflow-hidden">
      {/* Header Flash Deals */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-200 drop-shadow-sm uppercase">
            ⚡ FLASH DEALS
          </h2>
          <div className="flex items-center gap-3 bg-red-700/80 rounded-full px-5 py-2.5 shadow-inner border border-red-500/50">
            <span className="text-yellow-200 text-sm font-black uppercase tracking-widest drop-shadow">Ends in:</span>
            <div className="flex items-center gap-1 font-mono text-white font-black text-2xl drop-shadow-md">
              <span className="bg-red-950/80 px-3 py-1 rounded-lg shadow-lg">{hrs}</span><span className="text-xl px-0.5 animate-pulse text-yellow-300">:</span>
              <span className="bg-red-950/80 px-3 py-1 rounded-lg shadow-lg">{mins}</span><span className="text-xl px-0.5 animate-pulse text-yellow-300">:</span>
              <span className="bg-red-950/80 px-3 py-1 rounded-lg shadow-lg text-yellow-400">{secs}</span>
            </div>
          </div>
        </div>
        <button className="bg-white text-primary font-black px-6 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm shadow-xl hover:scale-105 transform duration-200 uppercase tracking-widest">
          Shop All Deals
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative z-10 -mx-6 md:-mx-10 px-6 md:px-10">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-8 pt-2"
        >
          {products.map((product, idx) => {
            const fakeDiscount = [45, 30, 60, 10][idx % 4];
            const fakeOldPrice = (product.basePrice / 100) * (1 + fakeDiscount / 100);
            const fakeClaimed = [85, 40, 93, 25][idx % 4];

            return (
              <div key={product.id} className="min-w-[280px] w-[280px] snap-start bg-white rounded-2xl p-4 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative group flex-shrink-0">
                {/* Badge con Llama */}
                <div className="absolute top-0 left-0 z-10 bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-br-2xl rounded-tl-2xl shadow-lg border border-red-500/50 flex items-center gap-1.5">
                  <span className="text-lg leading-none">🔥</span> -{fakeDiscount}% OFF
                </div>

                <div className="aspect-square bg-[#FCF9F6] rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center mt-6">
                  <img src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop"} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-secondary text-sm line-clamp-2 leading-snug mb-2">
                    {product.title}
                  </h3>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-primary font-black text-2xl drop-shadow-sm">
                      HNL {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-neutral text-xs line-through mb-1.5 opacity-60 font-bold">
                      HNL {fakeOldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-auto mb-5">
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-red-500 to-[#FF5500] h-2 rounded-full" style={{ width: `${fakeClaimed}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <span>⚡</span> {fakeClaimed}% claimed • {100 - fakeClaimed} left
                    </p>
                  </div>

                  {product.Variants && product.Variants.length > 0 ? (
                    <CheckoutButton
                      tenantId={tenantId}
                      variantId={product.Variants[0].id}
                    />
                  ) : (
                    <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-2.5 rounded-xl text-sm cursor-not-allowed">
                      Agotado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
