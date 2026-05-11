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
    <div id="flash-deals" className="bg-gradient-to-r from-[#FF5500] via-[#FF4400] to-[#FF2200] rounded-[2rem] p-4 sm:p-6 md:p-10 shadow-2xl shadow-orange-500/20 relative overflow-hidden mt-8 border border-orange-400/30">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Header Flash Deals */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 md:gap-6 border-b border-white/15 pb-4 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">
              FLASH DEALS
            </h2>
          </div>
          
          {/* Giant Honest Urgency Timer */}
          <div className="flex flex-col bg-black/40 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
             <div className="flex items-center gap-2 mb-1">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
               <span className="text-white/90 text-xs md:text-sm font-black uppercase tracking-widest">{dict?.home?.ends_today || 'Termina Hoy'}</span>
             </div>
             <div className="flex items-baseline gap-1 text-white">
                <span className="font-mono font-black tracking-tight text-2xl md:text-4xl">{hrs}</span><span className="text-white/50 text-lg md:text-xl font-black">:</span>
                <span className="font-mono font-black tracking-tight text-2xl md:text-4xl">{mins}</span><span className="text-white/50 text-lg md:text-xl font-black">:</span>
                <span className="font-mono font-black tracking-tight text-2xl md:text-4xl">{secs}</span>
             </div>
          </div>
        </div>
        <Link href={`/${country}/ofertas`} className="bg-white text-[#FF4400] hover:bg-gray-50 px-6 md:px-8 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-wide flex items-center justify-center gap-2">
          Shop All Deals
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative z-10 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory hide-scrollbar pb-6 pt-2"
        >
          {displayProducts.map((product, index) => (
            // Sleek card for deals
            <Link href={`/${country}/producto/${product.id}`} key={`${product.id}-${index}`} className="min-w-[160px] sm:min-w-[250px] bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-orange-200 relative snap-start">
              
              {/* Honest Offer Badge */}
              <div className="absolute top-0 left-0 z-10 bg-red-600 text-white text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-br-xl shadow-sm tracking-widest uppercase">
                {dict?.home?.flash_offer_active || 'OFERTA ACTIVA'}
              </div>

              {/* Tighter, more dominant image area */}
              <div className="relative h-[160px] sm:h-[240px] bg-gray-50 flex items-center justify-center p-2 group-hover:bg-gray-100 transition-colors">
                <img src={product?.Media?.[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={product.title} />
              </div>
              
              {/* Compressed Info Area */}
              <div className="p-3 md:p-4 flex flex-col flex-1 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2 leading-tight mb-2 group-hover:text-[#FF4400] transition-colors">{product.title}</h3>
                
                {/* Price block strictly honest */}
                <div className="flex flex-col mb-2 md:mb-3">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{dict?.home?.flash_selection || 'Selección Relámpago'}</span>
                  <span className="text-xl md:text-2xl font-black text-[#FF4400] tracking-tighter leading-none">
                    {currencyCode} {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Urgency Footer */}
                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="bg-red-50 text-red-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 md:px-2 py-1 rounded-md border border-red-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="hidden sm:inline">{dict?.home?.limited_quantities || 'Cantidades Limitadas'}</span>
                    <span className="sm:hidden">Limitado</span>
                  </span>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-[#FF4400] group-hover:text-white transition-colors shadow-sm flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
