'use client';

import Link from 'next/link';
import CheckoutButton from '@/components/CheckoutButton';
import { Store, Eye, TrendingUp } from 'lucide-react';
import { trackProductClickAction } from '@/lib/events/tracking.actions';

interface ProductCardProps {
  product: any;
  tenantId: string;
  currencyCode: string;
  country: string;
  dict: any;
  isFlashDeal?: boolean;
}

export function ProductCard({ product, tenantId, currencyCode, country, dict, isFlashDeal }: ProductCardProps) {
  const primaryMedia = product.Media?.[0]?.url || product.imageUrl;
  
  const handleCardClick = () => {
    // Only track clicks for published products
    if (product.Publication?.status === 'PUBLISHED' || product.status === 'PUBLISHED') {
      trackProductClickAction(product.id).catch(console.error);
    }
  };
  
  return (
    <div className="w-full bg-white rounded-2xl p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group border border-gray-100">
      
      {/* Optional Flash Deal Badge */}
      {isFlashDeal && (
        <div className="absolute top-0 left-0 z-10 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-br-xl rounded-tl-2xl shadow-sm flex items-center gap-1 pointer-events-none">
          <span className="text-sm leading-none">⚡</span> DEAL
        </div>
      )}

      {/* Image Area */}
      <Link href={`/${country}/producto/${product.id}`} className="block relative" onClick={handleCardClick}>
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 p-4 flex items-center justify-center mt-2 group-hover:bg-gray-100 transition-colors">
          {primaryMedia ? (
            <img src={primaryMedia} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-xs text-neutral font-medium opacity-50">{dict?.sellerProfile?.noImage || 'Sin imagen'}</span>
          )}
        </div>
        
        {/* Marketplace Signals Overlays */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
          {product.Metrics?.salesCount > 0 && (
            <span className="bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-orange-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {product.Metrics.salesCount}
            </span>
          )}
          {product.Metrics?.views > 0 && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-gray-100 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {product.Metrics.views}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1">
        {/* Category & Seller Context */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider line-clamp-1">
            {product.Category?.name || dict?.sellerProfile?.noCategory || 'Categoria'}
          </span>
          <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1 truncate max-w-[50%]">
            <Store className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{product.Store?.name || dict?.pdp?.unknownSeller || 'Desconocido'}</span>
          </span>
        </div>

        {/* Title */}
        <Link href={`/${country}/producto/${product.id}`} className="hover:underline mt-auto" onClick={handleCardClick}>
          <h3 className="font-bold text-secondary text-sm line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Price & Variants */}
        <div className="flex items-end justify-between mb-4">
          <span className="text-primary font-black text-xl tracking-tight">
            {currencyCode} {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          {product.Variants && product.Variants.length > 1 && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              {product.Variants.length} opciones
            </span>
          )}
        </div>

        {/* CTAs */}
        {product.Variants && product.Variants.length > 0 ? (
          <div className="flex gap-2 mt-auto">
            <Link href={`/${country}/producto/${product.id}`} onClick={handleCardClick} className="flex-1 bg-gray-50 border border-gray-200 text-secondary text-center font-bold py-2 rounded-xl text-xs hover:bg-gray-100 transition-colors flex items-center justify-center">
              {dict?.density?.viewProduct || 'Ver Producto'}
            </Link>
            <div className="flex-1">
              <CheckoutButton
                tenantId={tenantId}
                variantId={product.Variants[0].id}
              />
            </div>
          </div>
        ) : (
          <button disabled className="w-full mt-auto bg-gray-100 text-gray-400 font-bold py-2 rounded-xl text-xs cursor-not-allowed">
            {dict?.pdp?.outOfStock || 'Agotado'}
          </button>
        )}
      </div>
    </div>
  );
}
