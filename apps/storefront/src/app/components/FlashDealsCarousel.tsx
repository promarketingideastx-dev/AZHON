'use client';

import { useState, useEffect, useRef } from 'react';
import CheckoutButton from '@/components/CheckoutButton';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';

export default function FlashDealsCarousel({ products, tenantId, currencyCode = 'USD', country, dict }: { products: any[], tenantId: string, currencyCode?: string, country: string, dict: any }) {
  const [timeLeft, setTimeLeft] = useState(15959); // 04:25:59 en segundos
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Array duplicado para dar ilusión de infinito. 
  // No usamos 3x para evitar DOM gigante, 2x es suficiente.
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
      const cardWidth = 296; // 280 (card) + 16 (gap)
      
      // Si estamos en la segunda mitad (clonada), volvemos sigilosamente al inicio
      if (container.scrollLeft >= (products.length * cardWidth)) {
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = 0;
        // Restauramos comportamiento suave y avanzamos una tarjeta
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

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#FF5500] to-[#FF3300] rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-orange-500/30 relative overflow-hidden">
      {/* Header Flash Deals */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-200 drop-shadow-sm uppercase">
            ⚡ FLASH DEALS
          </h2>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative z-10 -mx-6 md:-mx-10 px-6 md:px-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-8 pt-2"
        >
          {displayProducts.map((product, index) => (
            <ProductCard 
              key={`${product.id}-${index}`}
              product={product}
              tenantId={tenantId}
              currencyCode={currencyCode}
              country={country}
              dict={dict}
              isFlashDeal={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
