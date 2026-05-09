'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// import { ProductCard } from '@/components/ui/ProductCard';

export default function FlashDealsCarousel({ products, tenantId, currencyCode = 'USD', country, dict }: { products: any[], tenantId: string, currencyCode?: string, country: string, dict: any }) {
  // =========================================================================
  // FLASH DEALS COMMERCIAL RULE (DNA):
  // DO NOT SHOW Flash Deals if there is no real discount data (ProductDiscount, Campaign).
  // Currently, the DB only has `basePrice`. Showing base prices as Flash Deals is Fake Urgency.
  // We return null to hide this section entirely until the engine is built.
  // =========================================================================
  return null;

  /*
  // --- MOTHER STRUCTURE SHELL (PREMIUM ORANGE) ---
  // Restore this UI structure when real deals are available.
  
  const [timeLeft, setTimeLeft] = useState(15959); // 04:25:59
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Array duplicado para dar ilusión de infinito. 
  const displayProducts = [...products, ...products];

  // Timer para el countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer para el Auto-Scroll infinito
  useEffect(() => {
    if (isHovered || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTimer = setInterval(() => {
      const cardWidth = 296; 
      if (container.scrollLeft >= (products.length * cardWidth)) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = 0;
        requestAnimationFrame(() => {
          container.style.scrollBehavior = 'smooth';
          container.scrollLeft += cardWidth;
        });
      } else {
        container.style.scrollBehavior = 'smooth';
        container.scrollLeft += cardWidth;
      }
    }, 3000);
    return () => clearInterval(scrollTimer);
  }, [isHovered, products.length]);

  const hrs = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const mins = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div id="flash-deals" className="bg-gradient-to-r from-[#FF5500] to-[#FF3300] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mt-8">
      {/* Header Flash Deals *\/}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase">
              FLASH DEALS
            </h2>
          </div>
          
          {/* Trust/Urgency Pill *\/}
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 w-fit backdrop-blur-sm">
             <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Ends In:</span>
             <span className="text-white font-mono font-bold tracking-widest">{hrs}:{mins}:{secs}</span>
          </div>
        </div>
        <Link href={`/${country}/ofertas`} className="bg-white text-orange-600 hover:bg-gray-50 px-6 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">
          Shop All Deals
        </Link>
      </div>

      {/* Carousel Container *\/}
      <div 
        className="relative z-10 -mx-6 md:-mx-8 px-6 md:px-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-6 pt-2"
        >
          {displayProducts.map((product, index) => (
            // IMPORTANT: Create a specific compact/sleek variant or a separate sleek card for deals
            // DO NOT use the bloated general ProductCard here to avoid breaking the premium mother structure.
            <div key={`${product.id}-${index}`} className="min-w-[280px] bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-[200px] bg-gray-100 flex items-center justify-center p-4">
                <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider z-10">
                  -15% OFF
                </span>
                <img src={product?.Media?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"} className="max-h-full object-contain drop-shadow-md mix-blend-multiply" alt={product.title} />
              </div>
              <div className="p-5 flex flex-col flex-1 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-2">{product.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-black text-orange-600">{currencyCode} {product.basePrice * 0.85}</span>
                  <span className="text-xs text-gray-400 line-through">{currencyCode} {product.basePrice}</span>
                </div>
                <div className="mt-auto">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">85% claimed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  */
}
