'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

// SVG Paths for premium product representations
const PRODUCT_PATHS = [
  // Smartphone
  "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z",
  // Laptop
  "M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z",
  // Shopping Bag
  "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z",
  // Gift
  "M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1h-4v-2h4zM9 4c.55 0 1 .45 1 1h-4c0-.55.45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76 12 7.4l1 1.36L15.38 12 17 10.83 14.92 8H20v6z",
  // Smartwatch
  "M15 1H9v2.07C7.28 3.55 6 5.6 6 8s1.28 4.45 3 4.93V15h6v-2.07c1.72-.48 3-2.53 3-4.93s-1.28-4.45-3-4.93V1zm-3 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z",
  // Headphones
  "M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"
];

export default function ProductRain({ config }: { config: SeasonEffectConfig }) {
  // Use a healthy amount of products raining to create an impact
  const count = Math.max(15, Math.min(40, Math.floor(config.density * 0.4)));

  return (
    <>
      <style>{`
        .effect-product {
          position: absolute;
          opacity: 0;
          animation: rainProducts linear infinite;
          filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5));
        }
        @keyframes rainProducts {
          0% {
            transform: translateY(-50px) rotate(-15deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(15deg) scale(1.2);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-product {
            animation-duration: 25s !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 8;
          const duration = 6 + Math.random() * 8;
          const pathIndex = Math.floor(Math.random() * PRODUCT_PATHS.length);
          const size = 32 + Math.random() * 32;

          return (
            <svg
              key={i}
              className="effect-product text-white/60"
              style={{
                left: left + '%',
                top: '-50px',
                width: size + 'px',
                height: size + 'px',
                animationDelay: delay + 's',
                animationDuration: duration + 's',
                fill: 'currentColor',
              }}
              viewBox="0 0 24 24"
            >
              <path d={PRODUCT_PATHS[pathIndex]} />
            </svg>
          );
        })}
      </div>
    </>
  );
}
