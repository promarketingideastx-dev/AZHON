'use client';

import { useEffect } from 'react';

export default function PwaRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('AZHON PWA Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('AZHON PWA Service Worker registration failed:', error);
        });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
