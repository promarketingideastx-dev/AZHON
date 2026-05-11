'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

export default function HeartsSoft({ config }: { config: SeasonEffectConfig }) {
  // Density controls how many elements we generate (1-100 mapped to actual counts)
  const count = Math.max(10, Math.min(30, Math.floor(config.density * 0.3)));
  
  return (
    <>
      <style>{`
        .effect-heart {
          position: absolute;
          width: 16px;
          height: 16px;
          opacity: 0;
          animation: floatHeart 8s ease-in infinite;
        }
        @keyframes floatHeart {
          0% {
            transform: translateY(100%) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(1.5) rotate(360deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-heart {
            animation-duration: 20s !important;
            opacity: 0.3 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 8;
          const duration = 6 + Math.random() * 6;
          const size = 0.5 + Math.random() * 1;

          return (
            <svg
              key={i}
              className="effect-heart text-red-500/40"
              style={{
                left: \`\${left}%\`,
                bottom: '-20px',
                animationDelay: \`\${delay}s\`,
                animationDuration: \`\${duration}s\`,
                transform: \`scale(\${size})\`,
                fill: 'currentColor',
              }}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          );
        })}
      </div>
    </>
  );
}
