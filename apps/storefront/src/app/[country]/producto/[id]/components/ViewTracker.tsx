'use client';

import { useEffect, useRef } from 'react';
import { trackProductViewAction } from '@/lib/events/tracking.actions';

export function ViewTracker({ productId }: { productId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      // Delay tracking slightly to ensure it's a real view, not a bounce (e.g. 2 seconds)
      const timer = setTimeout(() => {
        trackProductViewAction(productId).catch(console.error);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [productId]);

  return null;
}
