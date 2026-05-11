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
    <div className="w-full bg-white rounded-2xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group border border-gray-100">
      
      {/* Optional Flash Deal Badge */}
      {isFlashDeal && (
        <div className="absolute top-0 left-0 z-10 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-br-lg rounded-tl-2xl shadow-sm flex items-center gap-1 pointer-events-none uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> OFERTA
        </div>
      )}

      {/* Image Area */}
      <Link href={`/${country}/producto/${product.id}`} className="block relative" onClick={handleCardClick}>
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2.5 p-1.5 flex items-center justify-center mt-1 group-hover:bg-gray-100 transition-colors">
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
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
            {product.Category?.name || dict?.sellerProfile?.noCategory || 'Categoria'}
          </span>
          <span className="text-[9px] font-medium text-gray-500 flex items-center gap-1 truncate max-w-[50%]">
            <Store className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{product.Store?.name || dict?.pdp?.unknownSeller || 'Desconocido'}</span>
          </span>
        </div>

        {/* Title */}
        <Link href={`/${country}/producto/${product.id}`} className="hover:underline mt-0.5" onClick={handleCardClick}>
          <h3 className="font-bold text-secondary text-sm line-clamp-2 leading-tight mb-1.5 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price & Variants */}
        <div className="flex items-end justify-between mt-auto mb-2.5">
          <span className="text-gray-900 font-black text-2xl tracking-tighter leading-none">
            {currencyCode} {(product.basePrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          {product.Variants && product.Variants.length > 1 && (
            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {product.Variants.length} opciones
            </span>
          )}
        </div>

        {/* CTAs */}
        {product.Variants && product.Variants.length > 0 ? (
          <div className="flex gap-1.5 mt-auto">
            <Link href={`/${country}/producto/${product.id}`} onClick={handleCardClick} className="flex-1 bg-orange-50/50 border border-orange-100 text-orange-600 text-center font-bold py-2 rounded-xl text-xs hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center">
              {dict?.density?.viewProduct || 'Ver'}
            </Link>
            <div className="flex-1">
              <CheckoutButton
                tenantId={tenantId}
                variantId={product.Variants[0].id}
              />
            </div>
          </div>
        ) : (
          <button disabled className="w-full mt-auto bg-gray-50 text-gray-400 font-bold py-2 rounded-xl text-xs cursor-not-allowed border border-gray-100">
            {dict?.pdp?.outOfStock || 'Agotado'}
          </button>
        )}
      </div>
    </div>
  );
}
