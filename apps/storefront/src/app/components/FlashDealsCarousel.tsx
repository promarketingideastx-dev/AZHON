'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function FlashDealsCarousel({ products, tenantId, currencyCode = 'USD', country, dict }: { products: any[], tenantId: string, currencyCode?: string, country: string, dict: any }) {
  // =========================================================================
  // FLASH DEALS COMMERCIAL RULE (DNA):
  // The structure must remain visible per AZHON Home rules.
  // We are removing fake urgency (fake 85% discounts) and using an honest fallback
  // until the real promotion engine is connected.
  // =========================================================================

  // --- MOTHER STRUCTURE SHELL (PREMIUM ORANGE) ---
  // Restored UI structure with honest pricing.
  
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
      const cardWidth = 260; // Slightly tighter width for urgency
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
    <div id="flash-deals" className="bg-gradient-to-r from-[#FF5500] via-[#FF4400] to-[#FF2200] rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-orange-500/20 relative overflow-hidden mt-8 border border-orange-400/30">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Header Flash Deals */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/15 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">
              FLASH DEALS
            </h2>
          </div>
          
          {/* Trust/Urgency Pill */}
          <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-white/20 w-fit backdrop-blur-md shadow-inner">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
               <span className="text-white/90 text-xs font-black uppercase tracking-widest">Termina En:</span>
             </div>
             <span className="text-white font-mono font-bold tracking-widest text-lg">{hrs}:{mins}:{secs}</span>
          </div>
        </div>
        <Link href={`/${country}/ofertas`} className="bg-white text-[#FF4400] hover:bg-gray-50 px-8 py-3 rounded-full text-sm font-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-wide">
          Shop All Deals
        </Link>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative z-10 -mx-6 md:-mx-10 px-6 md:px-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-6 pt-2"
        >
          {displayProducts.map((product, index) => (
            // Sleek card for deals
            <Link href={`/${country}/producto/${product.id}`} key={`${product.id}-${index}`} className="min-w-[240px] md:min-w-[260px] bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-orange-200">
              <div className="relative h-[220px] bg-gray-50 flex items-center justify-center p-6 group-hover:bg-gray-100 transition-colors">
                <img src={product?.Media?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt={product.title} />
              </div>
              <div className="p-5 flex flex-col flex-1 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-3 group-hover:text-[#FF4400] transition-colors">{product.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-black text-[#FF4400] tracking-tight">{currencyCode} {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-100">
                    {dict?.home?.limited_quantities || 'Cantidades Limitadas'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF4400] group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
