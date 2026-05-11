'use client';

import React, { useState } from 'react';

interface ProductMedia {
  id: string;
  url: string;
  position: number;
}

interface ProductGalleryProps {
  media: ProductMedia[];
  fallbackImageUrl?: string | null;
  productTitle: string;
}

export function ProductGallery({ media, fallbackImageUrl, productTitle }: ProductGalleryProps) {
  // Use the first media item as default, or fallback to the legacy imageUrl, or null
  const defaultImage = media && media.length > 0 ? media[0].url : fallbackImageUrl || null;
  
  const [activeImage, setActiveImage] = useState<string | null>(defaultImage);

  if (!defaultImage) {
    return (
      <div className="aspect-square bg-[#FCF9F6] rounded-3xl overflow-hidden p-4 md:p-8 flex items-center justify-center border border-gray-100 shadow-sm relative">
        <div className="text-neutral font-medium">Sin imagen disponible</div>
      </div>
    );
  }

  // If we only have 1 image (or just the legacy one), render simple view
  if (!media || media.length <= 1) {
    return (
      <div className="aspect-square bg-[#FCF9F6] rounded-3xl overflow-hidden p-4 md:p-8 flex items-center justify-center border border-gray-100 shadow-sm relative">
        <img 
          src={defaultImage} 
          alt={productTitle} 
          className="w-full h-full object-contain mix-blend-multiply" 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Hero Viewer */}
      <div className="aspect-square bg-[#FCF9F6] rounded-3xl overflow-hidden p-4 md:p-8 flex items-center justify-center border border-gray-100 shadow-sm relative transition-all duration-300">
        <img 
          src={activeImage!} 
          alt={productTitle} 
          className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300" 
        />
      </div>

      {/* Thumbnails Grid (Minimum 4 layout) */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
        {media.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveImage(item.url)}
            className={`aspect-square w-full rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-[#FCF9F6] p-1.5 md:p-2 flex items-center justify-center ${
              activeImage === item.url 
                ? 'border-primary ring-2 ring-primary/20 scale-95' 
                : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
            }`}
          >
            <img 
              src={item.url} 
              alt={`Thumbnail ${item.position}`} 
              className="w-full h-full object-contain mix-blend-multiply" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
